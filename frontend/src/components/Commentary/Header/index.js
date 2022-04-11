import React from 'react';

import { Link } from 'react-router-dom';

import styles from './CommentaryHeader.module.css';

const CommentaryHeader = props => {
    let returnLink = `/commentary`;
    let symbol = '?';
    if (props.returnPage) {
        returnLink += `${symbol}page=${props.returnPage}`;
        symbol = '&';
    }
    if (props.returnTag) returnLink += `${symbol}tag=${props.returnTag}`;
    return (
        <>
            <div className={styles.commentaryTitle}>
            Commentary
            </div>
            {props.returnLink &&
                <div className={styles.commentaryReturn}>
                    <Link to={returnLink}>Return to commentary list</Link>
                </div>
            }
        </>
    );
}

export default CommentaryHeader;