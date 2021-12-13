import React from 'react';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import styles from './ForecastsNav.module.css';

const ForecastsNav = (props) => (
    <>
    <Navbar bg="light" expand="sm">
        <Container >
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                <Nav defaultActiveKey={"/forecast/" + props.election + "/" + props.mode} className="m-auto">
                    <Navbar.Text><div className={styles.title}>Elections</div></Navbar.Text>
                    <Nav.Link href={"/forecast/2022fed/" + props.mode}><div className={styles.navitem}>Federal</div></Nav.Link>
                    <Nav.Link href={"/forecast/2022vic/" + props.mode}><div className={styles.navitem}>Victorian</div></Nav.Link>
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
                    <Nav.Link href={"/forecast/" + props.election + "/regular"}><div className={styles.navitem}>Regular Forecast</div></Nav.Link>
                    <Nav.Link href={"/forecast/" + props.election + "/nowcast"}><div className={styles.navitem}>Nowcast</div></Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
    </>
);

export default ForecastsNav;