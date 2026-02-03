import React from 'react';
import Email from '../../General/Email';

const MethodsIntro = props => {
  return (
    <>
      <h4 id="introduction">Introduction</h4>
      <p>
        This page describes the methods used to generate forecasts on this site.
        Given the complexity of the procedure, only an overview is provided
        rather than a detailed account of every formula or step. For complete
        details, the source code is available{' '}
        <a href="https://github.com/d-j-hirst/aus-polling-analyser">
          on GitHub
        </a>
        . For specific questions, please contact the site&apos;s author by{' '}
        <Email>email</Email>.
      </p>
    </>
  );
};

export default MethodsIntro;
