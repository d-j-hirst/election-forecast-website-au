import React from 'react';

import { Link } from 'react-router-dom';

import styles from './Pages.module.css';

const Pages = props => {
    const pageArray = [];
    for (let i = 1; i <= props.pageCount; ++i) {
        pageArray.push(i);
    }
    console.log(props.thisPage);
    return (
        <div className={styles.pageBar}>
            <div className={styles.pageLink}>
                Pages:
            </div>
            {
                pageArray.map((pageNum, index) => {
                    const whichClass = Number(pageNum) === Number(props.thisPage) ? styles.thisPage : styles.pageLink
                    return (
                        <div className={whichClass} key={index}>
                            {Number(pageNum) !== Number(props.thisPage) &&
                                <Link to={`/commentary?page=${pageNum}`}>
                                    {pageNum}
                                </Link>
                            }
                            {Number(pageNum) === Number(props.thisPage) &&
                                <div>{pageNum}</div>
                            }
                        </div>
                    )
                })
            }
        </div>
    );
}

export default Pages;