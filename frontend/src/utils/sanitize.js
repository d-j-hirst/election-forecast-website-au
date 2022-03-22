import * as sanitizeHtml from 'sanitize-html';

const defaultOptions = {
    allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'h5', 'h6', 'ul', 'li', 'img' ],
    allowedAttributes: {
        'a': [ 'href' ],
        'img': [ 'src', 'alt' ]
    },
};

const sanitize = (dirty, options) => ({
    __html: sanitizeHtml(
        dirty, 
        { ...defaultOptions, ...options }
    )
});

export const SanitizeHtml = ({ html, options }) => {
    return <div dangerouslySetInnerHTML={sanitize(html, options)} />
};
