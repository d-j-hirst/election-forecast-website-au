import React from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import styles from './CommentaryHeader.module.css';

const CommentaryHeader = props => {
  let returnLink = '/commentary';
  let symbol = '?';
  if (props.returnPage) {
    returnLink += `${symbol}page=${props.returnPage}`;
    symbol = '&';
  }
  if (props.returnTag) returnLink += `${symbol}tag=${props.returnTag}`;
  return (
    <>
      <h1 className={`${styles.commentaryTitle} page-heading`}>Commentary</h1>
      {props.returnLink && (
        <div className={styles.commentaryReturn}>
          <Link to={returnLink}>Return to commentary list</Link>
        </div>
      )}
    </>
  );
};
CommentaryHeader.propTypes = {
  returnPage: PropTypes.string.isRequired,
  returnTag: PropTypes.string.isRequired,
  returnLink: PropTypes.bool.isRequired,
};

export default CommentaryHeader;
