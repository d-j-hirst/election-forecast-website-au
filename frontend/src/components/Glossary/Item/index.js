import React from 'react';
import PropTypes from 'prop-types';

import styles from './Item.module.css';

const GlossaryItem = props => {
  let labelClass = null;
  if (props.type === 'general') labelClass = styles.generalDef;
  if (props.type === 'site') labelClass = styles.siteDef;
  let id = props.title.toLowerCase().replaceAll(' ', '-');
  return (
    <>
      <hr />
      <p>
        <span className={labelClass} id={id}>
          {props.title}
        </span>
      </p>
      {props.children}
    </>
  );
};
GlossaryItem.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default GlossaryItem;
