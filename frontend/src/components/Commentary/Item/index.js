import React from 'react';

import { Link } from 'react-router-dom';

import { parseDateStringAsUTC } from '../../../utils/date.js'
import { SanitizeHtml } from '../../../utils/sanitize.js';

const CommentaryItem = props => {
    const headingLink = `commentary/${props.commentary.id}/`
    return (
        <>
            {props.headingLink &&
                <h4><Link to={headingLink}>{props.commentary.title}</Link></h4>
            }
            {!props.headingLink &&
                <h4>{props.commentary.title}</h4>
            }
            <p>{props.commentary.tags.join(", ")} - posted at {parseDateStringAsUTC(props.commentary.date)}</p>
            <SanitizeHtml html={props.commentary.text} />
        </>
    );
}

export default CommentaryItem;