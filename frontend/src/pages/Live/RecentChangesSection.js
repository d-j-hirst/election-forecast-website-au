import React from 'react';
import PropTypes from 'prop-types';
import ListGroup from 'react-bootstrap/ListGroup';
import styles from 'components/Forecasts/VoteTotals/VoteTotals.module.css';

// Use the same heading row as Vote Totals while keeping the content in its own
// list-group row for spacing and borders.
export default function RecentChangesSection({title, children}) {
  return (
    <>
      <ListGroup.Item
        role="heading"
        aria-level={3}
        className={styles.voteTotalsSubHeading}
      >
        {title}
      </ListGroup.Item>
      <ListGroup.Item>{children}</ListGroup.Item>
    </>
  );
}

RecentChangesSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
