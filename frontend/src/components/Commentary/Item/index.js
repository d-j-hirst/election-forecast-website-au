import React from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import {parseDateStringAsUTC} from '../../../utils/date.js';
import {SanitizeHtml} from '../../../utils/sanitize.js';

import styles from './CommentaryItem.module.css';

const CommentaryItem = props => {
  let headingLink = `/commentary/${props.commentary.id}/`;
  let symbol = '?';
  if (props.returnPage) {
    headingLink += `${symbol}returnPage=${props.returnPage}`;
    symbol = '&';
  }
  if (props.returnTag)
    headingLink += `${symbol}returnTag=${encodeURIComponent(props.returnTag)}`;
  return (
    <>
      {props.headingLink && (
        <h4>
          <Link to={headingLink} className={styles.commentaryHeadingLink}>
            {props.commentary.title}
          </Link>
        </h4>
      )}
      {!props.headingLink && <h4>{props.commentary.title}</h4>}
      <p>
        {props.commentary.tags.map(tag => (
          <Link
            key={tag}
            className="btn btn-secondary btn-sm me-1"
            to={'/commentary?tag=' + encodeURIComponent(tag)}
          >
            {tag}
          </Link>
        ))}
        Posted at {parseDateStringAsUTC(props.commentary.date)}
      </p>
      <SanitizeHtml html={props.commentary.text} />
    </>
  );
};
CommentaryItem.propTypes = {
  commentary: PropTypes.object.isRequired,
  returnPage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  returnTag: PropTypes.string,
  headingLink: PropTypes.bool.isRequired,
};

export default CommentaryItem;
