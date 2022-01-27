import React from 'react';
import Chart from "react-google-charts";
import { jsonMap } from '../../utils/jsonmap.js'

const GovernmentFormationChart = props => {
    const partyOneName = jsonMap(props.forecast.partyAbbr, 0);
    const partyOneVals = [jsonMap(props.forecast.overallWinPc, 0),
                     jsonMap(props.forecast.majorityWinPc, 0),
                     jsonMap(props.forecast.minorityWinPc, 0),
                     jsonMap(props.forecast.mostSeatsWinPc, 0)];
    partyOneVals.push(Math.max(0, partyOneVals[0] - partyOneVals[1] - partyOneVals[2] - partyOneVals[3]));
    const partyTwoName = jsonMap(props.forecast.partyAbbr, 1);
    const partyTwoVals = [jsonMap(props.forecast.overallWinPc, 1),
                     jsonMap(props.forecast.majorityWinPc, 1),
                     jsonMap(props.forecast.minorityWinPc, 1),
                     jsonMap(props.forecast.mostSeatsWinPc, 1)];
    partyTwoVals.push(Math.max(0, partyTwoVals[0] - partyTwoVals[1] - partyTwoVals[2] - partyTwoVals[3]));
    let chartData = [];
    chartData.push(['Result', 'Probability']);
    chartData.push([partyOneName + ' majority', partyOneVals[1]])
    chartData.push([partyOneName + ' minority', partyOneVals[2]])
    chartData.push([partyOneName + ' has more seats', partyOneVals[3]])
    chartData.push([partyOneName + ' allocated ties', partyOneVals[4]])
    chartData.push(['Others', jsonMap(props.forecast.overallWinPc, -1)])
    chartData.push([partyTwoName + ' allocated ties', partyTwoVals[4]])
    chartData.push([partyTwoName + ' has more seats', partyTwoVals[3]])
    chartData.push([partyTwoName + ' minority', partyTwoVals[2]])
    chartData.push([partyTwoName + ' majority', partyTwoVals[1]])
    const sliceFormat = [{color: '#dc3545'},
                         {color: '#ec7480', textStyle: {color: 'black'}},
                         {color: '#f5a3ab', textStyle: {color: 'black'}},
                         {color: '#f7c0c5', textStyle: {color: 'black'}},
                         {color: '#838383'},
                         {color: '#abcaf0', textStyle: {color: 'black'}},
                         {color: '#87b2e7', textStyle: {color: 'black'}},
                         {color: '#5792da', textStyle: {color: 'black'}},
                         {color: '#1467cc'}
    ];

    return (
        <Chart
            width={'300px'}
            height={'300px'}
            chartType="PieChart"
            loader={<div>Loading Chart</div>}
            options={{legend: {position: 'none'},
                      backgroundColor: 'transparent',
                      fontName: 'Segoe UI',
                      fontSize: 14,
                      chartArea: {left: '5%',
                                  top: '5%',
                                  width: '90%',
                                  height: '90%'
                                 },
                      slices: sliceFormat,
                      tooltip: {
                          text: 'percentage',
                          showColorCode: true
                      }
                    }}
            data={chartData}
        />
    )
}

export default GovernmentFormationChart;