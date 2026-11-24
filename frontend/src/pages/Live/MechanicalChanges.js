import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {SmartBadge} from '../../components/General/PartyBadge';
import governmentOutcomes from 'components/Forecasts/FormationOfGovernment/governmentOutcomes';
import {seatPartyCode, seriesPartyCode} from 'utils/coalition';
import formatCountPercentage from 'utils/formatCountPercentage';
import RecentChangesSection from './RecentChangesSection';
import useStoredBoolean from './useStoredBoolean';

const votes = new Intl.NumberFormat('en-AU', {maximumFractionDigits: 0});

export function Counts({progress}) {
  const total = progress?.expected_formal_votes;
  const counts = [
    ['First preferences', progress?.fp_votes],
    ['Two-candidate preferred', progress?.tcp_votes],
  ].filter(([, counted]) => Number.isFinite(counted));

  if (!counts.length)
    return <p className="mb-0">Counting progress unavailable.</p>;

  return counts.map(([label, counted]) => {
    const percentage = formatCountPercentage(counted, total);
    return (
      <p key={label} className="mb-0">
        <strong>{label}</strong> counted: {votes.format(counted)}
        {percentage &&
          ` of ${votes.format(total)} expected formal votes (${percentage})`}
        .
      </p>
    );
  });
}

function MovementValue({before, after, change, seatCount}) {
  const unit = seatCount ? '' : '%';
  return (
    <>
      <strong>
        {change > 0 ? '+' : ''}
        {change.toFixed(2)} {seatCount ? 'seats' : 'pp'}
      </strong>{' '}
      ({before.toFixed(2)}
      {unit} → {after.toFixed(2)}
      {unit})
    </>
  );
}

MovementValue.propTypes = {
  before: PropTypes.number.isRequired,
  after: PropTypes.number.isRequired,
  change: PropTypes.number.isRequired,
  seatCount: PropTypes.bool,
};

function CandidateMovements({rows, parties, code, seat}) {
  return (
    <ul className="list-unstyled mb-2">
      {rows.map(row => {
        const party = row.identity?.party || parties[row.party_id] || 'OTH';
        const badge =
          party === 'OTH' && !parties[row.party_id] && !row.identity?.party
            ? `Party ${row.party_id}`
            : party;
        return (
          <li key={row.party_id}>
            {row.identity?.name && row.identity.name + ' '}
            <SmartBadge
              party={seatPartyCode(party, code, seat)}
              termCode={code}
              text={badge}
            />{' '}
            <MovementValue
              before={row.before}
              after={row.after}
              change={row.change_pp}
            />
            {row.identity_changed && ' · Candidate identity changed'}
          </li>
        );
      })}
    </ul>
  );
}

// Keep the native disclosure control so clicks and keyboard activation have
// the same behavior. The key follows the subsection across periods and runs.
function SavedDetails({section, title, children}) {
  const [open, setOpen] = useStoredBoolean('liveRecentChanges:' + section);

  return (
    <details
      open={open}
      onToggle={event => {
        const next = event.currentTarget.open;
        if (next !== open) setOpen(next);
      }}
    >
      <summary>{title}</summary>
      {children}
    </details>
  );
}

