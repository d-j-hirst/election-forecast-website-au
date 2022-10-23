import React from 'react';

import { HashLink as Link } from 'react-router-hash-link';

const GlossaryLink = props => {
    let link = ""
    switch(props.word.toLowerCase()) {
    case 'fp':
    case 'first-preference (fp)':
    case 'first-preference vote':
    case 'first-preference votes':
    case 'first-preferences':
    case 'first preference (fp)':
    case 'first preference vote':
    case 'first preference votes':
    case 'first preferences':
        link = "first-preference-vote"
        break;
    case 'tpp':
    case 'two-party-preferred':
    case 'two-party-preferred (tpp)':
    case 'two-party-preferred vote':
    case 'two-party-preferred votes':
        link = "two-party-preferred-vote"
        break;
    case 'poll':
    case 'polls':
        link = "poll"
        break;
    case 'pollster':
    case 'pollsters':
    case 'polling house':
    case 'polling houses':
        link = "pollster"
        break;
    case 'poll trend':
    case 'poll trends':
        link = "poll-trend"
        break;
    case 'seat':
    case 'seats':
        link = "seat"
        break;
    case 'voting intention':
        link = "voting-intention"
        break;
    case 'major parties':
        link = "major-parties"
        break;
    case 'house effect':
        link = "house-effect"
        break;
    case 'bias':
        link = "bias"
        break;
    }
    if (link == "") return <strong>Invalid link</strong>
    return (
        <Link to={`/glossary#${link}`}>{props.word}</Link>
    )
}

export default GlossaryLink;