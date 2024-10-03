import React from 'react';
import Email from '../../General/Email';

const MethodologyIntro = props => {
  return (
    <>
      <h4 id="introduction">Introduction</h4>
      <p>
        This page describes the methodology used on this site to create
        forecasts. Due to the complexity of the procedure, this page will not go
        into precise details. For those wanting to know every detail, the source
        code is available{' '}
        <a href="https://github.com/d-j-hirst/aus-polling-analyser">
          on Github
        </a>
        . Alternatively, for specific questions, feel free to{' '}
        <Email>email</Email> the site&apos;s author.
      </p>
    </>
  );
};

export default MethodologyIntro;
