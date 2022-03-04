import React from 'react';
import Email from '../../General/Email';

const MethodologyIntro = props => {
    return (
        <>
            <h4 id="introduction">Introduction</h4>
            <p>
                This page is a description of the methodology used in this site - that
                is, the procedure by which the forecasts are created. As this procedure
                is quite involved this page will not go into precise detail, so for those
                wanting to know the precise details the source code is
                available <a href="https://github.com/d-j-hirst/aus-polling-analyser">on Github</a> or,
                for specific questions, feel free
                to <Email>email</Email> the site's author.
            </p>
        </>
    );
}

export default MethodologyIntro;