import React from 'react';

import { Link } from 'react-router-dom';
import logo from './assets/logo.png'
import styles from './Header.module.css';

const Header = () => (
    <div className={styles.pageWrapper}>
        <Link to={'/'}>
            <img className={styles.logo} src={logo} alt='Australian Election Forecasts logo'/>
        </Link>
    </div>
);

export default Header;