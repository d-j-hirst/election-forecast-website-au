import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import InfoIcon from 'components/General/InfoIcon';
import {seatPartyCode, seriesPartyCode} from 'utils/coalition';
import {standardiseParty} from 'utils/partyclass';
import {SmartBadge} from '../../components/General/PartyBadge';
import useStoredBoolean from './useStoredBoolean';

// Group by what the reader sees on the badge. In SA, for example, both
// LIB and the coalition's LNP code are displayed as LIB.
function candidateBadgeKey(party, code, seat) {
  const abbreviation = seatPartyCode(party, code, seat).toLowerCase();
  if (abbreviation === 'lnpx') return 'lnp';
  if (abbreviation === 'eoth') return '???';
  return standardiseParty(abbreviation);
}

function repeatedCandidateLabels(text, entities, code) {
  const candidates = new Map();
  if (typeof text !== 'string') return undefined;
  for (const token of text.match(/\{candidate:[^{}]+\}/g) || []) {
    const entity = entities?.[token];
    if (entity?.kind !== 'candidate' || typeof entity.party !== 'string')
      continue;
    if (!entity.party || typeof entity.label !== 'string') continue;
    candidates.set(token, {
      badge: candidateBadgeKey(entity.party, code, entity.seat),
      words: entity.label.trim().split(/\s+/),
    });
  }

  // Look ahead for shared badges, including candidates mentioned later in
  // the section. Introductions are tracked separately in reading order.
  const seen = new Set();
  return (token, label) => {
    if (!seen.has(token)) {
      seen.add(token);
      return label;
    }
    const candidate = candidates.get(token);
    if (!candidate) return label;

    const {badge, words} = candidate;
    const peers = [...candidates].filter(
      ([otherToken, other]) => otherToken !== token && other.badge === badge
    );
    if (!peers.length && badge !== 'ind' && badge !== 'indx') return '';

    // The exporter supplies a display label. Keep full names for ambiguous
    // multi-part surnames and for candidates who share a surname and badge.
    if (words.length !== 2 || !/^\p{L}[\p{L}\p{M}’'-]*$/u.test(words[1]))
      return label;
    const surname = words[1];
    const sharedSurname = peers.some(
      ([, other]) => other.words.at(-1).toLowerCase() === surname.toLowerCase()
    );
    return sharedSurname ? label : surname;
  };
}

// Render only the two emphasis markers and documented entity tokens. Strings
// and labels go through React text nodes, including unrecognised placeholders.
function inline(text, entities, seatLink, code, parties, formatCandidate) {
  if (typeof text !== 'string') return null;
  return text
    .split(/(\*\*[^*]+\*\*|\{(?:seat|candidate|party):[^{}]+\})/g)
    .map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return (
          <strong key={i}>
            {inline(
              part.slice(2, -2),
              entities,
              seatLink,
              code,
              parties,
              formatCandidate
            )}
          </strong>
        );
      const entity = entities?.[part];
      if (!entity || typeof entity.label !== 'string') return part;
      if (
        entity.kind === 'party' &&
        typeof entity.party === 'string' &&
        entity.party
      ) {
        return (
          <SmartBadge
            key={i}
            party={seriesPartyCode(
              entity.party,
              part.slice(7, -1),
              parties,
              code
            )}
            text={entity.label}
            termCode={code}
          />
        );
      }
      if (entity.kind === 'seat') {
        const hasMargin = Number.isFinite(entity.holder_margin);
        return (
          <React.Fragment key={i}>
            <strong>
              <Link to={seatLink(entity.seat || entity.label)}>
                {entity.label}
              </Link>
            </strong>
            {(entity.holder_party || hasMargin) && (
              <>
                {' ('}
                {entity.holder_party && (
                  <SmartBadge
                    party={seatPartyCode(
                      entity.holder_party,
                      code,
                      entity.seat || entity.label
                    )}
                    termCode={code}
                  />
                )}
                {entity.holder_party && hasMargin && ' '}
                {hasMargin && `${entity.holder_margin.toFixed(1)}%`}
                {')'}
              </>
            )}
          </React.Fragment>
        );
      }
      if (
        entity.kind !== 'candidate' ||
        typeof entity.party !== 'string' ||
        !entity.party
      )
        return entity.label;
      // For an unnamed candidate the exporter uses the party code as the label.
      // The badge already identifies that candidate, including on first mention.
      const label =
        entity.label.trim().toLowerCase() === entity.party.trim().toLowerCase()
          ? ''
          : formatCandidate?.(part, entity.label) ?? entity.label;
      return (
        <React.Fragment key={i}>
          {label && label + ' '}
          <SmartBadge
            party={seatPartyCode(entity.party, code, entity.seat)}
            termCode={code}
          />
        </React.Fragment>
      );
    });
}

