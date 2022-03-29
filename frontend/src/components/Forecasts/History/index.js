import React, { useState, useEffect } from 'react';

import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';

import { ComposedChart, Line, XAxis, YAxis, ZAxis, ReferenceLine, Area, Scatter, Tooltip, ResponsiveContainer } from 'recharts';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';
import InfoIcon from '../../General/InfoIcon';
import LoadingMarker from '../../General/LoadingMarker';

import { getDirect } from 'utils/sdk';

import styles from './History.module.css';
import { jsonMap, jsonMapReverse } from '../../../utils/jsonmap.js';

const colours = [["ALP", ["#FF0000", "#FF4444", "#FFAAAA", "#FFCCCC"]],
                 ["LNP", ["#0000FF", "#4444FF", "#AAAAFF", "#CCCCFF"]],
                 ["GRN", ["#008800", "#22CC00", "#66FF44", "#BBFF99"]],
                 ["ONP", ["#AA6600", "#FF7F00", "#FFAB58", "#FFC388"]],
                 ["UAP", ["#886600", "#C2B615", "#EBDF43", "#F0E87C"]],
                 ["SAB", ["#886600", "#C2B615", "#EBDF43", "#F0E87C"]],
                 ["OTH", ["#777777", "#999999", "#C5C5C5", "#E0E0E0"]]];

const tieColour = "#885588"

const dateToStr = date => {
    var dateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return dateUTC.toISOString().slice(0, 10);
}

const round2 = num => Math.round(num * 100) / 100;

const GraphTypeEnum = Object.freeze({"governmentFormation": 1,
    "tpp": 2,
    "fp": 3,
    "seats": 4});

const GovernmentFormationTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const thisDate = dateToStr(new Date(payload[0].payload.unixDate));
        return (
        <div className={styles.customTooltip}>
            <p>
                Update: {payload[0].payload.label}
                <br/>
                {thisDate}
                <br/>
                ALP majority: {round2(payload[0].payload.alpMaj[1])}%
                <br/>
                ALP minority: {round2(payload[0].payload.alpMin[1] - payload[0].payload.alpMaj[1])}%
                <br/>
                ALP most seats: {round2(payload[0].payload.alpMost[1] - payload[0].payload.alpMin[1])}%
                <br/>
                Exact ties: {round2(payload[0].payload.ties[1] - payload[0].payload.alpMost[1])}%
                <br/>
                Other party leads: {round2(payload[0].payload.othLeads[1] - payload[0].payload.ties[1])}%
                <br/>
                LNP most seats: {round2(payload[0].payload.lnpMost[1] - payload[0].payload.othLeads[1])}%
                <br/>
                LNP minority: {round2(payload[0].payload.lnpMin[1] - payload[0].payload.lnpMost[1])}%
                <br/>
                LNP majority: {round2(payload[0].payload.lnpMaj[1] - payload[0].payload.lnpMin[1])}%
                <br/>
            </p>
        </div>
        );
    }

    return null;
};

const GovernmentFormation = props => {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
                width={730}
                height={250}
                data={props.data}
                margin={{
                top: 20, right: 20, bottom: 20, left: 20,
                }}
            >
                <XAxis type="number" dataKey="date" domain={[0, 100]}/>
                <YAxis type="number" domain={[0, 100]}/>
                <Area dataKey="alpMaj" type="stepAfter" activeDot={false} isAnimationActive={false} fill={jsonMap(colours, "ALP")[0]} />
                <Area dataKey="alpMin" type="stepAfter" activeDot={false} isAnimationActive={false} fill={jsonMap(colours, "ALP")[1]} />
                <Area dataKey="alpMost" type="stepAfter" activeDot={false} isAnimationActive={false} fill={jsonMap(colours, "ALP")[2]} />
                <Area dataKey="ties" type="stepAfter" activeDot={false} isAnimationActive={false} fill={tieColour} />
                <Area dataKey="othLeads" type="stepAfter" activeDot={false} isAnimationActive={false} fill={jsonMap(colours, "OTH")[1]} />
                <Area dataKey="lnpMost" type="stepAfter" activeDot={false} isAnimationActive={false} fill={jsonMap(colours, "LNP")[2]} />
                <Area dataKey="lnpMin" type="stepAfter" activeDot={false} isAnimationActive={false} fill={jsonMap(colours, "LNP")[1]} />
                <Area dataKey="lnpMaj" type="stepAfter" activeDot={false} isAnimationActive={false} fill={jsonMap(colours, "LNP")[0]} />
                <Tooltip content={<GovernmentFormationTooltip />} isAnimationActive={false} />
            </ComposedChart>
        </ResponsiveContainer>
    )
}

const TppTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const thisDate = dateToStr(new Date(payload[0].payload.unixDate));
        return (
        <div className={styles.customTooltip}>
            <p>
                Update: {payload[0].payload.label}
                <br/>
                {thisDate}
                <br/>
            </p>
            <p className={styles.smallTooltipText}>
                Vote total percentiles (
                <span className={styles.outerProbsText}>5%</span>
                <span className={styles.innerProbsText}>-25%</span>
                -<strong>median</strong>-
                <span className={styles.innerProbsText}>75%-</span>
                <span className={styles.outerProbsText}>95%</span>)
            </p>
            <p>
                <span className={styles.outerProbsText}>{round2(payload[0].payload["tpp5-25"][0])}</span>
                <span className={styles.innerProbsText}>{` - ${round2(payload[0].payload["tpp25-75"][0])} - `}</span>
                <strong>{round2(payload[0].payload["tppMedian"])}</strong>
                <span className={styles.innerProbsText}>{` - ${round2(payload[0].payload["tpp25-75"][1])} - `}</span>
                <span className={styles.outerProbsText}>{round2(payload[0].payload["tpp75-95"][1])}</span>
            </p>
        </div>
        );
    }

    return null;
};

const Tpp = props => {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
                width={730}
                height={250}
                data={props.data}
                margin={{
                top: 20, right: 20, bottom: 20, left: 20,
                }}
            >
                <XAxis type="number" dataKey="date" domain={[0, 100]}/>
                <YAxis type="number" domain={[35, 65]}/>
                <Area dataKey="tpp1-5" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} fill={jsonMap(colours, props.partyAbbr)[3]} />
                <Area dataKey="tpp5-25" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} fill={jsonMap(colours, props.partyAbbr)[2]} />
                <Area dataKey="tpp25-75" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} fill={jsonMap(colours, props.partyAbbr)[1]} />
                <Area dataKey="tpp75-95" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} fill={jsonMap(colours, props.partyAbbr)[2]} />
                <Area dataKey="tpp95-99" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} fill={jsonMap(colours, props.partyAbbr)[3]} />
                <Line dataKey="tppMedian" type="stepAfter" activeDot={false} dot={false} isAnimationActive={false} stroke={jsonMap(colours, props.partyAbbr)[0]} />
                <Tooltip content={<TppTooltip />} isAnimationActive={false} />
            </ComposedChart>
        </ResponsiveContainer>
    )
}

const FpTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const thisDate = dateToStr(new Date(payload[0].payload.unixDate));
        return (
        <div className={styles.customTooltip}>
            <p>
                Update: {payload[0].payload.label}
                <br/>
                {thisDate}
                <br/>
            </p>
            <p className={styles.smallTooltipText}>
                Vote total percentiles (
                <span className={styles.outerProbsText}>5%</span>
                <span className={styles.innerProbsText}>-25%</span>
                -<strong>median</strong>-
                <span className={styles.innerProbsText}>75%-</span>
                <span className={styles.outerProbsText}>95%</span>)
            </p>
            <p>
                <span className={styles.outerProbsText}>{round2(payload[0].payload["fp5-25"][0])}</span>
                <span className={styles.innerProbsText}>{` - ${round2(payload[0].payload["fp25-75"][0])} - `}</span>
                <strong>{round2(payload[0].payload["fpMedian"])}</strong>
                <span className={styles.innerProbsText}>{` - ${round2(payload[0].payload["fp25-75"][1])} - `}</span>
                <span className={styles.outerProbsText}>{round2(payload[0].payload["fp75-95"][1])}</span>
            </p>
        </div>
        );
    }

    return null;
};

