import React from 'react';
import {useParams} from 'react-router-dom';

import {ForecastLayout} from 'components';

const Archive = () => {
  const {code, id} = useParams();

  return <ForecastLayout code={code} id={Number(id)} isArchive={true} />;
};

export default Archive;
