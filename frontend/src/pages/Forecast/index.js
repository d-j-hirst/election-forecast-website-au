import React from 'react';
import {useParams} from 'react-router-dom';

import {ForecastLayout} from 'components';

const Forecast = () => {
  const {code, mode} = useParams();

  return <ForecastLayout code={code} mode={mode} isArchive={false} />;
};

export default Forecast;
