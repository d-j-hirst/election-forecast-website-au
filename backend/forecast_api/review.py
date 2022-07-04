from forecast_api.models import Election, Forecast
from typing import List

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
