import React from 'react';
import {useParams} from 'react-router-dom';

import {SeatDetails} from 'components';
import NotFound from '../NotFound';
import {isValidArchiveId} from '../../utils/routeparams';

const ArchiveSeatPage = () => {
  const {code, id, seat} = useParams();

  if (!isValidArchiveId(id)) return <NotFound code={code} />;

  return (
    <SeatDetails code={code} id={Number(id)} seat={seat} isArchive={true} />
  );
};

export default ArchiveSeatPage;
