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
  if (props.returnTag)
    returnLink += `${symbol}tag=${encodeURIComponent(props.returnTag)}`;
  return (
    <>
      <h1 className={`${styles.commentaryTitle} page-heading`}>Commentary</h1>
      {props.returnLink && (
        <div className={styles.commentaryReturn}>
          <Link className="btn btn-secondary btn-sm" to={returnLink}>
            Return to commentary list
          </Link>
        </div>
      )}
    </>
  );
};
CommentaryHeader.propTypes = {
  returnPage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  returnTag: PropTypes.string,
  returnLink: PropTypes.bool.isRequired,
};

export default CommentaryHeader;
