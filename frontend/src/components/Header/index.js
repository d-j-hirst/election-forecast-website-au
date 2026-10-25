import React, {useState} from 'react';
import PropTypes from 'prop-types';

import {Link, useLocation} from 'react-router-dom';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

import logo from './assets/logo.png';
import styles from './Header.module.css';

const SeparateBarThreshold = 940;

const PageNav = props => {
  const {pathname} = useLocation();
  const selected = props.activePage === props.page;
  const thisClass = selected ? styles.navselected : styles.navitem;
  const linkUrl = '/' + props.page;
  return (
    <Nav.Link
      as={Link}
      to={linkUrl}
      eventKey={linkUrl}
      className={styles.navlink}
      aria-current={
        selected
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
PageNav.propTypes = {
  activePage: PropTypes.string.isRequired,
  page: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

const Header = props => {
  // The page key names the top-level section, including on its detail pages.
  // Explicit expansion state keeps the toggle's announcement in sync with CSS.
  const [expanded, setExpanded] = useState(false);
  return (
    <header>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <div className={styles.pageWrapper}>
        <Link to={'/'}>
          <img
            className={styles.logo}
            src={logo}
            alt="Australian Election Forecasts logo"
          />
        </Link>
        {props.windowWidth >= SeparateBarThreshold && (
          <nav aria-label="Pages" className={styles.mainLinkArea}>
            <PageNav text="Forecasts" page="forecast" activePage={props.page} />
            <PageNav text="Guide" page="guide" activePage={props.page} />
            <PageNav text="Glossary" page="glossary" activePage={props.page} />
            <PageNav text="Methods" page="methods" activePage={props.page} />
            <PageNav
              text="Commentary"
              page="commentary"
              activePage={props.page}
            />
            <PageNav text="About" page="about" activePage={props.page} />
          </nav>
        )}
      </div>
      {props.windowWidth < SeparateBarThreshold && (
        <Navbar
          bg="light"
          expand="md"
          className={styles.navbar}
          aria-label="Pages"
          expanded={expanded}
          onToggle={setExpanded}
          collapseOnSelect
        >
          <Container>
            <Nav className="m-auto">
              <Navbar.Text>
                <div className={styles.title}>Pages</div>
              </Navbar.Text>
              <Navbar.Toggle
                label="Toggle pages"
                aria-controls="pages-navigation"
                aria-expanded={expanded}
              />
              <Navbar.Collapse
                id="pages-navigation"
                className="justify-content-center"
              >
                <PageNav
                  text="Forecasts"
                  page="forecast"
                  activePage={props.page}
                />
                <PageNav text="Guide" page="guide" activePage={props.page} />
                <PageNav
                  text="Glossary"
                  page="glossary"
                  activePage={props.page}
                />
                <PageNav
                  text="Methods"
                  page="methods"
                  activePage={props.page}
                />
                <PageNav
                  text="Commentary"
                  page="commentary"
                  activePage={props.page}
                />
                <PageNav text="About" page="about" activePage={props.page} />
              </Navbar.Collapse>
            </Nav>
          </Container>
        </Navbar>
      )}
    </header>
  );
};
Header.propTypes = {
  page: PropTypes.string.isRequired,
  windowWidth: PropTypes.number.isRequired,
};

export default Header;
