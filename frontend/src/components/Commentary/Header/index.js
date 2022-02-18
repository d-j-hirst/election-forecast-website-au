import React from 'react';

import styles from './CommentaryHeader.module.css';

const CommentaryHeader = props => {
    return (
        <>
            <div className={styles.commentaryTitle}>
            Commentary
            </div>
        </>
    );
}

export default CommentaryHeader;