SavedDetails.propTypes = {
  section: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// An FP and a TCP return can cover the same ballots. Rank units by the
// larger reported change, and show each count type only when its total moved.
function boothSize(event) {
  return Math.max(
    Math.abs(event.fp_net_change ?? 0),
    Math.abs(event.tcp_net_change ?? 0)
  );
}

function boothMovements(event) {
  const changes = [
    ['FP', event.fp_net_change],
    ['TCP', event.tcp_net_change],
  ].filter(([, value]) => Number.isFinite(value) && value !== 0);
  if (changes.length)
    return changes
      .map(
        ([type, value]) =>
          `${value > 0 ? '+' : ''}${votes.format(value)} ${type} votes`
      )
      .join(', ');
  return `${votes.format(event.affected_votes)} votes affected by a correction`;
}

function originalBoothOmission(counts) {
  const total = (counts?.new || 0) + (counts?.updated || 0);
  if (total === 0) return null;
  return `The original count report omitted ${total} other ${
    total === 1 ? 'update' : 'updates'
  }.`;
}

function BoothChanges({booth, seatLink}) {
  const events = booth?.events || [];
  const omitted = booth?.shortlist_omitted || {};
  const bySeat = new Map(
    Object.keys(omitted)
      .filter(Boolean)
      .map(seat => [seat, []])
  );
  const unassigned = originalBoothOmission(omitted['']);
  for (const event of events) {
    if (!bySeat.has(event.seat)) bySeat.set(event.seat, []);
    bySeat.get(event.seat).push(event);
  }

  return (
    <SavedDetails
      section="booths"
      title={`Booth and declaration counts (${events.length})`}
    >
      {!booth?.available && booth?.reason && <p>{booth.reason}</p>}
      {bySeat.size > 0 && (
        <ul className="list-unstyled">
          {[...bySeat.keys()].sort().map(seat => {
            const group = bySeat
              .get(seat)
              .sort(
                (a, b) =>
                  boothSize(b) - boothSize(a) ||
                  b.affected_votes - a.affected_votes ||
                  a.name.localeCompare(b.name, 'en-AU')
              );
            const hidden = Math.max(0, group.length - 3);
            const earlier = originalBoothOmission(omitted[seat]);
            return (
              <li key={seat} className="mt-2">
                <strong>
                  <Link to={seatLink(seat)}>{seat}</Link>
                </strong>
                <ul>
                  {group.slice(0, 3).map(event => (
                    <li key={event.record || event.name}>
                      {event.name} ({boothMovements(event)})
                    </li>
                  ))}
                  {hidden > 0 && (
                    <li>
                      and {hidden} {hidden === 1 ? 'other' : 'others'}
                    </li>
                  )}
                  {earlier && <li>{earlier}</li>}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
      {unassigned && <p>{unassigned}</p>}
    </SavedDetails>
  );
}

BoothChanges.propTypes = {
  booth: PropTypes.object,
  seatLink: PropTypes.func.isRequired,
};

function electionMovements(statewide, partyAbbr, code, diagnostics) {
  const {before, after} = statewide || {};
  const parties = Object.fromEntries(partyAbbr);
  const outcomeRows = [];
  const voteRows = [];
  const seatRows = [];
  const add = (rows, id, party, label, from, to) => {
    if (!Number.isFinite(from) || !Number.isFinite(to)) return;
    const start = Number(from.toFixed(2));
    const end = Number(to.toFixed(2));
    // Use the displayed endpoints so the change still agrees when those
    // endpoints round differently across a very small movement.
    if (start !== end) rows.push({id, party, label, start, end});
  };

  const outcomes = endpoint =>
    governmentOutcomes({...endpoint, partyAbbr, termCode: code});
  const outcomeBefore = Object.fromEntries(
    outcomes(before).map(({id, value}) => [id, value])
  );
  for (const {id, party, label, value} of outcomes(after)) {
    add(outcomeRows, id, party, label, outcomeBefore[id], value);
  }

  // The compared TPP and FP values are the medians of the reported forecasts.
  add(
    voteRows,
    'tpp',
    parties[0] || 'ALP',
    'two-party preferred',
    before?.tpp_percentiles?.[50],
    after?.tpp_percentiles?.[50]
  );
  for (const [party, bands] of Object.entries(
    after?.fp_percentiles_by_party || {}
  )) {
    add(
      voteRows,
      `fp-${party}`,
      seriesPartyCode(parties[party], party, partyAbbr, code) ||
        `Party ${party}`,
      'first preferences',
      before?.fp_percentiles_by_party?.[party]?.[50],
      bands?.[50]
    );
  }
  if (diagnostics) {
    for (const [party, value] of Object.entries(after?.expectedSeats || {})) {
      add(
        seatRows,
        `seats-${party}`,
        seriesPartyCode(parties[party], party, partyAbbr, code) ||
          `Party ${party}`,
        '',
        before?.expectedSeats?.[party],
        value
      );
    }
  }
  return [
    {title: 'Outcome', rows: outcomeRows},
    {title: 'Vote share', rows: voteRows},
    {title: 'Expected seats', rows: seatRows, seatCount: true},
  ].filter(group => group.rows.length);
}

function ElectionMovements({statewide, partyAbbr, code, diagnostics}) {
  const groups = electionMovements(statewide, partyAbbr, code, diagnostics);
  return (
    <SavedDetails section="election-movement" title="Election-wide movement">
      {groups.map(({title, rows, seatCount}) => (
        <section key={title} className="mt-2">
          <h4 className="h6">{title}</h4>
          <ul>
            {rows.map(({id, party, label, start, end}) => (
              <li key={id}>
                {party && (
                  <SmartBadge party={party} text={party} termCode={code} />
                )}{' '}
                {label}{' '}
                <MovementValue
                  before={start}
                  after={end}
                  change={end - start}
                  seatCount={seatCount}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {groups.length === 0 && (
        <p>No comparable movement at two decimal places.</p>
      )}
    </SavedDetails>
  );
}

ElectionMovements.propTypes = {
  statewide: PropTypes.object,
  partyAbbr: PropTypes.array.isRequired,
  code: PropTypes.string.isRequired,
  diagnostics: PropTypes.bool,
};

export default function MechanicalChanges({
  comparison,
  partyAbbr = [],
  code,
  seatLink,
  diagnostics,
}) {
  const {booth_changes: booth, statewide} = comparison;
  const parties = Object.fromEntries(partyAbbr);
  const grouped = new Map();
  for (const row of comparison.win_changes || []) {
    if (!grouped.has(row.seat)) grouped.set(row.seat, []);
    grouped.get(row.seat).push(row);
  }
  // The server ranks seats by the sum of all absolute movements, including
  // parties below the display threshold. Older API responses lack that total.
  const weight = ([seat, rows]) =>
    comparison.win_change_totals?.[seat] ??
    rows.reduce((total, row) => total + Math.abs(row.change_pp), 0);
  const seats = [...grouped].sort(
    (a, b) => weight(b) - weight(a) || a[0].localeCompare(b[0], 'en-AU')
  );
  const seatList = rows => (
    <ol>
      {rows.map(([seat, candidates]) => (
        <li key={seat}>
          <strong>
            <Link to={seatLink(seat)}>{seat}</Link>
          </strong>
          <CandidateMovements
            rows={candidates}
            parties={parties}
            code={code}
            seat={seat}
          />
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <RecentChangesSection title="Seat win chance changes">
        {seats.length > 0 && seatList(seats.slice(0, 5))}
        {seats.length === 0 && (
          <p className="mb-0">No candidate’s win probability changed.</p>
        )}
      </RecentChangesSection>
      <RecentChangesSection title="Other updates">
        <ElectionMovements
          statewide={statewide}
          partyAbbr={partyAbbr}
          code={code}
          diagnostics={diagnostics}
        />
        <BoothChanges booth={booth} seatLink={seatLink} />
        {diagnostics && seats.length > 5 && (
          <SavedDetails
            section="retained-movements"
            title={`All retained movements (${comparison.win_changes.length})`}
          >
            {seatList(seats)}
          </SavedDetails>
        )}
      </RecentChangesSection>
    </>
  );
}

Counts.propTypes = {
  progress: PropTypes.object,
};
CandidateMovements.propTypes = {
  seat: PropTypes.string.isRequired,
  rows: PropTypes.array.isRequired,
  parties: PropTypes.object.isRequired,
  code: PropTypes.string.isRequired,
};
MechanicalChanges.propTypes = {
  comparison: PropTypes.object.isRequired,
  partyAbbr: PropTypes.array,
  code: PropTypes.string.isRequired,
  seatLink: PropTypes.func.isRequired,
  diagnostics: PropTypes.bool,
};
