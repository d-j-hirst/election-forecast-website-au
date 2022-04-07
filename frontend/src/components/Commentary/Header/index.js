import React from 'react';

import { Link } from 'react-router-dom';

import styles from './CommentaryHeader.module.css';

const CommentaryHeader = props => {
    const returnLink = `/commentary${props.returnPage ? `?page=${props.returnPage}` : 1}`
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