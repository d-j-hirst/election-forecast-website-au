import React from 'react';
import classnames from 'classnames';

import styles from './Layout.module.css';

const Layout = ({ children, className }) => (
  <>
  <div className={styles.pageWrapper}>
    <div className={styles.border}>
      <div className={classnames(styles.content, className)}>{children}</div>
    </div>
  </div>
  </>
);

export default Layout;