const Fp = props => {
    const lowFp = Math.min.apply(Math, props.data.map(a => Math.floor(a["fp1-5"][0])));
    const highFp = Math.max.apply(Math, props.data.map(a => Math.floor(a["fp95-99"][1]) + 1));
    return (
        <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
                width={730}
                height={250}
                data={props.data}
                margin={{
                top: 20, right: 20, bottom: 20, left: 20,
                }}
            >
                <XAxis type="number" dataKey="date" domain={[0, 100]}/>
                <YAxis type="number" domain={[Math.max(0, lowFp - 1), highFp + 1]}/>
                <Area dataKey="fp1-5" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} fill={jsonMap(colours, props.partyAbbr)[3]} />
                <Area dataKey="fp5-25" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} fill={jsonMap(colours, props.partyAbbr)[2]} />
                <Area dataKey="fp25-75" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} fill={jsonMap(colours, props.partyAbbr)[1]} />
                <Area dataKey="fp75-95" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} fill={jsonMap(colours, props.partyAbbr)[2]} />
                <Area dataKey="fp95-99" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} fill={jsonMap(colours, props.partyAbbr)[3]} />
                <Line dataKey="fpMedian" type="stepAfter" activeDot={false} dot={false} isAnimationActive={false} stroke={jsonMap(colours, props.partyAbbr)[0]} />
                <Tooltip content={<FpTooltip />} isAnimationActive={false} />
            </ComposedChart>
        </ResponsiveContainer>
    )
}

const SeatsTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const thisDate = dateToStr(new Date(payload[0].payload.unixDate));
        return (
        <div className={styles.customTooltip}>
            <p>
                Update: {payload[0].payload.label}
                <br/>
                {thisDate}
                <br/>
            </p>
            <p className={styles.smallTooltipText}>
                Vote total percentiles (
                <span className={styles.outerProbsText}>5%</span>
                <span className={styles.innerProbsText}>-25%</span>
                -<strong>median</strong>-
                <span className={styles.innerProbsText}>75%-</span>
                <span className={styles.outerProbsText}>95%</span>)
            </p>
            <p>
                <span className={styles.outerProbsText}>{round2(payload[0].payload["seats5-25"][0])}</span>
                <span className={styles.innerProbsText}>{` - ${round2(payload[0].payload["seats25-75"][0])} - `}</span>
                <strong>{round2(payload[0].payload["seatsMedian"])}</strong>
                <span className={styles.innerProbsText}>{` - ${round2(payload[0].payload["seats25-75"][1])} - `}</span>
                <span className={styles.outerProbsText}>{round2(payload[0].payload["seats75-95"][1])}</span>
            </p>
        </div>
        );
    }

    return null;
};

const Seats = props => {
    const lowSeats = Math.min.apply(Math, props.data.map(a => Math.floor(a["seats1-5"][0])));
    const highSeats = Math.max.apply(Math, props.data.map(a => Math.floor(a["seats95-99"][1]) + 1));
    const colourKey = jsonMap(colours, props.partyAbbr) ? props.partyAbbr : "OTH";
    return (
        <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
                width={730}
                height={250}
                data={props.data}
                margin={{
                top: 20, right: 20, bottom: 20, left: 20,
                }}
            >
                <XAxis type="number" dataKey="date" domain={[0, 100]}/>
                <YAxis type="number" domain={[Math.max(0, lowSeats - 1), highSeats + 1]}/>
                <Area dataKey="seats1-5" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} 
                    fill={jsonMap(colours, colourKey)[3]} />
                <Area dataKey="seats5-25" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} 
                    fill={jsonMap(colours, colourKey)[2]} />
                <Area dataKey="seats25-75" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} 
                    fill={jsonMap(colours, colourKey)[1]} />
                <Area dataKey="seats75-95" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} 
                    fill={jsonMap(colours, colourKey)[2]} />
                <Area dataKey="seats95-99" type="stepAfter" activeDot={false} stroke="none" isAnimationActive={false} 
                    fill={jsonMap(colours, colourKey)[3]} />
                <Line dataKey="seatsMedian" type="stepAfter" activeDot={false} dot={false} isAnimationActive={false}
                    stroke={jsonMap(colours, colourKey)[0]} />
                <Tooltip content={<SeatsTooltip />} isAnimationActive={false} />
            </ComposedChart>
        </ResponsiveContainer>
    )
}

