import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import RouteFocus from '../components/MainContent/RouteFocus';

import {
  ABOUT_URL,
  ARCHIVE_URL,
  ARCHIVE_LIST_URL,
  ARCHIVE_SEAT_URL,
  BASIC_FORECAST_URL,
  COMMENTARY_SINGLE_URL,
  COMMENTARY_URL,
  DEFAULT_FORECAST_URL,
  FORECAST_URL,
  GLOSSARY_URL,
  GUIDE_URL,
  HOME_URL,
  SEAT_DETAILS_URL,
  METHODOLOGY_URL,
  METHODS_URL,
  SUPPORT_URL,
} from 'config/urls';

import {
  About,
  Archive,
  ArchiveList,
  ArchiveSeat,
  Commentary,
  CommentarySingle,
  Forecast,
  Glossary,
  Guide,
  Methods,
  NotFound,
  SeatDetails,
  Support,
} from 'pages';

const AllRoutes = () => {
  return (
    // Based on the current route, use the appropriate component
    // for the page
    <BrowserRouter>
      <RouteFocus />
      <Routes>
        <Route path={ARCHIVE_LIST_URL} element={<ArchiveList />} />
        <Route path={ARCHIVE_SEAT_URL} element={<ArchiveSeat />} />
        <Route path={ARCHIVE_URL} element={<Archive />} />
        <Route path={FORECAST_URL} element={<Forecast />} />
        <Route path={GUIDE_URL} element={<Guide />} />
        <Route path={GLOSSARY_URL} element={<Glossary />} />
        <Route path={METHODS_URL} element={<Methods />} />
        {/* Redirect to methods page if old "methodology" page is accessed */}
        <Route
          path={METHODOLOGY_URL}
          element={<Navigate replace to={METHODS_URL} />}
        />
        <Route path={COMMENTARY_SINGLE_URL} element={<CommentarySingle />} />
        <Route path={COMMENTARY_URL} element={<Commentary />} />
        <Route path={ABOUT_URL} element={<About />} />
        <Route path={SUPPORT_URL} element={<Support />} />
        <Route
          path={BASIC_FORECAST_URL}
          element={<Navigate replace to={DEFAULT_FORECAST_URL} />}
        />
        <Route path={SEAT_DETAILS_URL} element={<SeatDetails />} />
        {/* Only intentional entry points choose the default forecast. */}
        <Route
          path={HOME_URL}
          element={<Navigate replace to={DEFAULT_FORECAST_URL} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AllRoutes;
