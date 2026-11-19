import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

export default function HistoryPeriodDropdown({id, eveningOnly, onChange}) {
  const title = eveningOnly ? 'Election night only' : 'Include late counting';
  return (
    <DropdownButton id={id} title={`Display: ${title}`} variant="secondary">
      <Dropdown.Item
        as="button"
        active={eveningOnly}
        onClick={() => onChange(true)}
      >
        Election night only
      </Dropdown.Item>
      <Dropdown.Item
        as="button"
        active={!eveningOnly}
        onClick={() => onChange(false)}
      >
        Include late counting
      </Dropdown.Item>
    </DropdownButton>
  );
}

HistoryPeriodDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  eveningOnly: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