const Chart = props => {
    const unixDates = props.data.map(a => new Date(a.date).getTime())
    const tempDates = unixDates.map(a => a / 86400000);
    const labels = props.data.map(a => a.label.length > 26 ? a.label.substring(0, 24) + "..." : a.label);
    const prevDate = Math.min.apply(Math, tempDates);
    const adjDates = tempDates.map(a => a - prevDate);
    const alpMaj = props.data.map(a => jsonMap(a.majorityWinPc, 0));
    const alpMin = props.data.map((a, index) => jsonMap(a.minorityWinPc, 0));
    const alpMost = props.data.map((a, index) => jsonMap(a.mostSeatsWinPc, 0));
    const ties = props.data.map((a, index) => 100 -
        a.majorityWinPc.reduce((a, b) => a + b[1], 0) - 
        a.minorityWinPc.reduce((a, b) => a + b[1], 0) -
        a.mostSeatsWinPc.reduce((a, b) => a + b[1], 0));
    const othLeads = props.data.map((a, index) => 
        a.majorityWinPc.reduce((a, b) => a + (b[0] > 1 || b[0] < 0 ? b[1] : 0), 0) + 
        a.minorityWinPc.reduce((a, b) => a + (b[0] > 1 || b[0] < 0 ? b[1] : 0), 0) +
        a.mostSeatsWinPc.reduce((a, b) => a + (b[0] > 1 || b[0] < 0 ? b[1] : 0), 0));
    const lnpMost = props.data.map((a, index) => jsonMap(a.mostSeatsWinPc, 1));
    const lnpMin = props.data.map((a, index) => jsonMap(a.minorityWinPc, 1, 0));
    const lnpMaj = props.data.map((a, index) => jsonMap(a.majorityWinPc, 1));

    const alpMinStacked = alpMin.map((a, index) => a + alpMaj[index]);
    const alpMostStacked = alpMost.map((a, index) => a + alpMinStacked[index]);
    const tiesStacked = ties.map((a, index) => a + alpMostStacked[index]);
    const othLeadsStacked = othLeads.map((a, index) => a + tiesStacked[index]);
    const lnpMostStacked = lnpMost.map((a, index) => a + othLeadsStacked[index]);
    const lnpMinStacked = lnpMin.map((a, index) => a + lnpMostStacked[index]);
    const lnpMajStacked = lnpMaj.map((a, index) => a + lnpMinStacked[index]);

    let tpp = (props.party === 0 || props.party === 1 ?
        props.data.map(a => [a.tppFrequencies[1], a.tppFrequencies[4], a.tppFrequencies[6], a.tppFrequencies[7],
                             a.tppFrequencies[8], a.tppFrequencies[10], a.tppFrequencies[13]])
    : null);
    if (props.party === 1) tpp = tpp.map(a => a.reverse().map(b => 100 - b));

    const fp = props.data.map(a => jsonMap(a.fpFrequencies, props.party, null) !== null ? 
                       [jsonMap(a.fpFrequencies, props.party)[1], jsonMap(a.fpFrequencies, props.party)[4],
                        jsonMap(a.fpFrequencies, props.party)[6], jsonMap(a.fpFrequencies, props.party)[7],
                        jsonMap(a.fpFrequencies, props.party)[8], jsonMap(a.fpFrequencies, props.party)[10], 
                        jsonMap(a.fpFrequencies, props.party)[13]]
                       : [0, 0, 0, 0, 0, 0, 0]);

    const seats = props.data.map(a => jsonMap(a.seatCountFrequencies, props.party, null) !== null ? 
                                      [jsonMap(a.seatCountFrequencies, props.party)[1], jsonMap(a.seatCountFrequencies, props.party)[4],
                                      jsonMap(a.seatCountFrequencies, props.party)[6], jsonMap(a.seatCountFrequencies, props.party)[7],
                                      jsonMap(a.seatCountFrequencies, props.party)[8], jsonMap(a.seatCountFrequencies, props.party)[10], 
                                      jsonMap(a.seatCountFrequencies, props.party)[13]]
                                      : [0, 0, 0, 0, 0, 0, 0]);

    const chartData = adjDates.map((date, index) => ({
        "date": date,
        "unixDate": unixDates[index],
        "label": labels[index],
        "alpMaj": [0, alpMaj[index]],
        "alpMin": [alpMaj[index], alpMinStacked[index]],
        "alpMost": [alpMinStacked[index], alpMostStacked[index]],
        "ties": [alpMostStacked[index], tiesStacked[index]],
        "othLeads": [tiesStacked[index], othLeadsStacked[index]],
        "lnpMost": [othLeadsStacked[index], lnpMostStacked[index]],
        "lnpMin": [lnpMostStacked[index], lnpMinStacked[index]],
        "lnpMaj": [lnpMinStacked[index], lnpMajStacked[index]],
        "tpp1-5": tpp ? [tpp[index][0], tpp[index][1]] : null,
        "tpp5-25": tpp ? [tpp[index][1], tpp[index][2]] : null,
        "tpp25-75": tpp ? [tpp[index][2], tpp[index][4]] : null,
        "tpp75-95": tpp ? [tpp[index][4], tpp[index][5]] : null,
        "tpp95-99": tpp ? [tpp[index][5], tpp[index][6]] : null,
        "tppMedian": tpp ? tpp[index][3] : null,
        "fp1-5": [fp[index][0], fp[index][1]],
        "fp5-25": [fp[index][1], fp[index][2]],
        "fp25-75": [fp[index][2], fp[index][4]],
        "fp75-95": [fp[index][4], fp[index][5]],
        "fp95-99": [fp[index][5], fp[index][6]],
        "fpMedian": fp[index][3],
        "seats1-5": [seats[index][0], seats[index][1]],
        "seats5-25": [seats[index][1], seats[index][2]],
        "seats25-75": [seats[index][2], seats[index][4]],
        "seats75-95": [seats[index][4], seats[index][5]],
        "seats95-99": [seats[index][5], seats[index][6]],
        "seatsMedian": seats[index][3]
    }));

    const partyAbbr = jsonMap(props.partyAbbr, props.party);

    return (
        <>
        {chartData !== undefined &&
            <>
                {props.type === GraphTypeEnum.governmentFormation &&
                    <GovernmentFormation data={chartData} />
                }
                {props.type === GraphTypeEnum.tpp &&
                    <Tpp data={chartData} partyAbbr={partyAbbr} />
                }
                {props.type === GraphTypeEnum.fp &&
                    <Fp data={chartData} partyAbbr={partyAbbr} />
                }
                {props.type === GraphTypeEnum.seats &&
                    <Seats data={chartData} partyAbbr={partyAbbr} />
                }
            </>
        }
        </>
    )
}

