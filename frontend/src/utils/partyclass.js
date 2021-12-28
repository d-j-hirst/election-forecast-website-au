import {intMap} from './intmap.js'

const isKnownParty = party => {
    return ['alp', 'grn', 'kap', 'lnp', 'onp', 'oth', 'uap'].some(el => el === party.toLowerCase());
};

export const standardiseParty = (party, forecast) => {
    if (typeof party !== 'string') party = intMap(forecast.partyAbbr, party);
    if (party.toLowerCase() === 'lib') party = 'lnp';
    if (party.toLowerCase() === 'ca') party = 'onp';
    if (!isKnownParty(party)) party = 'oth';
    return party;
}

export const bgClass = (party, forecast) => {
    party = standardiseParty(party, forecast);
    return party.toLowerCase() + '-bg';
};

export const midBgClass = (party, forecast) => {
    party = standardiseParty(party, forecast);
    return party.toLowerCase() + '-bg-mid';
};

export const lightBgClass = (party, forecast) => {
    party = standardiseParty(party, forecast);
    return party.toLowerCase() + '-bg-light';
};

export const xLightBgClass = (party, forecast) => {
    party = standardiseParty(party, forecast);
    return party.toLowerCase() + '-bg-xlight';
};

export const xxLightBgClass = (party, forecast) => {
    party = standardiseParty(party, forecast);
    return party.toLowerCase() + '-bg-xxlight';
};

export const xxxLightBgClass = (party, forecast) => {
    party = standardiseParty(party, forecast);
    return party.toLowerCase() + '-bg-xxxlight';
};