import React from 'react';

import { useMediaQuery } from 'react-responsive'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { brightness } from '../../utils/brightness.js'
import { jsonMap } from '../../utils/jsonmap.js'

import styles from './GovernmentFormationChart.module.css';

const round1 = num => num === null ? null : Math.round(num * 10) / 10;

const RADIAN = Math.PI / 180;

const GovernmentFormationChart = props => {
    const lowerLegendRequired = useMediaQuery({ query: '(max-width: 550px)' });

    const partyOneName = jsonMap(props.forecast.partyAbbr, 0);
    const otherWins = 100 - jsonMap(props.forecast.overallWinPc, 0) - jsonMap(props.forecast.overallWinPc, 1)
    const partyOneVals = [jsonMap(props.forecast.overallWinPc, 0),
                     jsonMap(props.forecast.majorityWinPc, 0),
                     jsonMap(props.forecast.minorityWinPc, 0),
                     jsonMap(props.forecast.mostSeatsWinPc, 0)];
    const partyOneTies = Math.max(0, partyOneVals[0] - partyOneVals[1] - partyOneVals[2] - partyOneVals[3]);
    const partyTwoName = jsonMap(props.forecast.partyAbbr, 1);
    const partyTwoVals = [jsonMap(props.forecast.overallWinPc, 1),
                     jsonMap(props.forecast.majorityWinPc, 1),
                     jsonMap(props.forecast.minorityWinPc, 1),
                     jsonMap(props.forecast.mostSeatsWinPc, 1)];
    const partyTwoTies = Math.max(0, partyTwoVals[0] - partyTwoVals[1] - partyTwoVals[2] - partyTwoVals[3]);
    const allTies = partyOneTies + partyTwoTies;
    
    const data = [
        { name: partyOneName + ' majority', value: round1(partyOneVals[1]) },
        { name: partyOneName + ' minority', value: round1(partyOneVals[2]) },
        { name: partyOneName + ' most seats', value: round1(partyOneVals[3]) },
        { name: 'Exact ties', value: round1(allTies) },
        { name: 'Any other party wins', value: round1(otherWins) },
        { name: partyTwoName + ' most seats', value: round1(partyTwoVals[3]) },
        { name: partyTwoName + ' minority', value: round1(partyTwoVals[2]) },
        { name: partyTwoName + ' majority', value: round1(partyTwoVals[1]) },
    ]

    const colors = ['#dc3545', '#ec7480', '#f5a3ab', '#885588', '#888888', '#87b2e7', '#5792da', '#1467cc']
    
    const chartHeight = lowerLegendRequired ? 420 : 320;

    const renderCustomizedLabel = ({
        cx, cy, midAngle, innerRadius, outerRadius, percent, index,
    }) => {
        const value = data[index].value;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.8;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
      
        if (value < 4) return null;

        const fillColor = brightness(colors[index]) > 130 ? "black" : "white";
      
        return (
          <text x={x} y={y} fill={fillColor} textAnchor="middle" dominantBaseline="central">
            {`${value}%`}
          </text>
        );
    }

    const ChartTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
            <div className={styles.customTooltip}>
                <p>{payload[0].name} - {payload[0].value}%</p>
            </div>
            );
        }
    
        return null;
    };

    const renderColorfulLegendText = (value, entry) => {
        return <span className={styles.legendLabel}>{value}</span>;
      };

    return (
        <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart width={300} height={chartHeight}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    legendType={'square'}
                    outerRadius={145}
                    fill="#8884d8"
                    dataKey="value"
                    isAnimationActive={false}
                    label={renderCustomizedLabel}
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
                </Pie>
                <Tooltip content={<ChartTooltip />}isAnimationActive={false} />
                <Legend formatter={renderColorfulLegendText}
                        align={lowerLegendRequired ? "center" : "right"}
                        layout={lowerLegendRequired ? "horizontal" : "vertical"}
                        verticalAlign={lowerLegendRequired ? "bottom" : "middle"}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}

export default GovernmentFormationChart;