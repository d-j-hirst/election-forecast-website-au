import React, { useState , useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Header, Footer, CommentaryHeader, CommentaryItem, LoadingMarker } from 'components';
import { useWindowDimensions } from '../../utils/window.js';
import { getDirect } from 'utils/sdk';

import styles from './CommentarySingle.module.css';

const CommentarySingle = () => {
    const { id } = useParams();
    const [ commentary, setCommentary] = useState([]);
    const [ commentaryValid, setCommentaryValid] = useState(false);
    const windowDimensions = useWindowDimensions();
    document.title = `AEF - Commentary`;

    useEffect(() => {
        setCommentaryValid(false);
  
      const getCommentary = () => {
        return getDirect(`commentary-api/commentary/${id}/`).then(
          resp => {
            if (!resp.ok) throw Error("Couldn't find commentary data");
            return resp.data;
          }
        );
      }
  
      const fetchCommentary = () => {
        getCommentary().then(
          data => {
            setCommentary(data);
            setCommentaryValid(true);
          }
        ).catch(
          e => {
            console.log(e);
          }
        );
      }
  
      fetchCommentary();
    }, [id]);

    return (
      <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"commentary"} />
            <div className={styles.content}>
                <CommentaryHeader returnLink />
                {commentaryValid &&
                    <div className={styles.mainText}>
                        <CommentaryItem commentary={commentary} />
                    </div>
                }
                {!commentaryValid &&
                <LoadingMarker text="Loading ..." />
                }
            </div>
            <Footer />
        </div>
    );
};

export default CommentarySingle;
