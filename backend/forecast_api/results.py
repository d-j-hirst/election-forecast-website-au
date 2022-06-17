from forecast_api.models import Election
import requests
from bs4 import BeautifulSoup

election_wiki_desc_dict = {
    'fed': '_Australian_federal_election_(House_of_Representatives)',
    'nsw': '_New_South_Wales_state_election_(Legislative_Assembly)',
    'vic': '_Victorian_state_election_(Legislative_Assembly)',
    'qld': '_Queenland_state_election',
    'wa': '_Western_Australian_state_election_(Legislative_Assembly)',
    'sa': '_South_Australian_state_election_(House_of_Assembly)',
}

party_convert = {
    '2022fed': {
        'Labor': 'ALP',
        'Liberal': 'LNP',
        'National': 'LNP',
        'Liberal National (Qld)': 'LNP',
        'Coalition': 'LNP',
        'Country Liberal (NT)': 'LNP',
        'Greens': 'GRN',
        'One Nation': 'ONP',
        'United Australia Party': 'UAP',
        'Centre Alliance': 'CA',
        "Katter's Australian": 'KAP',
        'Independents': 'IND',
    },
    '2022sa': {
        'Labor': 'ALP',
        'Liberal': 'LNP',
        'Greens': 'GRN',
        'Independents': 'IND',
    },
}

remove_from_overall_fp = {
    '2022fed': {'CA', 'KAP', 'IND'},
    '2022sa': {'IND'}
}

def update_results(election: Election):
    year = election.code[:4]
    region = election.code[4:]
    url = f'https://en.wikipedia.org/wiki/Results_of_the_{year}{election_wiki_desc_dict[region]}'
    r = requests.get(url)
    soup = BeautifulSoup(r.content, 'html.parser')
    table = soup.find(class_='mw-parser-output').find(class_='wikitable', recursive=False)
    rows = table.find_all('tr')
    doingTpp = False
    overall_fp = {}
    seats = {}
    overall_tpp = 0
    for row in rows:
        if row.text.strip()[:19] == 'Two-party-preferred':
            doingTpp = True
            continue
        cols = row.find_all('td')
        if len(cols) < 6: continue
        name = cols[1].text.strip()
        if name not in party_convert[election.code]: continue
        if name == 'National' and region == 'sa': continue
        code = party_convert[election.code][name]
        if name == 'National' and region == 'wa': code = 'NP'
        vote_share = float(cols[3].text)
        if doingTpp and code == 'ALP':
            overall_tpp = vote_share
        elif not doingTpp:
            seat_count = int(cols[5].text)
            if code not in overall_fp:
                overall_fp[code] = vote_share
                seats[code] = seat_count
            else:
                overall_fp[code] += vote_share
                seats[code] += seat_count
    total_fp = 0
    for code, vote_share in list(overall_fp.items()):
        if code in remove_from_overall_fp[election.code]:
            print(f'{code} seats: {seats[code]}')
            del overall_fp[code]
            continue
        total_fp += vote_share
        print(f'Overall {code} FP: {vote_share}%, seats: {seats[code]}')
    overall_fp['OTH'] = 100 - total_fp
    print(f'Overall OTH FP: {overall_fp["OTH"]}%')
    print(f'Overall ALP TPP: {overall_tpp}%')