import React, {useState, useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';

import {
  Header,
  Footer,
  CommentaryHeader,
  CommentaryItem,
  CommentaryPages,
  CommentaryTags,
  LoadingMarker,
  StandardErrorBoundary,
} from 'components';
import {useWindowDimensions} from '../../utils/window.js';
import {getDirect} from 'utils/sdk';

import styles from './Commentary.module.css';

const Commentary = () => {
  const [searchParams] = useSearchParams();
  const [commentaries, setCommentaries] = useState([]);
  const [commentariesValid, setCommentariesValid] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [allTags, setAllTags] = useState([]);
  const windowDimensions = useWindowDimensions();
  document.title = `AEF - Commentary`;

  let page = searchParams.get('page');
  let tag = searchParams.get('tag');
  if (page === null) page = 1;

  useEffect(() => {
    setCommentariesValid(false);

    const getCommentaries = () => {
      let url = `commentary-api/all-commentaries?page=${page}`;
      if (tag) url += `&tag=${tag}`;
      return getDirect(url).then(resp => {
        if (!resp.ok) throw Error("Couldn't find commentary data");
        return resp.data;
      });
    };

    const fetchCommentaries = () => {
      getCommentaries()
        .then(data => {
          const commentaries = data.commentaries;
          commentaries.sort((a, b) => {
            if (a.date > b.date) return -1;
            if (a.date < b.date) return 1;
            return 0;
          });
          setAllTags(data.allTags);
          setPageCount(data.pageCount);
          setCommentaries(commentaries);
          setCommentariesValid(true);
        })
        .catch(e => {
          console.log(e);
        });
    };

    fetchCommentaries();
  }, [searchParams, page, tag]);

  return (
    <div className={styles.site}>
      <Header windowWidth={windowDimensions.width} page={'commentary'} />
      <div className={styles.content}>
        <CommentaryHeader />
        <StandardErrorBoundary>
          {commentariesValid && (
            <>
              <CommentaryPages
                pageCount={pageCount}
                thisPage={page}
                tag={tag}
              />
              <CommentaryTags allTags={allTags} thisTag={tag} />
              <div className={styles.mainText}>
                {commentaries.map((commentary, index) => (
                  <StandardErrorBoundary key={index}>
                    <CommentaryItem
                      commentary={commentary}
                      key={index}
                      headingLink={true}
                      returnPage={page}
                      returnTag={tag}
                    />
                    {index !== commentaries.length - 1 && <hr />}
                  </StandardErrorBoundary>
                ))}
              </div>
              <CommentaryPages
                pageCount={pageCount}
                thisPage={page}
                tag={tag}
              />
              <CommentaryTags allTags={allTags} thisTag={tag} />
            </>
          )}
          {!commentariesValid && <LoadingMarker text="Loading ..." />}
        </StandardErrorBoundary>
      </div>
      <Footer />
    </div>
  );
};

export default Commentary;
