import React from 'react';

import {Link} from 'react-router-dom';

import InfoIcon from '../../General/InfoIcon';

const GuideIntro = props => {
  return (
    <>
      <h4 id="introduction">Introduction</h4>
      <p>
        This page is a guide to using and interpreting the forecast. All parts
        of the forecast are explained briefly on the{' '}
        <Link to={'/forecast'}>forecast page</Link> itself, shown by clicking
        the the <InfoIcon inactive={true} /> and{' '}
        <InfoIcon inactive={true} warning={true} /> icons. This page is reserved
        for some topics that deserve a more in-depth discussion.
      </p>
    </>
  );
};

export default GuideIntro;
