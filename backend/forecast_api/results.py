from forecast_api.models import Election
import requests
from bs4 import BeautifulSoup


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


class OverallResults:
    def __init__(self):
        self.fp = {}
        self.seats = {}
        self.tpp = 0


def fetch_overall_results(election: Election):
    election_wiki_desc_dict = {
        'fed': '_Australian_federal_election_(House_of_Representatives)',
        'nsw': '_New_South_Wales_state_election_(Legislative_Assembly)',
        'vic': '_Victorian_state_election_(Legislative_Assembly)',
        'qld': '_Queenland_state_election',
        'wa': '_Western_Australian_state_election_(Legislative_Assembly)',
        'sa': '_South_Australian_state_election_(House_of_Assembly)',
    }
    remove_from_overall_fp = {
        '2022fed': {'CA', 'KAP', 'IND'},
        '2022sa': {'IND'}
    }
    overall_results = OverallResults()
    year = election.code[:4]
    region = election.code[4:]
    url = ('https://en.wikipedia.org/wiki/Results_of_the_' +
        f'{year}{election_wiki_desc_dict[region]}')
    r = requests.get(url)
    soup = BeautifulSoup(r.content, 'html.parser')
    table = soup.find(class_='mw-parser-output').find(class_='wikitable', recursive=False)
    rows = table.find_all('tr')
    doingTpp = False
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
            overall_results.tpp = vote_share
        elif not doingTpp:
            seat_count = int(cols[5].text)
            if code not in overall_results.fp:
                overall_results.fp[code] = vote_share
                overall_results.seats[code] = seat_count
            else:
                overall_results.fp[code] += vote_share
                overall_results.seats[code] += seat_count
    total_fp = 0
    for code, vote_share in list(overall_results.fp.items()):
        if code in remove_from_overall_fp[election.code]:
            del overall_results.fp[code]
            continue
        total_fp += vote_share
    overall_results.fp['OTH'] = 100 - total_fp
    return overall_results


def collect_seat_names(election: Election):
    # Use the "candidates" wikipedia page to get all the wikipedia links
    # to all the electorates, it's the most straightforward way
    election_wiki_desc_dict = {
        'fed': '_Australian_federal_election',
        'nsw': '_New_South_Wales_state_election',
        'vic': '_Victorian_state_election',
        'qld': '_Queenland_state_election',
        'wa': '_Western_Australian_state_election',
        'sa': '_South_Australian_state_election'
    }
    year = election.code[:4]
    region = election.code[4:]
    url = ('https://en.wikipedia.org/wiki/Candidates_of_the_' +
        f'{year}{election_wiki_desc_dict[region]}')
    r = requests.get(url)
    soup = BeautifulSoup(r.content, 'html.parser')
    tables = soup.find(class_='mw-parser-output').find_all(class_='wikitable')
    urls = []
    for table in tables:
        rows = table.find_all('tr')
        first_heading = rows[0].find('th')
        if first_heading is None: continue
        if first_heading.text.strip() != 'Electorate': continue
        for row in rows:
            first_cell = row.find('td')
            if first_cell is None: continue
            if '(' in first_cell.text: continue
            link = first_cell.find('a')
            if link is None: continue
            seat_specific = link["href"].strip()[6:]
            urls.append(f'https://en.wikipedia.org/wiki/Electoral_results_for_the_{seat_specific}')
    return urls


def update_results(election: Election):
    overall_results = fetch_overall_results(election)
    urls = collect_seat_names(election)
    collect_seat_names(election)
    for code, vote_share in list(overall_results.fp.items()):
        print(f'Overall {code} FP: {vote_share:.2f}%')
    for code, seats in list(overall_results.seats.items()):
        print(f'Overall {code} seats: {seats}')
    print(f'Overall ALP TPP: {overall_results.tpp:.2f}%')
    print('Seat URLs')
    for url in urls:
        print(url)