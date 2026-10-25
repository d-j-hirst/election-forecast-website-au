import React from 'react';
import {useParams} from 'react-router-dom';

import {ForecastLayout} from 'components';
import NotFound from '../NotFound';
import {isForecastMode} from '../../utils/routeparams';

const Forecast = () => {
  const {code, mode} = useParams();

  if (!isForecastMode(mode)) return <NotFound code={code} />;

  return <ForecastLayout code={code} mode={mode} isArchive={false} />;
};

export default Forecast;
