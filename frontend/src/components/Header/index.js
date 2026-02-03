import React from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

import logo from './assets/logo.png';
import styles from './Header.module.css';

const SeparateBarThreshold = 940;

const PageNav = props => {
  const thisClass =
    props.activePage === props.page ? styles.navselected : styles.navitem;
  const linkUrl = '/' + props.page;
  return (
    <Nav.Link as={Link} to={linkUrl} className={styles.navlink}>
      <div className={thisClass}>{props.text}</div>
    </Nav.Link>
  );
};
PageNav.propTypes = {
  activePage: PropTypes.string.isRequired,
  page: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

const Header = props => (
  <>
    <div className={styles.pageWrapper}>
      <Link to={'/'}>
        <img
          className={styles.logo}
          src={logo}
          alt="Australian Election Forecasts logo"
        />
      </Link>
      {props.windowWidth >= SeparateBarThreshold && (
        <div className={styles.mainLinkArea}>
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
        </div>
      )}
    </div>
    {props.windowWidth < SeparateBarThreshold && (
      <Navbar bg="light" expand="md" className={styles.navbar}>
        <Container>
          <Nav className="m-auto">
            <Navbar.Text>
              <div className={styles.title}>Pages</div>
            </Navbar.Text>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse
              id="basic-navbar-nav"
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
  </>
);
Header.propTypes = {
  page: PropTypes.string.isRequired,
  windowWidth: PropTypes.number.isRequired,
};

export default Header;
