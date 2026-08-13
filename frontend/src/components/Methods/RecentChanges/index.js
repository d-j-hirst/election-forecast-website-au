import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/Button';

import {
  formatMethodChangeDate,
  methodChangeKey,
  methodsChanges,
  sortMethodChangesNewestFirst,
} from '../../../config/methodsChanges.js';

import styles from './RecentChanges.module.css';

const RecentMethodsChanges = props => {
  const [show, setShow] = useState(true);
  const orderedChanges = sortMethodChangesNewestFirst(props.changes);

  if (orderedChanges.length === 0) return null;

  return (
    <section>
      <h4 id="recent-methods-changes" className={styles.heading}>
        Recent major methods changes
        <Button
          variant="link"
          className={styles.toggle}
          onClick={() => setShow(!show)}
        >
          {show ? 'hide' : 'show'}
        </Button>
      </h4>
      {show && (
        <div>
          {orderedChanges.map(change => (
            <article key={methodChangeKey(change)} className={styles.change}>
              <p className={styles.changeTitle}>
                <strong>
                  {formatMethodChangeDate(change.date)}: {change.title}
                </strong>
              </p>
              {change.longDescription.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

RecentMethodsChanges.defaultProps = {
  changes: methodsChanges,
};

RecentMethodsChanges.propTypes = {
  changes: PropTypes.array,
};

export default RecentMethodsChanges;
