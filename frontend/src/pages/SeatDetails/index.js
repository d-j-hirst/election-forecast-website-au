import React from 'react';
import { useParams } from 'react-router-dom';

import { SeatDetails } from 'components';


const SeatDetailsPage = () => {
    const { code, mode, seat } = useParams();

    return <SeatDetails code={code} seat={seat} mode={mode} />
};

export default SeatDetailsPage;
