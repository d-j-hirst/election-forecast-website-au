import React from 'react';

import { Link } from 'react-router-dom';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import styles from './ForecastsNav.module.css';

const ElectionNav = props => {
    const thisClass = props.activeElection === props.election ? styles.navselected : styles.navitem;
    const linkUrl = "/forecast/" + props.election + "/" + props.mode;
    return (
        <Nav.Link as={Link} to={linkUrl}>
            <div className={thisClass}>
                {props.text}
            </div>
        </Nav.Link>
    )
}
const ElectionNavDropdown = props => {
    const thisClass = props.activeElection === props.election ? styles.navselected : styles.navitem;
    const linkUrl = "/forecast/" + props.election + "/" + props.mode;
    return (
        <NavDropdown.Item as={Link} to={linkUrl}>
            <div className={thisClass}>
                {props.text}
            </div>
        </NavDropdown.Item>
    )
}

const ModeNav = props => {
    const thisClass = props.activeMode === props.mode ? styles.navselected : styles.navitem;
    const linkUrl = "/forecast/" + props.election + "/" + props.mode;
    return (
        <Nav.Link as={Link} to={linkUrl}>
            <div className={thisClass}>
                {props.text}
            </div>
        </Nav.Link>
    )
}

const ForecastsNav = props => {
    // This determines the type of forecast we get from switching elections
    let effectiveMode = props.mode;
    if (props.mode === "other") effectiveMode = "regular";
    if (props.mode === "live") effectiveMode = "regular";
    return (
        <>
        <Navbar bg="light" expand="sm" className={styles.navbar}>
            <Container>
                <Nav defaultActiveKey={"/forecast/" + props.election + "/" + props.mode} className="m-auto">
                    <Navbar.Text><div className={styles.title}>Elections</div></Navbar.Text>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                            <ElectionNav text="Victoria" election="2022vic" mode={effectiveMode} activeElection={props.election} />
                            <NavDropdown title="Past Elections">
                                <ElectionNavDropdown text="2022 Federal" election="2022fed" mode={effectiveMode} activeElection={props.election} />
                                <ElectionNavDropdown text="2022 South Australia" election="2022sa" mode={effectiveMode} activeElection={props.election} />
                            </NavDropdown>
                    </Navbar.Collapse>
                </Nav>
            </Container>
        </Navbar>
        <Navbar bg="light" expand="sm" className={styles.navbar}>
            <Container>
                <Nav defaultActiveKey={"/forecast/" + props.election + "/" + props.mode} className="m-auto">
                    <Navbar.Text><div className={styles.title}>Modes</div></Navbar.Text>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <ModeNav text="Regular Forecast" election={props.election} mode="regular" activeMode={props.mode} />
                        <ModeNav text="Nowcast" election={props.election} mode="nowcast" activeMode={props.mode} />
                        <ModeNav text="Archives" election={props.election} mode="archives" activeMode={props.mode} />
                        {props.election === "2022sa" &&
                            <ModeNav text="Live" election={props.election} mode="live" activeMode={props.mode} />
                        }
                        {props.election === "2019fed" &&
                            <ModeNav text="Live" election={props.election} mode="live" activeMode={props.mode} />
                        }
                        {props.election === "2022fed" &&
                            <ModeNav text="Live" election={props.election} mode="live" activeMode={props.mode} />
                        }
                        
                    </Navbar.Collapse>
                </Nav>
            </Container>
        </Navbar>
        </>
    )
};

export default ForecastsNav;