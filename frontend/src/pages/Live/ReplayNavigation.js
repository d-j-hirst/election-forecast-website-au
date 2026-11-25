import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {countTime} from 'utils/date';
import useStoredBoolean from './useStoredBoolean';

const rangeKeys = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
];

// Let controls that use arrows for editing, selection or exploring a chart
// keep their own keyboard behaviour, including the replay slider itself.
const arrowControls = [
  'input, textarea, select, video, audio, [contenteditable], dialog',
  '[role="dialog"], [role="tablist"], [role="menu"], [role="menubar"]',
  '[role="textbox"], [role="combobox"], [role="listbox"], [role="slider"]',
  '[role="radiogroup"], [role="grid"], [role="application"], .dropdown-menu',
  '.dropdown-toggle[aria-expanded="true"], .recharts-wrapper',
].join(', ');

export default function ReplayNavigation({
  publication,
  snapshot,
  selectSnapshot,
}) {
  const {
    replay_navigation: step,
    replayTimeline: timeline,
    replay_complete: complete,
  } = publication;
  const target = snapshot || timeline[timeline.length - 1].id;
  const loading = target !== publication.forecast_id;
  const [pinned, setPinned] = useStoredBoolean('liveReplay:pinControls', true);
  const gesture = useRef(null);
  const [preview, setPreview] = useState(null);

  // Readers can step through the same part of successive reports with the
  // controls offscreen. Use the buttons' destinations without moving focus.
  useEffect(() => {
    const stepWithArrows = event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (
        loading ||
        gesture.current ||
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.target.closest?.(arrowControls)
      )
        return;

      const destination = event.key === 'ArrowLeft' ? step.previous : step.next;
      if (destination) {
        event.preventDefault();
        selectSnapshot(destination);
      }
    };
    window.addEventListener('keydown', stepWithArrows);
    return () => window.removeEventListener('keydown', stepWithArrows);
  }, [loading, step.previous, step.next, selectSnapshot]);

  // A late upload can insert a snapshot anywhere. Keep the order the reader
  // started dragging through so releasing the thumb opens the time shown.
  const begin = () => {
    if (!gesture.current) {
      gesture.current = timeline;
      setPreview({ordered: timeline, position: step.position});
    }
  };
  const cancel = () => {
    gesture.current = null;
    setPreview(null);
  };
  const choose = (ordered, position) => {
    const target = ordered[position - 1];
    if (target && target.id !== publication.forecast_id)
      selectSnapshot(target.id);
  };
  const finish = event => {
    if (gesture.current)
      choose(gesture.current, event.currentTarget.valueAsNumber);
    cancel();
  };
  const change = event => {
    const position = event.currentTarget.valueAsNumber;
    if (gesture.current) setPreview({ordered: gesture.current, position});
    else choose(timeline, position); // Assistive input can set the value directly.
  };
  const ordered = preview?.ordered || timeline;
  const requested = loading
    ? timeline.findIndex(entry => entry.id === target) + 1
    : 0;
  const position = preview?.position || requested || step.position;
  const date = countTime(ordered[position - 1].time, publication.run.timezone);
  const label = `Snapshot ${position} of ${ordered.length}`;

  return (
    <nav
      aria-label="Replay snapshots"
      className={`replay-controls my-2${
        pinned ? ' replay-controls-pinned' : ''
      }`}
    >
      <button
        type="button"
        className="btn btn-secondary btn-sm replay-pin"
        aria-label={pinned ? 'Unpin replay controls' : 'Pin replay controls'}
        title={
          pinned
            ? 'Unpin replay controls while scrolling'
            : 'Keep replay controls on screen while scrolling'
        }
        onClick={() => setPinned(!pinned)}
      >
        {pinned ? '×' : 'Pin'}
      </button>
      <div className="replay-steps">
        <button
          className="btn btn-secondary btn-sm"
          disabled={loading || !step.previous}
          onClick={() => selectSnapshot(step.first)}
        >
          First
        </button>
        <button
          className="btn btn-secondary btn-sm"
          title="Previous snapshot (←)"
          aria-keyshortcuts="ArrowLeft"
          disabled={loading || !step.previous}
          onClick={() => selectSnapshot(step.previous)}
        >
          Back
        </button>
        <span className="replay-position">
          <span
            className="replay-position-size"
            aria-hidden="true"
            data-size={`Snapshot ${ordered.length} of ${ordered.length}`}
          />
          <span aria-live={preview ? 'off' : 'polite'} aria-atomic="true">
            {loading && !preview ? 'Loading…' : label}
          </span>
        </span>
        <button
          className="btn btn-secondary btn-sm"
          title="Next snapshot (→)"
          aria-keyshortcuts="ArrowRight"
          disabled={loading || !step.next}
          onClick={() => selectSnapshot(step.next)}
        >
          Forward
        </button>
        <button
          className="btn btn-secondary btn-sm"
          disabled={loading || !snapshot}
          onClick={() => selectSnapshot(null)}
        >
          {complete ? 'Latest' : 'Follow latest'}
        </button>
      </div>
      <div className="d-flex align-items-center flex-wrap gap-2 mt-1">
        <input
          type="range"
          className="form-range"
          style={{flex: '1 1 12rem'}}
          min={1}
          max={ordered.length}
          step={1}
          value={position}
          disabled={loading || ordered.length < 2}
          aria-label="Choose replay snapshot"
          aria-valuetext={label + ', ' + date}
          onPointerDown={begin}
          onPointerUp={finish}
          onPointerCancel={cancel}
          onKeyDown={event => {
            if (rangeKeys.includes(event.key)) begin();
          }}
          onKeyUp={event => {
            if (rangeKeys.includes(event.key)) finish(event);
          }}
          onChange={change}
          onBlur={finish}
        />
        <small>{date}</small>
      </div>
    </nav>
  );
}

ReplayNavigation.propTypes = {
  publication: PropTypes.object.isRequired,
  snapshot: PropTypes.string,
  selectSnapshot: PropTypes.func.isRequired,
};
