import React from 'react';
import PropTypes from 'prop-types';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {brightness} from '../../../../utils/brightness.js';
import governmentOutcomes from '../governmentOutcomes';

import styles from './GovernmentFormationChart.module.css';

const round1 = num =>
  num === null || num === undefined ? 0 : Math.round(num * 10) / 10;

const RADIAN = Math.PI / 180;

const GovernmentFormationChart = props => {
  const lowerLegendRequired = props.windowWidth < 550;
  const data = governmentOutcomes(props.forecast).map(row => ({
    ...row,
    value: round1(row.value),
  }));

  const chartHeight = lowerLegendRequired
    ? props.windowWidth < 360
      ? 440
      : 420
    : 320;

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const value = data[index].value;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.8;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (value < 3.5) return null;

    const fillColor = brightness(data[index].color) > 130 ? 'black' : 'white';

    return (
      <text
        x={x}
        y={y}
        fill={fillColor}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {`${value}%`}
      </text>
    );
  };

  const ChartTooltip = ({active, payload, label}) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p>
            {payload[0].name} - {payload[0].value}%
          </p>
        </div>
      );
    }

    return null;
  };
  ChartTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.bool,
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
          cy={lowerLegendRequired ? 160 : '50%'}
          labelLine={false}
          legendType={'square'}
          outerRadius={145}
          fill="#8884d8"
          dataKey="value"
          isAnimationActive={false}
          label={renderCustomizedLabel}
        >
          {data.map(entry => (
            <Cell key={entry.id} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} isAnimationActive={false} />
        <Legend
          formatter={renderColorfulLegendText}
          align={lowerLegendRequired ? 'center' : 'right'}
          layout={lowerLegendRequired ? 'horizontal' : 'vertical'}
          verticalAlign={lowerLegendRequired ? 'bottom' : 'middle'}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
GovernmentFormationChart.propTypes = {
  forecast: PropTypes.object.isRequired,
  windowWidth: PropTypes.number.isRequired,
};

export default GovernmentFormationChart;
