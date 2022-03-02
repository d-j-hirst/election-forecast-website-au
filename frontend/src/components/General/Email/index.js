import React from 'react';

const Email = props => {
    const ePart1 = "mai";
    const ePart2 = "lto:aefo";
    const ePart3 = "recasts@";
    const ePart4 = "gma";
    const ePart5 = "il.c";
    const ePart6 = "om";
    const eFull = ePart1 + ePart2 + ePart3 + ePart4 + ePart5 + ePart6;
    return <a href={eFull}>{props.children}</a>
}

export default Email;