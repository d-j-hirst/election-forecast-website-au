import {jsonMap} from './jsonmap.js';

const isKnownParty = party => {
  return [
    'alp',
    'grn',
    'kap',
    'lnp',
    'on',
    'oth',
    'uap',
    'ca',
    'sab',
    'sff',
    'ind',
    'indx',
  ].some(el => el === party.toLowerCase());
};

export const standardiseParty = (party, forecast) => {
  if (typeof party !== 'string') party = jsonMap(forecast.partyAbbr, party);
  if (party.toLowerCase() === 'lib') party = 'lnp';
  if (!isKnownParty(party)) party = 'oth';
  return party.toLowerCase();
};

export const partyColorClass = (party, forecast) => {
  let sParty = standardiseParty(party);
  if (sParty === 'ca') sParty = 'on';
  if (sParty === 'sab') sParty = 'on';
  if (sParty === 'sff') sParty = 'kap';
  return sParty;
};

export const bgClass = (party, forecast) => {
  party = partyColorClass(party, forecast);
  return party.toLowerCase() + '-bg';
};

export const midBgClass = (party, forecast) => {
  party = partyColorClass(party, forecast);
  return party.toLowerCase() + '-bg-mid';
};

export const lightBgClass = (party, forecast) => {
  party = partyColorClass(party, forecast);
  return party.toLowerCase() + '-bg-light';
};

export const xLightBgClass = (party, forecast) => {
  party = partyColorClass(party, forecast);
  return party.toLowerCase() + '-bg-xlight';
};

export const xxLightBgClass = (party, forecast) => {
  party = partyColorClass(party, forecast);
  return party.toLowerCase() + '-bg-xxlight';
};

export const xxxLightBgClass = (party, forecast) => {
  party = partyColorClass(party, forecast);
  return party.toLowerCase() + '-bg-xxxlight';
};
