from forecast_api.models import Election
import json
import requests
import threading
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
        'United Australia': 'UAP',
        'Centre Alliance': 'CA',
        "Katter's Australian": 'KAP',
        'Independents': 'IND',
        'Independent': 'IND',
    },
    '2022sa': {
        'Labor': 'ALP',
        'Liberal': 'LNP',
        'Greens': 'GRN',
        'Independents': 'IND',
    },
}


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
    overall_results = {'fp': {}, 'seats': {}, 'tpp': 0}
    year = election.code[:4]
    region = election.code[4:]
    url = ('https://en.wikipedia.org/wiki/Results_of_the_' +
        f'{year}{election_wiki_desc_dict[region]}')
    r = requests.get(url)
    soup = BeautifulSoup(r.content, 'html.parser')
    table = soup.find(class_='mw-parser-output').find(class_='wikitable', recursive=False)
    rows = table.find_all('tr')
    doing_tpp = False
    for row in rows:
        if row.text.strip()[:19] == 'Two-party-preferred':
            doing_tpp = True
            continue
        cols = row.find_all('td')
        if len(cols) < 6: continue
        name = cols[1].text.strip()
        if name not in party_convert[election.code]: continue
        if name == 'National' and region == 'sa': continue
        code = party_convert[election.code][name]
        if name == 'National' and region == 'wa': code = 'NP'
        vote_share = float(cols[3].text)
        if doing_tpp and code == 'ALP':
            overall_results['tpp'] = vote_share
        elif not doing_tpp:
            seat_count = int(cols[5].text)
            if code not in overall_results['fp']:
                overall_results['fp'][code] = vote_share
                overall_results['seats'][code] = seat_count
            else:
                overall_results['fp'][code] += vote_share
                overall_results['seats'][code] += seat_count
    total_fp = 0
    for code, vote_share in list(overall_results['fp'].items()):
        if code in remove_from_overall_fp[election.code]:
            del overall_results['fp'][code]
            continue
        total_fp += vote_share
    overall_results['fp']['OTH'] = 100 - total_fp
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
            seat_specific = seat_specific.replace('Electoral_', '')
            urls.append(f'https://en.wikipedia.org/wiki/Electoral_results_for_the_{seat_specific}')
    return urls


def fetch_seat_results(election: Election, urls):
    election_text_dict = {
        'fed': 'Australian federal election',
        'nsw': 'New South Wales state election',
        'vic': 'Victorian state election',
        'qld': 'Queenland state election',
        'wa': 'Western Australian state election',
        'sa': 'South Australian state election'
    }
    year = election.code[:4]
    region = election.code[4:]
    election_match = f'{year} {election_text_dict[region]}'

    # Concurrently fetch results while maintaining order
    responses = {url: None for url in urls}
    threads = []
    some_lock = threading.Lock()
    def get_response(url):
        r = requests.get(url)
        with some_lock:
            responses[url]= r
    for url in urls:
        threads.append(threading.Thread(target=get_response, args=(url,)))
        threads[-1].start()
    for thread in threads:
        thread.join()

    all_seat_results = {}
    for url, r in responses.items():
        soup = BeautifulSoup(r.content, 'html.parser')
        tables = (soup.find(class_='mw-parser-output')
                      .find_all(class_='wikitable'))
        for table in tables:
            caption = table.find('caption')
            if caption is None: continue
            caption_links = caption.find_all('a')
            if len(caption_links) < 2: continue
            election_text = caption_links[0].text.strip()
            if election_text != election_match: continue
            seat_text = caption_links[1].text.strip()
            print(f'{caption_links[0].text} {caption_links[1].text}')

            seat_results = {'fp': {}, 'tpp': {}}
            doing_tcp = 0
            rows = table.find_all('tr')
            found_ind = 0
            for row in rows:
                if 'preferred' in row.text and 'Notional' not in row.text:
                    doing_tcp = 1
                    found_ind = 0
                    continue
                elif 'preferred' in row.text:
                    doing_tcp = 2  # Notional count, don't record this
                    continue
                cols = row.find_all('td')
                if len(cols) < 6: continue
                name = cols[1].text.strip()
                if name not in party_convert[election.code]: continue
                if name == 'National' and region == 'sa': continue
                code = party_convert[election.code][name]
                if code == "IND":
                    if found_ind == 0:
                        found_ind = 1
                    elif found_ind == 1:
                        found_ind = 2
                        code = 'IND*'
                    else:
                        continue  # will end up added to "Others"
                if name == 'National' and region == 'wa': code = 'NP'
                vote_share = float(cols[4].text)
                if doing_tcp == 1:
                    seat_results['tpp'][code] = vote_share
                elif doing_tcp == 0:
                    if code not in seat_results['fp']:
                        seat_results['fp'][code] = vote_share
                    else:
                        seat_results['fp'][code] += vote_share
            
            total_fp = 0
            for code, vote_share in list(seat_results['fp'].items()):
                total_fp += vote_share
            others = max(0, round(100 - total_fp, 2))
            if (others): seat_results['fp']['OTH'] = others

            print(seat_results['fp'])
            print(seat_results['tpp'])
            all_seat_results[caption_links[1].text] = seat_results
            break
    return all_seat_results


def update_results(election: Election):
    overall_results = fetch_overall_results(election)
    urls = collect_seat_names(election)
    seat_results = fetch_seat_results(election, urls)
    # for code, vote_share in list(overall_results['fp'].items()):
    #     print(f'Overall {code} FP: {vote_share:.2f}%')
    # for code, seats in list(overall_results['seats'].items()):
    #     print(f'Overall {code} seats: {seats}')
    # print(f'Overall ALP TPP: {overall_results["tpp"]:.2f}%')
    full_results = {'code': election.code,
                    'overall': overall_results,
                    'seats': seat_results}
    json_results = json.dumps(full_results)
    # print(json_results)
    election.results = json_results
    election.results_version += 1
    election.save()