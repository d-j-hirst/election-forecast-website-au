import React from 'react';
import {useParams} from 'react-router-dom';

import {SeatDetails} from 'components';
import NotFound from '../NotFound';
import {isForecastMode} from '../../utils/routeparams';

const SeatDetailsPage = () => {
  const {code, mode, seat} = useParams();

  if (!isForecastMode(mode)) return <NotFound code={code} />;

  return <SeatDetails code={code} seat={seat} mode={mode} />;
};

export default SeatDetailsPage;
