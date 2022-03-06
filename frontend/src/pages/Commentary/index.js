import React, { useState , useEffect } from 'react';

import { useUserRequired } from 'utils/hooks';
import { Header, Footer, CommentaryHeader, CommentaryItem, LoadingMarker } from 'components';
import { useWindowDimensions } from '../../utils/window.js';
import { getDirect } from 'utils/sdk';

import styles from './Commentary.module.css';

const Commentary = () => {
    // Putting this here instructs the frontend to only display this page
    // if a valid user is logged in. As always, don't trust the client
    // and protect on the backend as well!
    useUserRequired();
    const [ commentaries, setCommentaries] = useState([]);
    const [ commentariesValid, setCommentariesValid] = useState(false);
    const windowDimensions = useWindowDimensions();
    document.title = `AEF - Commentary`;

    useEffect(() => {
        setCommentariesValid(false);
  
      const getCommentaries = () => {
        return getDirect(`commentary-api/all-commentaries`).then(
          resp => {
            if (!resp.ok) throw Error("Couldn't find commentary data");
            return resp.data;
          }
        );
      }
  
      const fetchCommentaries = () => {
        getCommentaries().then(
          data => {
            setCommentaries(data);
            setCommentariesValid(true);
          }
        ).catch(
          e => {
            console.log(e);
          }
        );
      }
  
      fetchCommentaries();
    }, []);

    return (
      <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"commentary"} />
            <div className={styles.content}>
                <CommentaryHeader />
                {commentariesValid &&
                    <div className={styles.mainText}>
                        {commentaries.map((commentary, index) => <>
                            <CommentaryItem commentary={commentary} key={index} headingLink={true} />
                            {index !== commentaries.length - 1 && <hr />}
                        </>)}
                    </div>
                }
                {!commentariesValid &&
                <LoadingMarker text="Loading ..." />
                }
            </div>
            <Footer />
        </div>
    );
};

export default Commentary;