const MainExplainer = props => {
    return (
        <Alert variant="info" className={styles.alert}>
            <p>
                Placeholder alert.
            </p>
        </Alert>
    )
}

const History = props => {

    const [showExplainer, setShowExplainer] = useState(false);
    const [history, setHistory] = useState({});
    const [historyValid, setHistoryValid] = useState(false);
    const [graphType, setGraphType] = useState(GraphTypeEnum.governmentFormation);
    const [graphParty, setGraphParty] = useState(0);
    // const windowDimensions = useWindowDimensions();

    useEffect(() => {
        setHistoryValid(false);

        const getElectionSummary = () => {
            let requestUri = `forecast-api/election-timeseries/${props.election}/${props.mode}/`;
            if (props.election === localStorage.getItem('cachedHistoryCode')
                    && props.mode === localStorage.getItem('cachedHistoryMode')) {
                const cached_id = localStorage.getItem('cachedHistoryVersion');
                if (cached_id !== null) requestUri += `${cached_id}/`;
            }
            return getDirect(requestUri).then(
                resp => {
                    if (!resp.ok) throw Error("Couldn't find election data");
                    return resp.data;
                }
            );
        }

        const fetchElectionSummary = () => {
            if (props.election === localStorage.getItem('cachedHistoryCode')
                    && props.mode === localStorage.getItem('cachedHistoryMode')) {
                const tempHistory = JSON.parse(localStorage.getItem('cachedHistory'));
                setHistory(tempHistory);
                setHistoryValid(true);
            }
            getElectionSummary().then(
                data => {
                    if (data.new === false) {
                        data['timeseries'] = JSON.parse(localStorage.getItem('cachedHistory'));
                    } else {
                        localStorage.setItem('cachedHistory', JSON.stringify(data.timeseries));
                        localStorage.setItem('cachedHistoryVersion', String(data.version));
                        localStorage.setItem('cachedHistoryCode', String(props.election));
                        localStorage.setItem('cachedHistoryMode', String(props.mode));
                    }
                    setHistory(data.timeseries);
                    setHistoryValid(true);
                }
            ).catch(
                e => {
                    console.log(e);
                }
            );
        }

        fetchElectionSummary();
    }, [props.election, props.mode]);

    const grnIndex = jsonMapReverse(props.forecast.partyAbbr, "GRN");
    const indIndex = jsonMapReverse(props.forecast.partyAbbr, "IND", null, a => a >= 0);
    let onpIndex = jsonMapReverse(props.forecast.partyAbbr, "ONP");
    if (onpIndex && jsonMap(props.forecast.seatCountFrequencies, onpIndex)[14] === 0) onpIndex = null;
    let uapIndex = jsonMapReverse(props.forecast.partyAbbr, "UAP");
    if (uapIndex && jsonMap(props.forecast.seatCountFrequencies, uapIndex)[14] === 0) uapIndex = null;

    const setGraphGovernmentFormation = () => {setGraphType(GraphTypeEnum.governmentFormation);};
    const setGraphAlpTpp = () => {setGraphType(GraphTypeEnum.tpp); setGraphParty(0);};
    const setGraphLnpTpp = () => {setGraphType(GraphTypeEnum.tpp); setGraphParty(1);};
    const setGraphAlpFp = () => {setGraphType(GraphTypeEnum.fp); setGraphParty(0);};
    const setGraphLnpFp = () => {setGraphType(GraphTypeEnum.fp); setGraphParty(1);};
    const setGraphGrnFp = () => {setGraphType(GraphTypeEnum.fp); setGraphParty(grnIndex);};
    const setGraphOnpFp = () => {setGraphType(GraphTypeEnum.fp); setGraphParty(onpIndex);};
    const setGraphUapFp = () => {setGraphType(GraphTypeEnum.fp); setGraphParty(uapIndex);};
    const setGraphOthFp = () => {setGraphType(GraphTypeEnum.fp); setGraphParty(-1);};
    const setGraphAlpSeats = () => {setGraphType(GraphTypeEnum.seats); setGraphParty(0);};
    const setGraphLnpSeats = () => {setGraphType(GraphTypeEnum.seats); setGraphParty(1);};
    const setGraphGrnSeats = () => {setGraphType(GraphTypeEnum.seats); setGraphParty(grnIndex);};
    const setGraphOnpSeats = () => {setGraphType(GraphTypeEnum.seats); setGraphParty(onpIndex);};
    const setGraphUapSeats = () => {setGraphType(GraphTypeEnum.seats); setGraphParty(uapIndex);};
    const setGraphIndSeats = () => {setGraphType(GraphTypeEnum.seats); setGraphParty(indIndex);};

    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.historyTitle}>
                <strong>
                    Forecast History
                    &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
                </strong>
            </Card.Header>
            <Card.Body className={styles.historyBody}>
                {
                    showExplainer && <MainExplainer />
                }
                <ListGroup className={styles.historyList}>
                    {historyValid &&
                        <StandardErrorBoundary>
                            <ListGroup.Item className={styles.historyOptions}>
                                <DropdownButton id="sort-dropdown" title="Display:" variant="secondary">
                                    <Dropdown.Item as="button" onClick={setGraphGovernmentFormation}>Formation of government</Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={setGraphAlpTpp}>ALP two-party-preferred</Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={setGraphLnpTpp}>LNP two-party-preferred</Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={setGraphAlpFp}>ALP first preferences</Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={setGraphLnpFp}>LNP first preferences</Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={setGraphGrnFp}>GRN first preferences</Dropdown.Item>
                                    {onpIndex &&
                                        <Dropdown.Item as="button" onClick={setGraphOnpFp}>ONP first preferences</Dropdown.Item>
                                    }
                                    {uapIndex &&
                                        <Dropdown.Item as="button" onClick={setGraphUapFp}>UAP first preferences</Dropdown.Item>
                                    }
                                    <Dropdown.Item as="button" onClick={setGraphOthFp}>OTH first preferences</Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={setGraphAlpSeats}>ALP seats</Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={setGraphLnpSeats}>LNP seats</Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={setGraphGrnSeats}>GRN seats</Dropdown.Item>
                                    {onpIndex &&
                                        <Dropdown.Item as="button" onClick={setGraphOnpSeats}>ONP seats</Dropdown.Item>
                                    }
                                    {uapIndex &&
                                        <Dropdown.Item as="button" onClick={setGraphUapSeats}>UAP seats</Dropdown.Item>
                                    }
                                    <Dropdown.Item as="button" onClick={setGraphIndSeats}>IND seats</Dropdown.Item>
                                </DropdownButton>
                            </ListGroup.Item>
                            <Chart data={history} type={graphType} party={graphParty} partyAbbr={props.forecast.partyAbbr} />
                        </StandardErrorBoundary>
                    }
                    {!historyValid &&
                        <LoadingMarker text="Loading history"/>
                    }
                </ListGroup>
            </Card.Body>
        </Card>
    );
}

export default History;