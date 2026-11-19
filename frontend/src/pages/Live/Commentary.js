import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import InfoIcon from 'components/General/InfoIcon';
import {coalitionAbbreviation} from 'utils/coalition';
import {standardiseParty} from 'utils/partyclass';
import {SmartBadge} from '../../components/General/PartyBadge';
import useStoredBoolean from './useStoredBoolean';

// Group by what the reader sees on the badge. In SA, for example, both
// LIB and the coalition's LNP code are displayed as LIB.
function candidateBadgeKey(party, code) {
  const abbreviation = party.toLowerCase();
  if (abbreviation === 'lnp') return coalitionAbbreviation(code).toLowerCase();
  if (abbreviation === 'lnpx') return 'lnp';
  if (abbreviation === 'eoth') return '???';
  return standardiseParty(party);
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
      badge: candidateBadgeKey(entity.party, code),
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
function inline(text, entities, seatLink, code, formatCandidate) {
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
              formatCandidate
            )}
          </strong>
        );
      const entity = entities?.[part];
      if (!entity || typeof entity.label !== 'string') return part;
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
                  <SmartBadge party={entity.holder_party} termCode={code} />
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
      const label = formatCandidate?.(part, entity.label) ?? entity.label;
      return (
        <React.Fragment key={i}>
          {label && label + ' '}
          <SmartBadge party={entity.party} termCode={code} />
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

export default function Commentary({item, seatLink, code}) {
  if (item?.status !== 'complete')
    return <p>Commentary unavailable. {item?.reason}</p>;
  const render = (value, formatCandidate) =>
    inline(value, item.entities, seatLink, code, formatCandidate);
  const formatCandidates = text =>
    repeatedCandidateLabels(text, item.entities, code);
  const structured = item.format === 'seat-bullets-v1';
  return (
    <section>
      {item.source === 'local' && <h4 className="h6">Counting update</h4>}
      {item.source !== 'local' && <CommentaryNotice />}
      {structured && (
        <CommentaryBlock text={item.text?.summary} render={render} />
      )}
      {!structured && item.text?.summary && <p>{render(item.text.summary)}</p>}
      {(item.text?.developments || []).map((d, i) => {
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
  seatLink: PropTypes.func.isRequired,
  code: PropTypes.string.isRequired,
};
