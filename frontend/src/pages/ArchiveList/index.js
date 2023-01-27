import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {useParams, Link} from 'react-router-dom';

import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';

import {
  Header,
  Footer,
  ForecastsNav,
  LoadingMarker,
  StandardErrorBoundary,
} from 'components';
import {getDirect} from 'utils/sdk';

import {parseDateStringAsUTC} from '../../utils/date.js';
import {useWindowDimensions} from '../../utils/window.js';

import styles from './ArchiveList.module.css';

const FilterEnum = Object.freeze({all: 1, regular: 2, nowcast: 3, live: 4});

const ArchiveRow = props => {
  const modeNames = {
    FC: 'General Forecast',
    NC: 'Nowcast',
    LF: 'Live Forecast',
  };
  const mode = modeNames[props.item.mode];
  const date = parseDateStringAsUTC(props.item.date);
  const url = '/archive/' + props.code + '/' + props.item.id;

  return (
    <ListGroup.Item className={styles.archiveListItem}>
      <div>
        <Link to={url}>{props.item.label}</Link> - <strong>{mode}</strong>
        <br />
        <small>Report created at {date}</small>
      </div>
    </ListGroup.Item>
  );
};
ArchiveRow.propTypes = {
  item: PropTypes.object.isRequired,
  code: PropTypes.string.isRequired,
  id: PropTypes.number,
  seat: PropTypes.string.isRequired,
  isArchive: PropTypes.bool,
};

const ArchiveRowSet = props => {
  return (
    <>
      {props.archiveList.map((item, index) => {
        const display =
          props.filter === FilterEnum.all ||
          (props.filter === FilterEnum.regular && item.mode === 'FC') ||
          (props.filter === FilterEnum.nowcast && item.mode === 'NC') ||
          (props.filter === FilterEnum.live && item.mode === 'LF');
        if (display)
          return <ArchiveRow item={item} code={props.code} key={index} />;
        return null;
      })}
    </>
  );
};
ArchiveRowSet.propTypes = {
  archiveList: PropTypes.array.isRequired,
  filter: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
};

const ArchiveList = () => {
  const {code} = useParams();
  const [electionName, setElectionName] = useState('');
  const [archiveList, setArchiveList] = useState({});
  const [archiveListValid, setArchiveListValid] = useState(false);
  const [filter, setFilter] = useState(FilterEnum.regular);
  const windowDimensions = useWindowDimensions();

  useEffect(() => {
    setArchiveListValid(false);

    const getArchiveList = () => {
      return getDirect(`forecast-api/election-archives/${code}`).then(resp => {
        if (!resp.ok) throw Error("Couldn't find archives for this election");
        return resp.data;
      });
    };

    const fetchArchiveList = () => {
      getArchiveList()
        .then(data => {
          setElectionName(data[0]);
          document.title = `AEF - Archive list for ${data[0]}`;
          setArchiveList(data[1]);
          setArchiveListValid(true);
        })
        .catch(e => {
          console.log(e);
        });
    };

    fetchArchiveList();
  }, [code]);

  const title = (() => {
    let title = 'Filter by: ';
    if (filter === FilterEnum.all) title += 'All';
    else if (filter === FilterEnum.regular) title += 'General forecasts only';
    else if (filter === FilterEnum.nowcast) title += 'Nowcasts only';
    else if (filter === FilterEnum.live) title += 'Live forecasts only';
    return title;
  })();

  const setFilterAll = () => {
    setFilter(FilterEnum.all);
  };
  const setFilterRegular = () => {
    setFilter(FilterEnum.regular);
  };
  const setFilterNowcast = () => {
    setFilter(FilterEnum.nowcast);
  };
  const setFilterLive = () => {
    setFilter(FilterEnum.live);
  };

  return (
    <div className={styles.site}>
      <Header windowWidth={windowDimensions.width} page="archive" />
      <ForecastsNav election={code} mode="archives" />
      <div className={styles.content}>
        {archiveListValid && (
          <>
            {
              <Card className={styles.summary}>
                <Card.Header className={styles.archiveListTitle}>
                  <strong>Archives for {electionName}</strong>
                </Card.Header>
                <Card.Body className={styles.archiveListBody}>
                  <StandardErrorBoundary>
                    <ListGroup className={styles.archiveList}>
                      <ListGroup.Item className={styles.archiveListFilters}>
                        <DropdownButton
                          id="sort-dropdown"
                          title={title}
                          variant="secondary"
                        >
                          <Dropdown.Item as="button" onClick={setFilterAll}>
                            All
                          </Dropdown.Item>
                          <Dropdown.Item as="button" onClick={setFilterRegular}>
                            General forecasts only
                          </Dropdown.Item>
                          <Dropdown.Item as="button" onClick={setFilterNowcast}>
                            Nowcasts only
                          </Dropdown.Item>
                          <Dropdown.Item as="button" onClick={setFilterLive}>
                            Live forecasts only
                          </Dropdown.Item>
                        </DropdownButton>
                      </ListGroup.Item>
                      <ArchiveRowSet
                        archiveList={archiveList}
                        code={code}
                        filter={filter}
                      />
                    </ListGroup>
                  </StandardErrorBoundary>
                </Card.Body>
              </Card>
            }
          </>
        )}
        {!archiveListValid && <LoadingMarker text="Loading archive list" />}
      </div>
      <Footer />
    </div>
  );
};

export default ArchiveList;
