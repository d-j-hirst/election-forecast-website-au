import React from 'react';
import {useParams} from 'react-router-dom';

import {SeatDetails} from 'components';

const ArchiveSeatPage = () => {
  const {code, id, seat} = useParams();

  return <SeatDetails code={code} id={id} seat={seat} isArchive={true} />;
};

export default ArchiveSeatPage;
