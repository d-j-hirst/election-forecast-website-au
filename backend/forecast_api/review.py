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
    response = ""
    print('========================================')
    print(f'*** {election.name} ***')
    for forecast in forecasts:
        print('========================================')
        label = forecast.report['reportLabel']
        print(label)
        print('========================================')
        party_abbr = {a[0]: a[1] for a in forecast.report['partyAbbr']}
        party_index = {a[1]: a[0] for a in forecast.report['partyAbbr']
                    if a[0] >= -1}
        # This fixes an issue with going LIB -> LNP part way through
        # the SA election forecast
        if election.code == '2022sa' and 'LIB' in party_index:
            party_index['LNP'] = party_index['LIB']
            party_abbr[1] = 'LNP'
        party_index['IND*'] = -2
        seat_names = {i: a for i, a in
                    enumerate(forecast.report['seatNames'])}
        forecast_tpp_dist = forecast.report['tppFrequencies']
        results_tpp = election.results['overall']['tpp']
        tpp_error = results_tpp - forecast_tpp_dist[7]
        tpp_position = find_position_in_dist(results_tpp, forecast_tpp_dist)
        # print(party_abbr)
        # print(tpp_error)
        # print(tpp_position)
        
        forecast_fp_dist = forecast.report['fpFrequencies']
        for partyIndex, fp_dist in forecast_fp_dist:
            this_party_abbr = party_abbr[partyIndex]
            if this_party_abbr not in election.results['overall']['fp']: continue
            result_fp = election.results['overall']['fp'][this_party_abbr]
            fp_error = result_fp - fp_dist[7]
            fp_position = find_position_in_dist(result_fp, fp_dist)
            # print(this_party_abbr)
            # print(fp_error)
            # print(fp_position)
        
        forecast_seat_dist = forecast.report['seatCountFrequencies']
        for partyIndex, seat_dist in forecast_seat_dist:
            if partyIndex <= -2: continue
            this_party_abbr = party_abbr[partyIndex]
            if this_party_abbr not in election.results['overall']['seats']:
                continue
            result_seat = election.results['overall']['seats'][this_party_abbr]
            seats_error = result_seat - seat_dist[7]
            seats_position = find_position_in_dist(result_seat, seat_dist)
            # print(this_party_abbr)
            # print(seats_error)
            # print(seats_position)
        
        seat_winners = forecast.report['seatPartyWinFrequencies']
        seat_tcps = forecast.report['seatTcpBands']
        seat_fps = forecast.report['seatFpBands']
        winners_by_name = {seat_names[i]: {party_abbr[b[0]]: b[1] for b in a}
                        for i, a in enumerate(seat_winners)}
        tcps_by_name = {seat_names[i]: 
                        {(b[0][0], b[0][1]): b[1] for b in a}
                        for i, a in enumerate(seat_tcps)}
        fps_by_name = {seat_names[i]: 
                    {b[0]: b[1] for b in a}
                    for i, a in enumerate(seat_fps)}
        seat_results = election.results['seats']
        log_score_sum = 0
        brier_score_sum = 0
        tcp_error_sum = 0
        tpp_error_sum = 0
        tpp_count = 0
        fp_error_sum = 0
        fp_error_sum_party = {}
        fp_count_party = {}
        fp_count = 0
        tcp_central_50pc = 0
        tcp_central_90pc = 0
        tcp_central_98pc = 0
        tcp_central_998pc = 0
        fp_central_50pc = 0
        fp_central_90pc = 0
        fp_central_98pc = 0
        fp_central_998pc = 0
        fp_central_50pc_party = {}
        fp_central_90pc_party = {}
        fp_central_98pc_party = {}
        fp_central_998pc_party = {}
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
                tcp_results = [tcp_results[1], tcp_results[0]]
                tcp_result = 100 - tcp_result
            # Account for changing from IND* to IND
            if tcp_scenario not in tcps_by_name[seat_name]:
                if tcp_results[0][0] == "IND":
                    tcp_scenario = (-2, tcp_scenario[1])
                if tcp_results[1][0] == "IND":
                    tcp_scenario = (tcp_scenario[0], -2)
            if tcp_scenario in tcps_by_name[seat_name]:
                tcp_forecast_dist = tcps_by_name[seat_name][tcp_scenario]
                tcp_forecast = tcp_forecast_dist[7]
                tcp_error = abs(tcp_forecast - tcp_result)
                tcp_error_sum += tcp_error
                if 0 in tcp_scenario and 1 in tcp_scenario:
                    tpp_error_sum += tcp_error
                    tpp_count += 1
                tcp_position = find_position_in_dist(tcp_result, tcp_forecast_dist)
                if tcp_position == 0: tcp_central_50pc += 1
                if tcp_position <= 1: tcp_central_90pc += 1
                if tcp_position <= 2: tcp_central_98pc += 1
                if tcp_position <= 3: tcp_central_998pc += 1

            fp_results = list(seat_result['fp'].items())
            for party, fp_result in fp_results:
                this_index = party_index[party]
                if this_index not in fps_by_name[seat_name]: continue
                # if this is uncommented it's to ignore results that
                # were the result of the Others-bug
                if fp_result == 0: continue
                fp_forecast_dist = fps_by_name[seat_name][this_index]
                fp_forecast = fp_forecast_dist[7]
                fp_forecast_max = fp_forecast_dist[14]
                if fp_forecast_max == 0: continue
                fp_error = abs(fp_forecast - fp_result)
                # print(f'{seat_name}, {party} ({this_index}) - forecast: {fp_forecast} (max {fp_forecast_max}), result: {fp_result}, error: {fp_error}')
                fp_error_sum += fp_error
                fp_count += 1
                fp_error_sum_party[party] = (
                    fp_error_sum_party.get(party, 0) + fp_error)
                fp_count_party[party] = fp_count_party.get(party, 0) + 1
                fp_position = find_position_in_dist(fp_result, fp_forecast_dist)
                if fp_position == 0:
                    fp_central_50pc += 1
                    fp_central_50pc_party[party] = (
                        fp_central_50pc_party.get(party, 0) + 1)
                if fp_position <= 1:
                    fp_central_90pc += 1
                    fp_central_90pc_party[party] = (
                        fp_central_90pc_party.get(party, 0) + 1)
                if fp_position <= 2:
                    fp_central_98pc += 1
                    fp_central_98pc_party[party] = (
                        fp_central_98pc_party.get(party, 0) + 1)
                if fp_position <= 3:
                    fp_central_998pc += 1
                    fp_central_998pc_party[party] = (
                        fp_central_998pc_party.get(party, 0) + 1)
        fp_error_sum_party = dict(sorted(fp_error_sum_party.items()))
        fp_central_50pc_party = dict(sorted(fp_central_50pc_party.items()))
        fp_central_90pc_party = dict(sorted(fp_central_90pc_party.items()))
        fp_central_98pc_party = dict(sorted(fp_central_98pc_party.items()))
        fp_central_998pc_party = dict(sorted(fp_central_998pc_party.items()))
        if forecast == forecasts[0]:
            response += ('Forecast label,Log score average,Brier score'
                        'normalised,Tcp error average,Tpp error average,'
                        'Tcp central 50%,Tcp central 90%,Tcp central 98%,'
                        'Tcp central 99.8%,Fp error average,Fp central 50%,'
                        'Fp central 90%,Fp central 98%,Fp central 99.8%')
            response += '\n'
        label = label.replace(',', ';') # Avoid issues when converting to CSV
        response += label
        print(f'Log score sum: {log_score_sum}')
        num = len(seat_results)
        log_score_average = log_score_sum / num
        response += f',{log_score_average}'
        print(f'Log score average: {log_score_average}')
        print(f'Brier score sum: {brier_score_sum}')
        brier_score_normalised = brier_score_sum / (2 * num)
        response += f',{brier_score_normalised}'
        print(f'Final Brier score: {brier_score_normalised}')
        print(f'Tcp error sum: {tcp_error_sum}')
        tcp_error_average = tcp_error_sum / num
        response += f',{tcp_error_average}'
        print(f'Tcp error average: {tcp_error_average}')
        tpp_error_average = tpp_error_sum / tpp_count
        response += f',{tpp_error_average}'
        print(f'Tpp error average: {tpp_error_average}')
        tcp_central_50pc /= num
        tcp_central_90pc /= num
        tcp_central_98pc /= num
        tcp_central_998pc /= num
        response += f',{tcp_central_50pc}'
        response += f',{tcp_central_90pc}'
        response += f',{tcp_central_98pc}'
        response += f',{tcp_central_998pc}'
        print(f'Tcp 50% range frequency: {tcp_central_50pc}')
        print(f'Tcp 90% range frequency: {tcp_central_90pc}')
        print(f'Tcp 98% range frequency: {tcp_central_98pc}')
        print(f'Tcp 998% range frequency: {tcp_central_998pc}')
        fp_error_average = fp_error_sum / fp_count
        response += f',{fp_error_average}'
        print(f'Fp error average: {fp_error_average}')
        fp_central_50pc /= fp_count
        fp_central_90pc /= fp_count
        fp_central_98pc /= fp_count
        fp_central_998pc /= fp_count
        response += f',{fp_central_50pc}'
        response += f',{fp_central_90pc}'
        response += f',{fp_central_98pc}'
        response += f',{fp_central_998pc}'
        print(f'Fp 50% range frequency: {fp_central_50pc}')
        print(f'Fp 90% range frequency: {fp_central_90pc}')
        print(f'Fp 98% range frequency: {fp_central_98pc}')
        print(f'Fp 998% range frequency: {fp_central_998pc}')
        for party, fp_sum in fp_error_sum_party.items():
            fp_average = fp_sum / fp_count_party[party]
            print(f'Fp error average for {party}: {fp_average}')
        for party, fp_sum in fp_central_50pc_party.items():
            fp_average = fp_sum / fp_count_party[party]
            print(f'Fp 50% range frequency for {party}: {fp_average}')
        for party, fp_sum in fp_central_90pc_party.items():
            fp_average = fp_sum / fp_count_party[party]
            print(f'Fp 90% range frequency for {party}: {fp_average}')
        for party, fp_sum in fp_central_98pc_party.items():
            fp_average = fp_sum / fp_count_party[party]
            print(f'Fp 98% range frequency for {party}: {fp_average}')
        for party, fp_sum in fp_central_998pc_party.items():
            fp_average = fp_sum / fp_count_party[party]
            print(f'Fp 998% range frequency for {party}: {fp_average}')
        response += '\n'
    return response
