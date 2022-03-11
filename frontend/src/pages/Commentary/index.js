import React, { useState , useEffect } from 'react';

import { Header, Footer, CommentaryHeader, CommentaryItem, LoadingMarker, StandardErrorBoundary } from 'components';
import { useWindowDimensions } from '../../utils/window.js';
import { getDirect } from 'utils/sdk';

import styles from './Commentary.module.css';

const Commentary = () => {
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
            console.log(data);
            data.sort((a, b) => {
              if (a.date > b.date) return -1;
              if (a.date < b.date) return 1;
              return 0;
            });
            console.log(data);
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
                <StandardErrorBoundary>
                  {commentariesValid &&
                      <div className={styles.mainText}>
                          {commentaries.map((commentary, index) => <StandardErrorBoundary>
                              <CommentaryItem commentary={commentary} key={index} headingLink={true} />
                              {index !== commentaries.length - 1 && <hr />}
                          </StandardErrorBoundary>)}
                      </div>
                  }
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
