import React, { useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, ZAxis, Area, Scatter, Tooltip, ResponsiveContainer } from 'recharts';
import { jsonMap, jsonMapReverse } from '../../utils/jsonmap.js'
import { deepCopy } from '../../utils/deepcopy.js'
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

const round1 = num => Math.round(num * 10) / 10;
const round2 = num => Math.round(num * 100) / 100;

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
    const [ party, setParty ] = useState("ALP");

    const getPartyIndexFromAbbr = abbr => jsonMapReverse(props.forecast.partyAbbr, abbr, undefined, a => a >= -1);

    const partyHasFpTrend = abbr => {
        return props.forecast.fpTrend.find(a => a[0] === getPartyIndexFromAbbr(abbr)) !== undefined;
    }
    
    const getTrendFromAbbr = abbr => {
        return jsonMap(props.forecast.fpTrend, getPartyIndexFromAbbr(abbr));
    }

    const invertPoll = poll => {
        poll.adjusted = 100 - poll.adjusted;
        poll.base = 100 - poll.base;
        poll.adjusted = 100 - poll.adjusted;
        return poll;
    }

    let thisTrend = undefined;
    let thisPolls = undefined;
    if (!isFp) {
        thisTrend = deepCopy(props.forecast.tppTrend);
        thisPolls = deepCopy(props.forecast.polls["@TPP"]);
    }
    else {
        thisTrend = deepCopy(getTrendFromAbbr(party));
        thisPolls = deepCopy(props.forecast.polls[party]);
    }
    const period = props.forecast.trendPeriod;
    const finalDay = props.forecast.finalTrendValue;
    const dateParts = props.forecast.trendStartDate.split("-");
    const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    if (!isFp && party === "LNP") {
        thisTrend = thisTrend.map(spread => [...spread].reverse().map(a => 100 - a));
        thisPolls = thisPolls.map(invertPoll);
    }
    let trendData = undefined;
    trendData = thisTrend.map((spread, index) => {
        return {
            "date": dateToStr(addDays(date, index * period)),
            "day": index * period,
            "median": [round2(spread[3])],
            "25-75": [round2(spread[2]), round2(spread[4])],
            "5-95": [round2(spread[1]), round2(spread[5])],
            "1-99": [round2(spread[0]), round2(spread[6])]
        };
    });
    trendData.at(-1).date = dateToStr(addDays(date, finalDay));
    trendData.at(-1).day = finalDay;
    for (let poll of thisPolls) {
        let trendIndex = Math.floor((poll.day - period / 2) / period) + 1;
        if (poll.day >= finalDay) trendIndex = trendData.length - 1;
        if (trendData[trendIndex].hasOwnProperty("poll2")) {
            trendData[trendIndex]["pollster3"] = poll.pollster;
            trendData[trendIndex]["poll3"] = round1(poll.base);
        } else if (trendData[trendIndex].hasOwnProperty("poll")) {
            trendData[trendIndex]["pollster2"] = poll.pollster;
            trendData[trendIndex]["poll2"] = round1(poll.base);
        } else {
            trendData[trendIndex]["pollster"] = poll.pollster;
            trendData[trendIndex]["poll"] = round1(poll.base);
        }
    }


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
    const currentColours = jsonMap(colours, party);


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
            {party === "OTH" && // don't show polls for OTH as different polls have different original OTH values
                <div>Polls not shown for Others</div>
            }
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                    width={730}
                    height={250}
                    data={trendData}
                    margin={{
                    top: 20, right: 20, bottom: 20, left: 20,
                    }}
                >
                    <XAxis dataKey="date"/>
                    <ZAxis range={[12, 12]}/>
                    <YAxis type="number" domain={[minVal, maxVal]} ticks={ticks}/>
                    <Area dataKey="1-99" type="number" stroke="none" isAnimationActive={false} fill={currentColours[3]} />
                    <Area dataKey="5-95" type="number" stroke="none" isAnimationActive={false} fill={currentColours[2]} />
                    <Area dataKey="25-75" type="number" stroke="none" isAnimationActive={false} fill={currentColours[1]} />
                    <Line dataKey="median" type="number" dot={false} isAnimationActive={false} stroke={currentColours[0]} fill="none" />
                    { party !== "OTH" && // don't show polls for OTH as different polls have different original OTH values
                        <>
                        <Scatter dataKey="pollster" type="number" dot={false} isAnimationActive={false} stroke={currentColours[0]} fill="none" />
                        <Scatter dataKey="poll" type="number" dot={true} shape={"circle"} isAnimationActive={false} stroke={currentColours[0]} fill={currentColours[0]} />
                        <Scatter dataKey="pollster2" type="number" dot={false} isAnimationActive={false} stroke={currentColours[0]} fill="none" />
                        <Scatter dataKey="poll2" type="number" dot={true} shape={"circle"} isAnimationActive={false} stroke={currentColours[0]} fill={currentColours[0]} />
                        <Scatter dataKey="pollster3" type="number" dot={false} isAnimationActive={false} stroke={currentColours[0]} fill="none" />
                        <Scatter dataKey="poll3" type="number" dot={true} shape={"circle"} isAnimationActive={false} stroke={currentColours[0]} fill={currentColours[0]} />
                        </>
                    }
                    <Tooltip isAnimationActive={false} throttleDelay={1} allowEscapeViewBox={{ x: true, y: false }} />
                </ComposedChart>
            </ResponsiveContainer>
        </>
    )
}

export default VoteTrendChart;