import React from 'react';

import { parseDateStringAsUTC } from '../../../utils/date.js'

const CommentaryItem = props => {
    return (
        <>
            <h4>{props.commentary.title}</h4>
            <p>{props.commentary.tags.join(", ")} - posted at {parseDateStringAsUTC(props.commentary.date)}</p>
            <p>{props.commentary.text}</p>
        </>
    );
}

export default CommentaryItem;