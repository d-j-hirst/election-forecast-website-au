import React from 'react';
import Email from '../../General/Email';

const MethodologyIntro = props => {
  return (
    <>
      <h4 id="introduction">Introduction</h4>
      <p>
        This page describes the methodology used on this site to create
        forecasts. Given the complexity of the procedure, this page provides an
        overview without covering every formula or step in full detail. For
        those wanting to know every detail, the source code is available{' '}
        <a href="https://github.com/d-j-hirst/aus-polling-analyser">
          on Github
        </a>
        . For specific questions, you are welcome to contact the site&apos;s{' '}
        author by <Email>email</Email>.
      </p>
    </>
  );
};

export default MethodologyIntro;
