import React from 'react';
import {useParams} from 'react-router-dom';

import {ForecastLayout} from 'components';
import NotFound from '../NotFound';
import {isValidArchiveId} from '../../utils/routeparams';

const Archive = () => {
  const {code, id} = useParams();

  if (!isValidArchiveId(id)) return <NotFound code={code} />;

  return <ForecastLayout code={code} id={Number(id)} isArchive={true} />;
};

export default Archive;
