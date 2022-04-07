import { React } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import { HOME_URL, FORECAST_URL, BASIC_FORECAST_URL, DEFAULT_FORECAST_URL,
    SEAT_DETAILS_URL, ARCHIVE_LIST_URL, ARCHIVE_URL, ARCHIVE_SEAT_URL, 
    GUIDE_URL, METHODOLOGY_URL, COMMENTARY_URL, COMMENTARY_SINGLE_URL, ABOUT_URL} from 'config/urls';

import { Forecast, SeatDetails, ArchiveList, Archive, ArchiveSeat, 
    Guide, Methodology, Commentary, CommentarySingle, About } from 'pages';

const AllRoutes = () => {

    return (
        // Based on the current route, use the appropriate component
        // for the page: either login or home page
        <BrowserRouter>
            <Routes>
                <Route path={ARCHIVE_LIST_URL} element={<ArchiveList />} />
                <Route path={ARCHIVE_SEAT_URL} element={<ArchiveSeat />} />
                <Route path={ARCHIVE_URL} element={<Archive />} />
                <Route path={FORECAST_URL} element={<Forecast />} />
                <Route path={GUIDE_URL} element={<Guide />} />
                <Route path={METHODOLOGY_URL} element={<Methodology />} />
                <Route path={COMMENTARY_SINGLE_URL} element={<CommentarySingle />} />
                <Route path={COMMENTARY_URL} element={<Commentary />} />
                <Route path={ABOUT_URL} element={<About />} />
                <Route path={BASIC_FORECAST_URL} element={<Navigate replace to={DEFAULT_FORECAST_URL} />} />
                <Route path={SEAT_DETAILS_URL} element={<SeatDetails />} />
                {/* Keep this last so that other pages don't get replaced by it */}
                <Route path={HOME_URL} element={<Navigate replace to={DEFAULT_FORECAST_URL} />} />
                {/* Redirect to home page if nothing else works */}
                <Route path="*" element={<Navigate replace to={HOME_URL} />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AllRoutes;
