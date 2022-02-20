import React from 'react';

const MethodologyIntro = props => {
    // Light obfuscation to make this a little harder for bots to figure out.
    const ePart1 = "mai";
    const ePart2 = "lto:aefo";
    const ePart3 = "recasts@";
    const ePart4 = "gma";
    const ePart5 = "il.c";
    const ePart6 = "om";
    const eFull = ePart1 + ePart2 + ePart3 + ePart4 + ePart5 + ePart6;
    return (
        <>
            <p><h4 id="introduction">Introduction</h4></p>
            <p>
                This page is a description of the methodology used in this site - that
                is, the procedure by which the forecasts are created. As this procedure
                is quite involved this page will not go into precise detail, so for those
                wanting to know the precise details the source code is
                available <a href="https://github.com/d-j-hirst/aus-polling-analyser">on Github</a> or,
                for specific questions, feel free
                to <a href={eFull}> email</a> the site's author.
            </p>
        </>
    );
}

export default MethodologyIntro;