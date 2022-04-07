import React, { useState , useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Header, Footer, CommentaryHeader, CommentaryItem, CommentaryPages, LoadingMarker, StandardErrorBoundary } from 'components';
import { useWindowDimensions } from '../../utils/window.js';
import { getDirect } from 'utils/sdk';

import styles from './Commentary.module.css';

const Commentary = () => {
    const [ searchParams ] = useSearchParams();
    const [ commentaries, setCommentaries ] = useState([]);
    const [ commentariesValid, setCommentariesValid ] = useState(false);
    const [ pageCount, setPageCount ] = useState([]);
    const windowDimensions = useWindowDimensions();
    document.title = `AEF - Commentary`;

    let page = searchParams.get('page');
    if (page === null) page = 1;

    useEffect(() => {
        setCommentariesValid(false);

        const getCommentaries = () => {
            return getDirect(`commentary-api/all-commentaries?page=${page}`).then(
                resp => {
                    if (!resp.ok) throw Error("Couldn't find commentary data");
                    return resp.data;
                }
            );
        }
    
        const fetchCommentaries = () => {
            getCommentaries().then(
                data => {
                    const commentaries = data.commentaries;
                    console.log(commentaries);
                    commentaries.sort((a, b) => {
                        if (a.date > b.date) return -1;
                        if (a.date < b.date) return 1;
                        return 0;
                    });
                    console.log(commentaries);
                    setPageCount(data.pageCount);
                    setCommentaries(commentaries);
                    setCommentariesValid(true);
                }
            ).catch(
                e => {
                    console.log(e);
                }
            );
        }
    
        fetchCommentaries();
    }, [searchParams]);

    return (
        <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"commentary"} />
            <div className={styles.content}>
                <CommentaryHeader />
                <StandardErrorBoundary>
                    {commentariesValid && <>
                        <div className={styles.mainText}>
                            {commentaries.map((commentary, index) => <StandardErrorBoundary>
                                <CommentaryItem commentary={commentary}
                                                key={index}
                                                headingLink={true}
                                                returnPage={page}
                                />
                                {index !== commentaries.length - 1 && <hr />}
                            </StandardErrorBoundary>)}
                        </div>
                        <CommentaryPages pageCount={pageCount} />
                    </>}
                    {!commentariesValid &&
                    <LoadingMarker text="Loading ..." />
                    }
                </StandardErrorBoundary>
            </div>
            <Footer />
        </div>
    );
};

export default Commentary;
