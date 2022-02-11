import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { useUserRequired } from 'utils/hooks';
import { Header, ForecastsNav, LoadingMarker} from 'components';
import { getDirect } from 'utils/sdk';

import { parseDateStringAsUTC } from '../../utils/date.js'

import styles from './ArchiveList.module.css';

const ArchiveLink = props => {
  const mode = props.item.mode === "FC" ? "General Forecast" : "Nowcast";
  const date = parseDateStringAsUTC(props.item.date);
  const url = "/archive/"
               + props.code + "/"
               + props.item.id

  return (
    <p>
      {mode}{", "}{date} &mdash; <Link to={url}>{props.item.name}</Link>
    </p>
  )
}

const ArchiveList = () => {
  const { code } = useParams();
  // Putting this here instructs the frontend to only display this page
  // if a valid user is logged in. As always, don't trust the client
  // and protect on the backend as well!
  useUserRequired();
  const [ archiveList, setArchiveList] = useState({});
  const [ archiveListValid, setArchiveListValid] = useState(false);

  useEffect(() => {
    setArchiveListValid(false);

    const getArchiveList = () => {
      return getDirect(`forecast-api/election-archives/${code}`).then(
        resp => {
          if (!resp.ok) throw Error("Couldn't find archives for this election");
          return resp.data;
        }
      );
    }

    const fetchArchiveList = () => {
      getArchiveList().then(
        data => {
          setArchiveList(data);
          setArchiveListValid(true);
        }
      ).catch(
        e => {
          console.log(e);
        }
      );
    }

    fetchArchiveList();
  }, [code]);

  return (
    <>
      <Header />
      <ForecastsNav election={code} mode="archives" />
      <div className={styles.content}>
        {archiveListValid &&
          <>
            {
              archiveList.map(item => <ArchiveLink item={item} code={code} />)
            }
          </>
        }
        {!archiveListValid &&
          <LoadingMarker />
        }
      </div>
    </>
  );
};

export default ArchiveList;
