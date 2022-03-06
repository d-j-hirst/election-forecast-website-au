// import React, { useContext, useCallback, useState, useEffect } from 'react';
// import { useHistory, Link } from 'react-router-dom';

// import { useUserRequired } from 'utils/hooks';
// // import { getMeApi, isLoggedIn } from 'utils/user';
// import { UserContext, Layout } from 'components';
// import { logout } from './sdk';
// import { getDirect } from 'utils/sdk';
// import styles from './Home.module.css';
// // import axios from 'axios'

// // const { REACT_APP_BASE_BACKEND_URL } = process.env;

// const Home = () => {
//   // Putting this here instructs the frontend to only display this page
//   // if a valid user is logged in. As always, don't trust the client
//   // and protect on the backend as well!
//   useUserRequired();
//   const history = useHistory();
//   const { user, setUser } = useContext(UserContext);
//   const [ electionList, setElectionList ] = useState([])

//   // const getUserInfo = () => {
//   //   return getMeApi().then(resp => {return resp.data;});
//   // }

//   // const getProtectedForecast = () => {
//   //   return getDirect('forecast-api/protected').then(resp => {return resp.data;});
//   // }

//   // const getRestrictedForecast = () => {
//   //   return getDirect('forecast-api/restricted').then(resp => {return resp.data;});
//   // }

//   const getElectionList = () => {
//     return getDirect('forecast-api/election-list').then(
//       resp => {
//         if (!resp.ok) throw Error("Couldn't find election list");
//         return resp.data;
//       }
//     );
//   }

//   useEffect(() => {
//     const fetchElectionList = () => {
//       getElectionList().then(
//         data => {
//           setElectionList(data);
//         }
//       ).catch(
//         e => {
//           console.log(e);
//         }
//       );
//     }
//     fetchElectionList();
//   }, []);

//   const handleLogout = useCallback(() => {
//     logout().then(() => {
//       setUser(null);
//       history.push(LOGIN_URL);
//     });
//   }, [setUser, history]);

//   if (!user) {
//     return null;
//   }

//   const listItems = electionList.map(d => <><Link to={`/forecast/${d[0]}/regular`}><button className={styles.otherBtn} >{d[1]}</button></Link><br /><br /></>)

//   return (
//     <Layout className={styles.content}>
//       <h1 className={styles.pageHeader}>
//         You are successfully logged in to the Australian&nbsp;Election&nbsp;Forecasts
//         testing website!
//         <br/>
//         <br/>
//         You are logged in as <strong>{user.email}</strong>
//         <br/>
//         <br/>
//         Elections:
//         <br/>
//         <br/>
//         {listItems}
//       </h1>
//       <button className={styles.logoutBtn} onClick={handleLogout}>
//         Logout
//       </button>
//     </Layout>
//   );
// };

// export default Home;
