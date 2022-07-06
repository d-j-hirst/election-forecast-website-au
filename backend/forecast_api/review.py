from forecast_api.models import Election, Forecast
from typing import List
import math

# Return whether the value is in the central 50% (0), central 90% (1),
# central 99% (2), # central 99.9% (3) or elsewhere (4)
def find_position_in_dist(val: float, dist: List[float]):
    if val >= dist[6] and val <= dist[8]: return 0
    if val >= dist[4] and val <= dist[10]: return 1
    if val >= dist[2] and val <= dist[12]: return 2
    if val >= dist[0] and val <= dist[14]: return 3
    return 4

def perform_review(election: Election, forecasts: List[Forecast]):
    print(election.name)
    forecast = forecasts[0]
    party_abbr = {a[0]: a[1] for a in forecast.report['partyAbbr']}
    party_index = {a[1]: a[0] for a in forecast.report['partyAbbr']
                   if a[0] >= -1}
    seat_names = {i: a for i, a in
                  enumerate(forecast.report['seatNames'])}
    forecast_tpp_dist = forecast.report['tppFrequencies']
    results_tpp = election.results['overall']['tpp']
    tpp_error = results_tpp - forecast_tpp_dist[7]
    tpp_position = find_position_in_dist(results_tpp, forecast_tpp_dist)
    print(tpp_error)
    print(tpp_position)
    
    forecast_fp_dist = forecast.report['fpFrequencies']
    for partyIndex, fp_dist in forecast_fp_dist:
        this_party_abbr = party_abbr[partyIndex]
        if this_party_abbr not in election.results['overall']['fp']: continue
        result_fp = election.results['overall']['fp'][this_party_abbr]
        fp_error = result_fp - fp_dist[7]
        fp_position = find_position_in_dist(result_fp, fp_dist)
        print(this_party_abbr)
        print(fp_error)
        print(fp_position)
    
    forecast_seat_dist = forecast.report['seatCountFrequencies']
    for partyIndex, seat_dist in forecast_seat_dist:
        if partyIndex <= -2: continue
        this_party_abbr = party_abbr[partyIndex]
        if this_party_abbr not in election.results['overall']['seats']:
            continue
        result_seat = election.results['overall']['seats'][this_party_abbr]
        seats_error = result_seat - seat_dist[7]
        seats_position = find_position_in_dist(result_seat, seat_dist)
        print(this_party_abbr)
        print(seats_error)
        print(seats_position)
    
    seat_winners = forecast.report['seatPartyWinFrequencies']
    seat_tcps = forecast.report['seatTcpBands']
    winners_by_name = {seat_names[i]: {party_abbr[b[0]]: b[1] for b in a}
                       for i, a in enumerate(seat_winners)}
    tcps_by_name = {seat_names[i]: 
                    {(b[0][0], b[0][1]): b[1] for b in a}
                    for i, a in enumerate(seat_tcps)}
    print(tcps_by_name)
    seat_results = election.results['seats']
    log_score_sum = 0
    brier_score_sum = 0
    tcp_error_sum = 0
    tpp_error_sum = 0
    tpp_count = 0
    for seat_name, seat_result in seat_results.items():
        winner = max(seat_result['tcp'], key=seat_result['tcp'].get)
        winner_chance = winners_by_name[seat_name][winner]
        log_score = math.log(winner_chance * 0.01)
        brier_score = 0
        for party, chance in winners_by_name[seat_name].items():
            outcome = 1 if winner == party else 0
            diff_sq = (chance * 0.01 - outcome) ** 2
            brier_score += diff_sq
        log_score_sum += log_score
        brier_score_sum += brier_score

        tcp_results = list(seat_result['tcp'].items())
        tcp_scenario = (party_index[tcp_results[0][0]],
                        party_index[tcp_results[1][0]])
        tcp_result = tcp_results[0][1]
        if tcp_scenario[0] > tcp_scenario[1]:
            tcp_scenario = (tcp_scenario[1], tcp_scenario[0])
            tcp_result = 100 - tcp_result
        tcp_forecast = tcps_by_name[seat_name][tcp_scenario][7]
        tcp_error = abs(tcp_forecast - tcp_result)
        tcp_error_sum += tcp_error
        if 0 in tcp_scenario and 1 in tcp_scenario:
            tpp_error_sum += tcp_error
            tpp_count += 1
    print(f'Log score sum: {log_score_sum}')
    num = len(seat_results)
    log_score_average = log_score_sum / num
    print(f'Log score average: {log_score_average}')
    print(f'Brier score sum: {brier_score_sum}')
    brier_score_normalised = brier_score_sum / (2 * num)
    print(f'Final Brier score: {brier_score_normalised}')
    print(f'Tcp error sum: {tcp_error_sum}')
    tcp_error_average = tcp_error_sum / num
    print(f'Tcp error average: {tcp_error_average}')
    tpp_error_average = tpp_error_sum / tpp_count
    print(f'Tpp error average: {tpp_error_average}')
