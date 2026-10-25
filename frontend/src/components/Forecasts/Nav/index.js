import React, {useState} from 'react';
import PropTypes from 'prop-types';

import {Link, useLocation} from 'react-router-dom';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import styles from './ForecastsNav.module.css';
import {isOutlook} from '../../../utils/outlook.js';

const ElectionNav = props => {
  const thisClass =
    props.activeElection === props.election
      ? styles.navselected
      : styles.navitem;
  const linkUrl = '/forecast/' + props.election + '/' + props.mode;
  return (
    <Nav.Link
      as={Link}
      to={linkUrl}
      eventKey={linkUrl}
      aria-current={
        props.activeElection === props.election ? 'true' : undefined
      }
    >
      <div className={thisClass}>{props.text}</div>
    </Nav.Link>
  );
};
ElectionNav.propTypes = {
  activeElection: PropTypes.string.isRequired,
  election: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
};

const ElectionNavDropdown = props => {
  const thisClass =
    props.activeElection === props.election
      ? styles.navselected
      : styles.navitem;
  const linkUrl = '/forecast/' + props.election + '/' + props.mode;
  return (
    <NavDropdown.Item
      as={Link}
      to={linkUrl}
      eventKey={linkUrl}
      aria-current={
        props.activeElection === props.election ? 'true' : undefined
      }
    >
      <div className={thisClass}>{props.text}</div>
    </NavDropdown.Item>
  );
};
ElectionNavDropdown.propTypes = {
  activeElection: PropTypes.string.isRequired,
  election: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
};

const ModeNav = props => {
  const {pathname} = useLocation();
  const thisClass =
    props.activeMode === props.mode ? styles.navselected : styles.navitem;
  const linkUrl = '/forecast/' + props.election + '/' + props.mode;
  return (
    <Nav.Link
      as={Link}
      to={linkUrl}
      eventKey={linkUrl}
      aria-current={
        props.activeMode === props.mode
          ? pathname.replace(/\/$/, '') === linkUrl
            ? 'page'
            : 'true'
          : undefined
      }
    >
      <div className={thisClass}>{props.text}</div>
    </Nav.Link>
  );
};
ModeNav.propTypes = {
  activeMode: PropTypes.string.isRequired,
  election: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
};

const live_elections = [
  '2026sa',
  '2025fed',
  '2024qld',
  '2023nsw',
  '2022vic',
  '2022fed',
  '2022sa',
  '2019nsw',
  '2019fed',
];

const pastElections = [
  ['2026sa', '2026 South Australia'],
  ['2025fed', '2025 Federal'],
  ['2025wa', '2025 Western Australia'],
  ['2024qld', '2024 Queensland'],
  ['2023nsw', '2023 New South Wales'],
  ['2022vic', '2022 Victoria'],
  ['2022fed', '2022 Federal'],
  ['2022sa', '2022 South Australia'],
];

const ForecastsNav = props => {
  const [electionsExpanded, setElectionsExpanded] = useState(false);
  const [modesExpanded, setModesExpanded] = useState(false);
  const pastElection = pastElections.find(([code]) => code === props.election);
  // Switching elections retains nowcast/archive-list browsing, but live and
  // individual archived reports return to a regular summary. "other" marks an
  // archived report: no current mode is selected, and all mode links stay usable.
  let effectiveMode = props.mode;
  if (props.mode === 'other') effectiveMode = 'regular';
  if (props.mode === 'live') effectiveMode = 'regular';
  if (props.mode === '') effectiveMode = 'regular';
  return (
    <>
      <Navbar
        bg="light"
        expand="sm"
        className={styles.navbar}
        aria-label="Elections"
        expanded={electionsExpanded}
        onToggle={setElectionsExpanded}
        collapseOnSelect
      >
        <Container>
          <Nav className="m-auto">
            <Navbar.Text>
              <div className={styles.title}>Elections</div>
            </Navbar.Text>
            <Navbar.Toggle
              label="Toggle elections"
              aria-controls="elections-navigation"
              aria-expanded={electionsExpanded}
            />
            <Navbar.Collapse
              id="elections-navigation"
              className="justify-content-end"
            >
              <ElectionNav
                text="Victoria"
                election="2026vic"
                mode={effectiveMode}
                activeElection={props.election}
              />
              <ElectionNav
                text="New South Wales"
                election="2027nsw"
                mode={effectiveMode}
                activeElection={props.election}
              />
              <ElectionNav
                text="Federal"
                election="2028fed"
                mode={effectiveMode}
                activeElection={props.election}
              />
              <NavDropdown
                id="past-elections-navigation"
                title={
                  <span
                    className={pastElection ? styles.navselected : undefined}
                  >
                    Past Elections
                    {pastElection && (
                      <span className="visually-hidden">
                        : {pastElection[1]} selected
                      </span>
                    )}
                  </span>
                }
              >
                {pastElections.map(([code, text]) => (
                  <ElectionNavDropdown
                    key={code}
                    text={text}
                    election={code}
                    mode={effectiveMode}
                    activeElection={props.election}
                  />
                ))}
              </NavDropdown>
            </Navbar.Collapse>
          </Nav>
        </Container>
      </Navbar>
      <Navbar
        bg="light"
        expand="sm"
        className={styles.navbar}
        aria-label="Modes"
        expanded={modesExpanded}
        onToggle={setModesExpanded}
        collapseOnSelect
      >
        <Container>
          <Nav className="m-auto">
            <Navbar.Text>
              <div className={styles.title}>Modes</div>
            </Navbar.Text>
            <Navbar.Toggle
              label="Toggle modes"
              aria-controls="modes-navigation"
              aria-expanded={modesExpanded}
            />
            <Navbar.Collapse
              id="modes-navigation"
              className="justify-content-end"
            >
              <ModeNav
                text={
                  isOutlook(props.election) ? 'Outlook' : 'Regular Forecast'
                }
                election={props.election}
                mode="regular"
                activeMode={props.mode}
              />
              <ModeNav
                text="Nowcast"
                election={props.election}
                mode="nowcast"
                activeMode={props.mode}
              />
              <ModeNav
                text="Archives"
                election={props.election}
                mode="archives"
                activeMode={props.mode}
              />
              {live_elections.includes(props.election) && (
                <ModeNav
                  text="Live"
                  election={props.election}
                  mode="live"
                  activeMode={props.mode}
                />
              )}
            </Navbar.Collapse>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};
ForecastsNav.propTypes = {
  election: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
};

export default ForecastsNav;
