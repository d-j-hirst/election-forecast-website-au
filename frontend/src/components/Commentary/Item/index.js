import React from 'react';

import { parseDateStringAsUTC } from '../../../utils/date.js'
import { SanitizeHtml } from '../../../utils/sanitize.js';

const CommentaryItem = props => {
    return (
        <>
            <h4>{props.commentary.title}</h4>
            <p>{props.commentary.tags.join(", ")} - posted at {parseDateStringAsUTC(props.commentary.date)}</p>
            <SanitizeHtml html={props.commentary.text} />
        </>
    );
}

export default CommentaryItem;