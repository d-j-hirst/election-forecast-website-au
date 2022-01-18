import React from 'react';
import { ComposedChart, Line, XAxis, YAxis, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { intMap } from '../../utils/intmap.js'

const round = num => Math.round(num * 100) / 100;

const addDays = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

const dateToStr = date => {
    var dateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return dateUTC.toISOString().slice(0, 10);
}

const VoteTrendChart = props => {
    const thisTrend = props.forecast.tppTrend;
    const period = props.forecast.trendPeriod;
    const finalDay = props.forecast.finalTrendValue;
    const dateParts = props.forecast.trendStartDate.split("-");
    console.log(dateParts);
    const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    console.log(date);
    console.log(addDays(date, period));
    const chartData = thisTrend.map((spread, index) => {
        return {
            "day": dateToStr(addDays(date, index * period)),
            "median": [round(spread[3])],
            "25-75": [round(spread[2]), round(spread[4])],
            "5-95": [round(spread[1]), round(spread[5])],
            "1-99": [round(spread[0]), round(spread[6])]
        };
    });
    chartData.at(-1).day = dateToStr(addDays(date, finalDay));
    console.log(chartData);
    const maxVal = thisTrend.reduce((prev, spread) => {
        return Math.max(prev, spread.at(-1));
    }, 0);
    const minVal = thisTrend.reduce((prev, spread) => {
        return Math.min(prev, spread[0]);
    }, 100);
    const tickDistance = 2;
    const minTick = Math.floor(minVal / tickDistance) * tickDistance;
    const numTicks = Math.floor((maxVal - minTick) / tickDistance) + 1;
    const ticks = [...Array(numTicks).keys()].map(n => n * tickDistance + minTick);

    return (
        <>
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                    width={730}
                    height={250}
                    data={chartData}
                    margin={{
                    top: 20, right: 20, bottom: 20, left: 20,
                    }}
                >
                    <XAxis dataKey="day" />
                    <YAxis type="number" domain={[minVal, maxVal]} ticks={ticks}/>
                    <Area dataKey="1-99" type="number" stroke="none" fill="#FFCCCC" />
                    <Area dataKey="5-95" type="number" stroke="none" fill="#FFAAAA" />
                    <Area dataKey="25-75" type="number" stroke="none" fill="#FF4444" />
                    <Line dataKey="median" type="number" dot={false} stroke="#FF0000" fill="none" />
                    <Tooltip />
                </ComposedChart>
            </ResponsiveContainer>
        </>
    )
}

export default VoteTrendChart;