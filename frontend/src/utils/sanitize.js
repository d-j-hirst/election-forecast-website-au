import React from 'react';
import PropTypes from 'prop-types';
import * as sanitizeHtml from 'sanitize-html';

const defaultOptions = {
  allowedTags: [
    'b',
    'i',
    'em',
    'strong',
    'a',
    'p',
    'br',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'img',
  ],
  allowedAttributes: {
    a: ['href'],
    img: ['src', 'alt', 'style'],
  },
};

const sanitize = (dirty, options) => ({
  __html: sanitizeHtml(dirty, {...defaultOptions, ...options}),
});

export const SanitizeHtml = props => {
  return <div dangerouslySetInnerHTML={sanitize(props.html, props.options)} />;
};
SanitizeHtml.propTypes = {
  html: PropTypes.object.isRequired,
  options: PropTypes.any,
};
