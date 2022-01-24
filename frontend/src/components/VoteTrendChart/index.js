import React, { useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { intMap, intMapReverse } from '../../utils/intmap.js'
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

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

const colours = [["ALP", ["#FF0000", "#FF4444", "#FFAAAA", "#FFCCCC"]],
                 ["LNP", ["#0000FF", "#4444FF", "#AAAAFF", "#CCCCFF"]],
                 ["GRN", ["#008800", "#22CC00", "#66FF44", "#BBFF99"]],
                 ["ONP", ["#AA6600", "#FF7F00", "#FFAB58", "#FFC388"]],
                 ["UAP", ["#886600", "#C2B615", "#EBDF43", "#F0E87C"]],
                 ["OTH", ["#777777", "#999999", "#C5C5C5", "#E0E0E0"]]];

const VoteTrendChart = props => {
    const [ isFp, setIsFp ] = useState(false);
    const [ party, setParty ] = useState("LNP");

    const getPartyIndexFromAbbr = abbr => intMapReverse(props.forecast.partyAbbr, abbr, undefined, a => a >= -1);

    const partyHasFpTrend = abbr => {
        return props.forecast.fpTrend.find(a => a[0] === getPartyIndexFromAbbr(abbr)) !== undefined;
    }
    
    const getTrendFromAbbr = abbr => {
        return intMap(props.forecast.fpTrend, getPartyIndexFromAbbr(abbr));
    }

    let thisTrend = undefined;
    if (!isFp) {
        thisTrend = props.forecast.tppTrend;
    }
    else {
        thisTrend = getTrendFromAbbr(party);
    }
    const period = props.forecast.trendPeriod;
    const finalDay = props.forecast.finalTrendValue;
    const dateParts = props.forecast.trendStartDate.split("-");
    const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    let chartData = undefined;
    if (!isFp && party === "LNP") {
        thisTrend = thisTrend.map(spread => [...spread].reverse().map(a => 100 - a));
    }
    chartData = thisTrend.map((spread, index) => {
        return {
            "day": dateToStr(addDays(date, index * period)),
            "median": [round(spread[3])],
            "25-75": [round(spread[2]), round(spread[4])],
            "5-95": [round(spread[1]), round(spread[5])],
            "1-99": [round(spread[0]), round(spread[6])]
        };
    });
    chartData.at(-1).day = dateToStr(addDays(date, finalDay));
    const maxVal = thisTrend.reduce((prev, spread) => {
        return Math.max(prev, spread.at(-1));
    }, 0);
    const minVal = thisTrend.reduce((prev, spread) => {
        return Math.min(prev, spread[0]);
    }, 100);
    const tickDistance = 2;
    const minTick = Math.floor(minVal / tickDistance) * tickDistance;
    const numTicks = Math.floor((maxVal - minTick) / tickDistance) + 1;
    let ticks = [...Array(Math.abs(numTicks)).keys()].map(n => n * tickDistance + minTick);
    const currentColours = intMap(colours, party);


    const setAlpTpp = () => {setIsFp(false); setParty("ALP");};
    const setLnpTpp = () => {setIsFp(false); setParty("LNP");};
    const setAlpFp = () => {setIsFp(true); setParty("ALP");};
    const setLnpFp = () => {setIsFp(true); setParty("LNP");};
    const setGrnFp = () => {setIsFp(true); setParty("GRN");};
    const setOnpFp = () => {setIsFp(true); setParty("ONP");};
    const setUapFp = () => {setIsFp(true); setParty("UAP");};
    const setOthFp = () => {setIsFp(true); setParty("OTH");};

    const dropdownTitle = party + (isFp ? " first preferences" : " two-party vote");

    return (
        <>
            <DropdownButton id="dropdown-basic-button" title={dropdownTitle} variant="secondary">
                <Dropdown.Item as="button" onClick={setAlpTpp}>ALP two-party vote</Dropdown.Item>
                <Dropdown.Item as="button" onClick={setLnpTpp}>LNP two-party vote</Dropdown.Item>
                <Dropdown.Item as="button" onClick={setAlpFp}>ALP first preferences</Dropdown.Item>
                <Dropdown.Item as="button" onClick={setLnpFp}>LNP first preferences</Dropdown.Item>
                <Dropdown.Item as="button" onClick={setGrnFp}>GRN first preferences</Dropdown.Item>
                {
                    partyHasFpTrend("ONP") &&
                    <Dropdown.Item as="button" onClick={setOnpFp}>ONP first preferences</Dropdown.Item>
                }
                {
                    partyHasFpTrend("UAP") &&
                    <Dropdown.Item as="button" onClick={setUapFp}>UAP first preferences</Dropdown.Item>
                }
                <Dropdown.Item as="button" onClick={setOthFp}>OTH first preferences</Dropdown.Item>
            </DropdownButton>
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
                    <Area dataKey="1-99" type="number" stroke="none" isAnimationActive={false} fill={currentColours[3]} />
                    <Area dataKey="5-95" type="number" stroke="none" isAnimationActive={false} fill={currentColours[2]} />
                    <Area dataKey="25-75" type="number" stroke="none" isAnimationActive={false} fill={currentColours[1]} />
                    <Line dataKey="median" type="number" dot={false} isAnimationActive={false} stroke={currentColours[0]} fill="none" />
                    <Tooltip />
                </ComposedChart>
            </ResponsiveContainer>
        </>
    )
}

export default VoteTrendChart;