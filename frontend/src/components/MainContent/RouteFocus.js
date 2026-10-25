import {useEffect, useRef} from 'react';
import {useLocation, useNavigationType} from 'react-router-dom';

// Announce deliberate page changes through focus without interfering with native
// history restoration, hash-link targets, filters or background data updates.
const RouteFocus = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    const changedPage = previousPath.current !== location.pathname;
    previousPath.current = location.pathname;
    if (!changedPage || navigationType === 'POP' || location.hash) return;

    const main = document.getElementById('main-content');
    if (main) {
      main.focus({preventScroll: true});
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash, navigationType]);

  return null;
};

export default RouteFocus;
