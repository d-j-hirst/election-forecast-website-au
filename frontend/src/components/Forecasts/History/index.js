import React, { useState, useEffect } from 'react';

import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import { ComposedChart, Line, XAxis, YAxis, ZAxis, ReferenceLine, Area, Scatter, Tooltip, ResponsiveContainer } from 'recharts';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';
import InfoIcon from '../../General/InfoIcon';
import LoadingMarker from '../../General/LoadingMarker';

import { getDirect } from 'utils/sdk';

import styles from './History.module.css';
import { jsonMap } from 'utils/jsonmap';

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

const HistoryTooltip = ({ active, payload, label }) => {
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

const Chart = props => {
    const unixDates = props.data.map(a => new Date(a.date).getTime())
    const tempDates = unixDates.map(a => a / 86400000);
    const labels = props.data.map(a => a.label);
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
    const trendData = adjDates.map((date, index) => ({
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
        "lnpMaj": [lnpMinStacked[index], lnpMajStacked[index]]
    }));

    return (
        <>
        {trendData !== undefined &&
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                    width={730}
                    height={250}
                    data={trendData}
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
                    <Tooltip content={<HistoryTooltip />} isAnimationActive={false} />
                </ComposedChart>
            </ResponsiveContainer>
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
    const [ history, setHistory] = useState({});
    const [ historyValid, setHistoryValid] = useState(false);
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

    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.historyTitle}>
                <strong>
                    Forecast History
                    &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
                </strong>
            </Card.Header>
            <Card.Body className={styles.historyBody}>
                <ListGroup className={styles.historyList}>
                    {
                        showExplainer && <MainExplainer />
                    }
                    {historyValid &&
                        <StandardErrorBoundary>
                            <Chart data={history} />
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