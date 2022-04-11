import React from 'react';

import { Link } from 'react-router-dom';

import styles from './Tags.module.css';

const Tags = props => {
    return (
        <div className={styles.tagBar}>
            <div className={styles.tagLink}>
                Tags:
            </div>
            <div className={props.thisTag === null ? styles.thisTag : styles.tagLink}>
                {props.thisTag !== null &&
                    <Link to={`/commentary`}>
                        All posts
                    </Link>
                }
                {props.thisTag === null &&
                    <div>All posts</div>
                }
            </div>
            {
                props.allTags.map((tag, index) => {
                    const whichClass = tag === props.thisTag ? styles.thisTag : styles.tagLink
                    return (
                        <div className={whichClass} key={index}>
                            {tag !== props.thisTag &&
                                <Link to={`/commentary?tag=${tag}`}>
                                    {tag}
                                </Link>
                            }
                            {tag === props.thisTag &&
                                <div>{tag}</div>
                            }
                        </div>
                    )
                })
            }
        </div>
    );
}

export default Tags;