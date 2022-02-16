import React from 'react';

import { Link } from 'react-router-dom';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

import logo from './assets/logo.png'
import styles from './Header.module.css';

const PageNav = props => {
    const thisClass = props.activePage === props.page ? styles.navselected : styles.navitem;
    const linkUrl = "/" + props.page;
    return (
        <Nav.Link as={Link} to={linkUrl}>
            <div className={thisClass}>
                {props.text}
            </div>
        </Nav.Link>
    )
}

const Header = props => (
    <>
        <div className={styles.pageWrapper}>
            <Link to={'/'}>
                <img className={styles.logo} src={logo} alt='Australian Election Forecasts logo'/>
            </Link>
            {props.windowWidth >= 740 && 
                <div className={styles.mainLinkArea}>
                    <PageNav text="Forecasts" page="forecast" activePage={props.page} />
                    <PageNav text="FAQ" page="faq" activePage={props.page} />
                    <PageNav text="Methodology" page="methodology" activePage={props.page} />
                    <PageNav text="Commentary" page="commentary" activePage={props.page} />
                    <PageNav text="About" page="about" activePage={props.page} />
                </div>
            }
        </div>
        {props.windowWidth < 740 &&
            <Navbar bg="light" expand="sm" className={styles.navbar}>
                <Container>
                    <Nav defaultActiveKey={"/forecast/" + props.election + "/" + props.mode} className="m-auto">
                        <Navbar.Text><div className={styles.title}>Pages</div></Navbar.Text>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
                            <PageNav text="Forecasts" page="forecast" activePage={props.page} />
                            <PageNav text="FAQ" page="faq" activePage={props.page} />
                            <PageNav text="Methodology" page="methodology" activePage={props.page} />
                            <PageNav text="Commentary" page="commentary" activePage={props.page} />
                            <PageNav text="About" page="about" activePage={props.page} />
                        </Navbar.Collapse>
                    </Nav>
                </Container>
            </Navbar>
        }
    </>
);

export default Header;