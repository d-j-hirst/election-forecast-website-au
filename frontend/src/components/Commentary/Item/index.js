import React from 'react';

import { Link } from 'react-router-dom';

import { parseDateStringAsUTC } from '../../../utils/date.js'
import { SanitizeHtml } from '../../../utils/sanitize.js';

import styles from './CommentaryItem.module.css';

const CommentaryItem = props => {
    let headingLink = `/commentary/${props.commentary.id}/`;
    let symbol = '?';
    if (props.returnPage) {
        headingLink += `${symbol}returnPage=${props.returnPage}`;
        symbol = '&';
    }
    if (props.returnTag) headingLink += `${symbol}returnTag=${props.returnTag}`;
    return (
        <>
            {props.headingLink &&
                <h4><Link to={headingLink} className={styles.commentaryHeadingLink}>{props.commentary.title}</Link></h4>
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