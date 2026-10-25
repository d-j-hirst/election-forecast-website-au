import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter, Link, useNavigate} from 'react-router-dom';
import MainContent from './index';
import RouteFocus from './RouteFocus';

const Page = () => {
  const navigate = useNavigate();
  return (
    <>
      <RouteFocus />
      <Link to="/about">Next page</Link>
      <Link to="/about?filter=example">Filter</Link>
      <Link to="/guide#outline">Section link</Link>
      <button onClick={() => navigate('/methods', {replace: true})}>
        Replace page
      </button>
      <button onClick={() => navigate(-1)}>Back</button>
      <MainContent title="Example page">
        <button>Content action</button>
      </MainContent>
    </>
  );
};

beforeEach(() => {
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  window.scrollTo.mockRestore();
});

test('only a deliberate pathname change focuses main and scrolls to the top', () => {
  render(
    <MemoryRouter initialEntries={['/guide']}>
      <Page />
    </MemoryRouter>
  );
  expect(screen.getByRole('main')).not.toHaveFocus();
  expect(window.scrollTo).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('link', {name: 'Next page'}));
  expect(screen.getByRole('main')).toHaveFocus();
  expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0);
  window.scrollTo.mockClear();

  const action = screen.getByRole('button', {name: 'Content action'});
  action.focus();
  fireEvent.click(screen.getByRole('link', {name: 'Filter'}));
  expect(action).toHaveFocus();
  expect(window.scrollTo).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', {name: 'Replace page'}));
  expect(screen.getByRole('main')).toHaveFocus();
  expect(window.scrollTo).toHaveBeenCalledTimes(1);
});

test('hash navigation and history traversal keep their own focus/scroll behavior', () => {
  render(
    <MemoryRouter initialEntries={['/first', '/about']}>
      <Page />
    </MemoryRouter>
  );
  const action = screen.getByRole('button', {name: 'Content action'});
  action.focus();
  fireEvent.click(screen.getByRole('link', {name: 'Section link'}));
  expect(action).toHaveFocus();
  expect(window.scrollTo).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', {name: 'Back'}));
  expect(action).toHaveFocus();
  expect(window.scrollTo).not.toHaveBeenCalled();
});
