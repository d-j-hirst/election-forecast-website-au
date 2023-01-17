import React from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import styles from './Pages.module.css';

const Pages = props => {
  const pageArray = [];
  for (let i = 1; i <= props.pageCount; ++i) {
    pageArray.push(i);
  }
  return (
    <div className={styles.pageBar}>
      <div className={styles.pageLink}>Pages:</div>
      {pageArray.map((pageNum, index) => {
        const whichClass =
          Number(pageNum) === Number(props.thisPage)
            ? styles.thisPage
            : styles.pageLink;
        const tagPart = props.tag ? `&tag=${props.tag}` : '';
        return (
          <div className={whichClass} key={index}>
            {Number(pageNum) !== Number(props.thisPage) && (
              <Link to={`/commentary?page=${pageNum}${tagPart}`}>
                {pageNum}
              </Link>
            )}
            {Number(pageNum) === Number(props.thisPage) && <div>{pageNum}</div>}
          </div>
        );
      })}
    </div>
  );
};
Pages.propTypes = {
  pageCount: PropTypes.number.isRequired,
  thisPage: PropTypes.string.isRequired,
  tag: PropTypes.string.isRequired,
};

export default Pages;