// The exporter prefixes each point with a marker and supplies the heading.
// Use the same inline token renderer as the older paragraph format.
function CommentaryBlock({text, render, formatCandidates}) {
  if (typeof text !== 'string' || !text.trim()) return null;
  const [heading, ...lines] = text.trim().split(/\r?\n/);
  const points = lines.filter(line => line.trim());
  const candidateLabel = formatCandidates?.(text);

  return (
    <>
      <h4 className="h6">{render(heading, candidateLabel)}</h4>
      {points.length > 0 && (
        <ul>
          {points.map((line, index) => (
            <li key={index}>
              {render(line.replace(/^\s*-\s+/, ''), candidateLabel)}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const disclaimerPreference = 'liveCommentaryNoticeCollapsed';

function CommentaryNotice() {
  const [collapsed, setCollapsed] = useStoredBoolean(disclaimerPreference);
  if (collapsed) {
    return (
      <Button
        variant="info"
        size="sm"
        className="mb-3"
        onClick={() => setCollapsed(false)}
      >
        Show AI commentary notice
      </Button>
    );
  }
  return (
    <Alert
      variant="info"
      dismissible
      closeLabel="Collapse AI commentary notice"
      onClose={() => setCollapsed(true)}
    >
      <div className="d-flex align-items-center gap-3">
        <span className="flex-shrink-0" aria-hidden="true">
          <InfoIcon size="large" inactive />
        </span>
        <div className="flex-grow-1 text-center">
          This commentary was generated by a large language model (LLM) and may
          contain errors or omit important details.
        </div>
      </div>
    </Alert>
  );
}

CommentaryBlock.propTypes = {
  text: PropTypes.string,
  render: PropTypes.func.isRequired,
  formatCandidates: PropTypes.func,
};

// The replay trial appends an unassigned separator and the rule-written
// summary after all original developments. Each subsequent development is a
// district in that edition. A marker mentioned inside seat prose is ordinary
// text. Older publications, including yesterday's frozen report, stand alone.
const ruleEditionPrefix = '[[AEF_RULE_BASED_COMMENTARY_V1]]\n';

function writerEditions(text) {
  const rows = text?.developments;
  if (!Array.isArray(rows)) return null;
  const divider = rows.findIndex(
    row =>
      Array.isArray(row?.seats) &&
      row.seats.length === 0 &&
      typeof row.text === 'string' &&
      row.text.startsWith(ruleEditionPrefix) &&
      row.text.slice(ruleEditionPrefix.length).trim()
  );
  if (divider < 0) return null;
  return {
    original: {...text, developments: rows.slice(0, divider)},
    rules: {
      summary: rows[divider].text.slice(ruleEditionPrefix.length),
      developments: rows.slice(divider + 1),
    },
  };
}

export default function Commentary({item, seatLink, code, parties = []}) {
  const [preferRules, setPreferRules] = useStoredBoolean(
    'liveRecentChanges:ruleBased'
  );
  const editions = writerEditions(item?.text);
  const primaryAvailable = item?.status === 'complete';
  if (!primaryAvailable && !editions)
    return <p>Commentary unavailable. {item?.reason}</p>;
  const showRules = Boolean(editions && (preferRules || !primaryAvailable));
  const text = showRules ? editions.rules : editions?.original || item.text;
  const render = (value, formatCandidate) =>
    inline(value, item.entities, seatLink, code, parties, formatCandidate);
  const formatCandidates = text =>
    repeatedCandidateLabels(text, item.entities, code);
  const structured = showRules
    ? text.summary.startsWith('Key changes:\n')
    : item.format === 'seat-bullets-v1';
  return (
    <section>
      {editions && primaryAvailable && (
        <div
          role="group"
          aria-label="Commentary writer"
          className="btn-group mb-3"
        >
          <Button
            size="sm"
            variant={showRules ? 'outline-primary' : 'primary'}
            aria-pressed={!showRules}
            onClick={() => setPreferRules(false)}
          >
            AI commentary
          </Button>
          <Button
            size="sm"
            variant={showRules ? 'primary' : 'outline-primary'}
            aria-pressed={showRules}
            onClick={() => setPreferRules(true)}
          >
            Rule-based commentary
          </Button>
        </div>
      )}
      {editions && !primaryAvailable && (
        <>
          <p>AI commentary unavailable. {item.reason}</p>
          <h4 className="h6">Rule-based commentary</h4>
        </>
      )}
      {!showRules && item.source === 'local' && (
        <h4 className="h6">Counting update</h4>
      )}
      {!showRules && item.source !== 'local' && <CommentaryNotice />}
      {structured && <CommentaryBlock text={text?.summary} render={render} />}
      {!structured && text?.summary && <p>{render(text.summary)}</p>}
      {(text?.developments || []).map((d, i) => {
        const text = d.text || d.explanation;
        if (structured) {
          return (
            <CommentaryBlock
              key={i}
              text={text}
              render={render}
              formatCandidates={formatCandidates}
            />
          );
        }
        return (
          <p key={i}>
            {d.seat && <Link to={seatLink(d.seat)}>{d.seat} </Link>}
            {render(text, formatCandidates(text))}
            {(d.facts || []).map((f, j) => {
              const metric = item.metrics?.[f.metric_id];
              const context = item.metric_contexts?.[metric?.context_id];
              return (
                metric && (
                  <span key={j}>
                    {' '}
                    · {context?.identity?.name || context?.seat} {metric.path}{' '}
                    {f.value ?? metric.value} {context?.quantity}
                  </span>
                )
              );
            })}
            {(d.evidence_ids || []).map(id => {
              const evidence = item.evidence?.[id];
              return (
                evidence && (
                  <small key={id}>
                    {' '}
                    · {evidence.seat} {evidence.kind} {evidence.record}
                  </small>
                )
              );
            })}
          </p>
        );
      })}
    </section>
  );
}

Commentary.propTypes = {
  item: PropTypes.object,
  parties: PropTypes.array,
  seatLink: PropTypes.func.isRequired,
  code: PropTypes.string.isRequired,
};
