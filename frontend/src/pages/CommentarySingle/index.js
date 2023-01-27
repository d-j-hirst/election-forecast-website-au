import React, {useState, useEffect} from 'react';
import {useParams, useSearchParams} from 'react-router-dom';

import {
  Header,
  Footer,
  CommentaryHeader,
  CommentaryItem,
  LoadingMarker,
  StandardErrorBoundary,
} from 'components';
import {useWindowDimensions} from '../../utils/window.js';
import {getDirect} from 'utils/sdk';

import styles from './CommentarySingle.module.css';

const CommentarySingle = () => {
  const {id} = useParams();
  const [searchParams] = useSearchParams();
  const [commentary, setCommentary] = useState([]);
  const [commentaryValid, setCommentaryValid] = useState(false);
  const windowDimensions = useWindowDimensions();
  document.title = `AEF - Commentary`;

  let returnPage = searchParams.get('returnPage');
  if (returnPage === null) returnPage = 1;
  let returnTag = searchParams.get('returnTag');

  useEffect(() => {
    setCommentaryValid(false);

    const getCommentary = () => {
      return getDirect(`commentary-api/commentary/${id}/`).then(resp => {
        if (!resp.ok) throw Error("Couldn't find commentary data");
        return resp.data;
      });
    };

    const fetchCommentary = () => {
      getCommentary()
        .then(data => {
          setCommentary(data);
          setCommentaryValid(true);
        })
        .catch(e => {
          console.log(e);
        });
    };

    fetchCommentary();
  }, [id]);

  return (
    <div className={styles.site}>
      <Header windowWidth={windowDimensions.width} page="commentary" />
      <div className={styles.content}>
        <CommentaryHeader
          returnLink
          returnPage={returnPage}
          returnTag={returnTag}
        />
        <StandardErrorBoundary>
          {commentaryValid && (
            <StandardErrorBoundary>
              <div className={styles.mainText}>
                <CommentaryItem commentary={commentary} />
              </div>
            </StandardErrorBoundary>
          )}
          {!commentaryValid && <LoadingMarker text="Loading ..." />}
        </StandardErrorBoundary>
      </div>
      <Footer />
    </div>
  );
};

export default CommentarySingle;
