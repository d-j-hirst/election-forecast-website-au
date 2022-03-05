import * as sanitizeHtml from 'sanitize-html';

const defaultOptions = {
    allowedTags: [ 'b', 'i', 'em', 'strong', 'a' ],
    allowedAttributes: {
        'a': [ 'href' ]
    },
};
  
const sanitize = (dirty, options) => ({
    __html: sanitizeHtml(
        dirty, 
        { ...defaultOptions, ...options }
    )
});
  
export const SanitizeHtml = ({ html, options }) => (
    <div dangerouslySetInnerHTML={sanitize(html, options)} />
);
