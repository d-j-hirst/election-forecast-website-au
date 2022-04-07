import React from 'react';

import { Link } from 'react-router-dom';

import styles from './Pages.module.css';

const Pages = props => {
    const pageArray = [];
    for (let i = 1; i <= props.pageCount; ++i) {
        pageArray.push(i);
    }
    return (
        <div>
            {
                pageArray.map(pageNum => {
                    return <><Link to={`/commentary?page=${pageNum}`}>{pageNum}</Link>{" "}</>
                })
            }
        </div>
    );
}

export default Pages;