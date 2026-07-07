// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Icon } from "@rmwc/icon"

import {
  ALL_NUMERICAL_TYPES,
  GEO_TYPES,
  iconFromType,
  TIME_UNITS
} from "constants/data-types"
import {
  dimensionShape,
  measureShape,
  selectorShape
} from "constants/prop-types"
import React from "react"
import PropTypes from "prop-types"
import AutocompleteParent from "components/autocomplete/autocomplete-parent"
import compose from "recompose/compose"
import cx from "classnames"
import mapProps from "recompose/mapProps"
import GeoPinIcon from "components/svg-icons/icon-geo-pin"
import CustomSelectorIcon from "components/svg-icons/icon-custom-selector"
import { CustomSQLTypes } from "components/custom-sql-manager/custom-sql-manager-actions"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import { connect } from "react-redux"
import { getFullColumnName } from "components/join-manager/utils"

// determines if AutoComplete's dropdown is displayed or not
export function shouldDropDown(props) {
  if (props.isDropdownOpen || !props.hasSettings) {
    return true
  } else if (
    props.dimension &&
    (Boolean(ALL_NUMERICAL_TYPES[props.dimension.type]) ||
      Boolean(TIME_UNITS[props.dimension.type]))
  ) {
    return false
  } else if (
    props.measure &&
    props.measure.aggType &&
    props.measure.aggType !== "Count"
  ) {
    return false
  } else {
    return true
  }
}

const mapDefaultProps = mapProps((props) => ({
  placeholder: `Select a ${props.dimension ? "dimension" : "measure"}`,
  defaultValue:
    props.selector.value || props.selector.custom ? props.selector : false,
  shouldDropDown: shouldDropDown(props),
  ...props
}))

const mapStateToProps = (state) => ({
  isSuperuser: state.connection.isSuperuser
})

function getOptionClass(type, isArray) {
  return cx("meta", iconFromType(type, isArray))
}

const typeIcon = (props) => {
  if (props.sharedCustom || props.globalCustom) {
    return (
      <div className="shared-custom-icon">
        <CustomSelectorIcon />
      </div>
    )
  }

  if (GEO_TYPES[props.type]) {
    return (
      <div className="meta-geo-pin">
        <GeoPinIcon />
      </div>
    )
  }

  return <div className={getOptionClass(props.type, props.is_array)} />
}

const renderOption = ({ editParameterizedCustomSql, isSuperuser }) => {
  function SelectorDropdownOption(props) {
    return (
      <div
        className={"autocomplete-dropdown-item-content"}
        data-testid="autocomplete-dropdown"
      >
        <div className="value" title={getFullColumnName(props)}>
          {props.label}
        </div>
        {typeIcon(props)}
        <div className="edit-icon">
          {props.sharedCustom &&
            getFeatureFlag(
              available_feature_flags.ENABLE_DASHBOARD_SHARED_CUSTOM_SQL
            ) && (
              <Icon
                icon="settings"
                onClick={(e) => {
                  e.stopPropagation()
                  editParameterizedCustomSql(
                    props.value,
                    CustomSQLTypes.CUSTOM_SQL_EDIT_SHARED
                  )
                }}
              />
            )}
          {props.globalCustom &&
            isSuperuser &&
            getFeatureFlag(
              available_feature_flags.ENABLE_GLOBAL_CUSTOM_SQL
            ) && (
              <Icon
                icon="settings"
                onClick={(e) => {
                  e.stopPropagation()
                  editParameterizedCustomSql(
                    props.value,
                    CustomSQLTypes.CUSTOM_SQL_EDIT_GLOBAL
                  )
                }}
              />
            )}
        </div>
      </div>
    )
  }

  SelectorDropdownOption.propTypes = {
    is_array: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }

  return SelectorDropdownOption
}

SelectorDropdown.propTypes = {
  defaultValue: PropTypes.oneOfType([
    dimensionShape,
    measureShape,
    PropTypes.bool
  ]).isRequired,
  dimension: dimensionShape,
  hasSettings: PropTypes.bool,
  isDropdownOpen: PropTypes.bool.isRequired,
  measure: measureShape,
  onOpenChange: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })
  ).isRequired,
  placeholder: PropTypes.string.isRequired,
  selector: selectorShape.isRequired,
  setPropagation: PropTypes.func,
  shouldDropDown: PropTypes.bool.isRequired,
  showCustomSQLSelector: PropTypes.func,
  stopPropagation: PropTypes.func,
  isSuperuser: PropTypes.bool.isRequired
}

function SelectorDropdown(props) {
  const inputOnClick =
    props.dimension && props.dimension.custom
      ? props.showCustomSQLSelector
      : null
  return (
    <AutocompleteParent
      className={"popout-style-constant"}
      testid={"selector-dropdown-autocomplete"}
      forceComplete
      inputOnClick={inputOnClick}
      onOpenChange={props.onOpenChange}
      openByDefault={props.shouldDropDown}
      options={props.options}
      placeholder={props.placeholder}
      renderOption={renderOption(props)}
      selectedOption={props.defaultValue}
      selectInputwithoutDropdown
      setPropagation={props.setPropagation}
      stopPropagation={props.stopPropagation}
      updateValue={props.onValueChange}
      valueAlias={"label"}
    />
  )
}

export default compose(
  connect(mapStateToProps),
  mapDefaultProps
)(SelectorDropdown)
