import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './Layout.module.css';

const Layout = props => (
  <div className={styles.pageWrapper}>
    <div className={styles.border}>
      <div className={classnames(styles.content, props.className)}>
        {props.children}
      </div>
    </div>
  </div>
);
Layout.propTypes = {
  className: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Layout;
