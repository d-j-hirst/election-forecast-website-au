import React from 'react';

import { Link } from 'react-router-dom';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import styles from './ForecastsNav.module.css';

const ElectionNav = (props) => {
    const thisClass = props.activeElection === props.election ? styles.navselected : styles.navitem;
    return <Nav.Link as={Link} to={"/forecast/" + props.election + "/" + props.mode}><div className={thisClass}>{props.text}</div></Nav.Link>
}

const ModeNav = (props) => {
    const thisClass = props.activeMode === props.mode ? styles.navselected : styles.navitem;
    return <Nav.Link as={Link} to={"/forecast/" + props.election + "/" + props.mode}><div className={thisClass}>{props.text}</div></Nav.Link>
}

const ForecastsNav = (props) => (
    <>
    <Navbar bg="light" expand="sm">
        <Container >
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                <Nav defaultActiveKey={"/forecast/" + props.election + "/" + props.mode} className="m-auto">
                    <Navbar.Text><div className={styles.title}>Elections</div></Navbar.Text>
                    <ElectionNav text="Federal" election="2022fed" mode={props.mode} activeElection={props.election} />
                    <ElectionNav text="Victoria" election="2022vic" mode={props.mode} activeElection={props.election} />
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
    <Navbar bg="light" expand="sm">
        <Container>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                <Nav defaultActiveKey={"/forecast/" + props.election + "/" + props.mode} className="m-auto">
                    <Navbar.Text><div className={styles.title}>Modes</div></Navbar.Text>
                    <ModeNav text="Regular Forecast" election={props.election} mode="regular" activeMode={props.mode} />
                    <ModeNav text="Nowcast" election={props.election} mode="nowcast" activeMode={props.mode} />
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
    </>
);

export default ForecastsNav;