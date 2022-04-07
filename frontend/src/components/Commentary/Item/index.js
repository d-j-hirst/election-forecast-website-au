import React from 'react';

import { Link } from 'react-router-dom';

import { parseDateStringAsUTC } from '../../../utils/date.js'
import { SanitizeHtml } from '../../../utils/sanitize.js';

import styles from './CommentaryItem.module.css';

const CommentaryItem = props => {
    console.log(props.returnPage);
    const headingLink = `/commentary/${props.commentary.id}/${props.returnPage ? `?returnPage=${props.returnPage}` : ""}`
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