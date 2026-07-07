// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ALL_NUMERICAL_TYPES,
  TEXT_AND_BOOL_TYPES,
  TIME_UNITS
} from "constants/data-types"
import {
  CUSTOM_DIMENSION_VALUE,
  CUSTOM_MEASURE_VALUE
} from "constants/magic-variables"
import React from "react"
import PropTypes from "prop-types"
import compose from "recompose/compose"
import cx from "classnames"
import { KEYCODE } from "constants/keycode"
import { CHART_TYPES } from "constants/charts"
import SelectorPillParent from "components/selector-pill/selector-pill-parent"
import SelectorPillWrapper from "components/selector-pill/selector-pill-wrapper"
import { selectorShape } from "constants/prop-types"
import withHandlers from "recompose/withHandlers"
import withState from "recompose/withState"
import { getFullColumnName } from "components/join-manager/utils"

function shouldStopAddingDimension({ option, chartType }) {
  return (
    [CHART_TYPES.GEOHEAT, CHART_TYPES.CONTOUR].includes(chartType) ||
    (!ALL_NUMERICAL_TYPES[option.type] && !TIME_UNITS[option.type])
  )
}

function shouldStopAddingMeasure({ option, hasActiveDimensions, chartType }) {
  if (chartType === "line2") {
    // line2 charts may have infinite number of measures
    return !hasActiveDimensions
  }
  // Dimensions not required if it's a backend choropleth/line chart, which is
  // auto aggregated by geometry tables row id. If it's one of these chart types
  // and the selected option is from a join, don't require a dimension to select
  // aggregation type.
  const isAutoAggregated =
    [CHART_TYPES.BACKEND_CHOROPLETH, CHART_TYPES.LINEMAP].includes(chartType) &&
    option.is_join
  return (
    chartType !== "number" &&
    (option.value === "*" ||
      (!hasActiveDimensions && !isAutoAggregated) ||
      Boolean(TEXT_AND_BOOL_TYPES[option.type]))
  )
}

function shouldStopEditingSelector({ option, ...props }) {
  if (props.type === "measure") {
    return shouldStopAddingMeasure({ option, ...props })
  } else if (props.type === "dimension") {
    return shouldStopAddingDimension({ option, ...props })
  }
  return false
}

export const withStateContainer = compose(
  withState("editMode", "setEditMode", false),
  withState("isDropdownOpen", "setIsDropdownOpen", false),
  withState("showCustom", "setShowCustom", false),
  withState("showCustomBinSettings", "setShowCustomBinSettings", false),
  withState("isPropagate", "setPropagation", true),
  withState("isStopPropagate", "setStopPropagation", false),
  withHandlers({
    onOpenChange: (props) => (open) => {
      props.setIsDropdownOpen(() => open)
    },
    startEditingSelector: (props) => () => {
      if (props.dataSource) {
        props.setEditMode(() => true)
      }
    },
    stopEditingSelector: (props) => () => {
      props.setEditMode(() => false)
      props.setIsDropdownOpen(() => false)
      props.setShowCustom(() => false)
    },
    onKeyDown: (props) => (e) => {
      if (props.isStopPropagate) {
        props.setStopPropagation(() => false)
      } else if (props.isPropagate) {
        switch (e.keyCode) {
          case KEYCODE.Enter:
            if (!props.isDropdownOpen) {
              e.preventDefault()
              props.setEditMode(() => false)
              props.setIsDropdownOpen(() => false)
              props.setShowCustom(() => false)
            }
            break
          case KEYCODE.Esc:
            e.preventDefault()
            props.setEditMode(() => false)
            props.setIsDropdownOpen(() => false)
            props.setShowCustom(() => false)
            break
          default:
            return
        }
      }
    },
    showCustomSQLSelector: (props) => (index) => {
      props.setIsDropdownOpen(() => false)
      props.setShowCustomBinSettings(() => false)
      props.setShowCustom(() => true)
      props.createNewCustomSQL(index)
    },
    closeCustomSelector: (props) => () => {
      props.setIsDropdownOpen(() => true)
      props.setShowCustom(() => false)
    },
    submitCustomDimension: (props) => () => {
      props.setEditMode(() => false)
      props.setIsDropdownOpen(() => false)
      props.setShowCustom(() => false)
    },
    stopPropagation: (props) => () => {
      props.setStopPropagation(() => true)
    }
  })
)

export const onValueChange = ({ index, selector = {}, ...props }) => (
  option
) => {
  if (option) {
    const newSelector = {
      ...option,
      value: getFullColumnName(option, "value"),
      custom: Boolean(option.sharedCustom || option.globalCustom)
    }
    if (option.sharedCustom) {
      newSelector.label = option.value
      props.stopEditingSelector()
    }
    if (option.globalCustom) {
      props.stopEditingSelector()
    }
    if (option.value === selector.value) {
      props.stopEditingSelector()
    } else if (
      option.value === CUSTOM_MEASURE_VALUE ||
      option.value === CUSTOM_DIMENSION_VALUE
    ) {
      props.showCustomSQLSelector(index)
    } else if (shouldStopEditingSelector({ option, ...props })) {
      props.addSelector(index, newSelector)
      props.stopEditingSelector()
    } else {
      props.addSelector(index, newSelector)
    }
  } else {
    props.removeSelector(index, selector)
  }
}

SelectorContainer.propTypes = {
  chartId: PropTypes.string.isRequired,
  chartType: PropTypes.string.isRequired,
  editMode: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  multiSourceIndex: PropTypes.number,
  selector: selectorShape.isRequired,
  type: PropTypes.oneOf(["measure", "dimension", "postFilter"]).isRequired
}

export function SelectorContainer(props) {
  return (
    <SelectorPillWrapper
      chartId={props.chartId}
      chartType={props.chartType}
      editMode={props.editMode}
      index={props.index}
      selector={props.selector}
      selectorType={`${props.type}s`}
    >
      <SelectorPillContent {...props} />
    </SelectorPillWrapper>
  )
}

SelectorPillContent.propTypes = {
  addCustomDimension: PropTypes.func,
  addCustomMeasure: PropTypes.func,
  addCustomPostFilter: PropTypes.func,
  chartId: PropTypes.string.isRequired,
  closeCustomSelector: PropTypes.func.isRequired,
  dataSource: PropTypes.string,
  editMode: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  isDropdownOpen: PropTypes.bool,
  isGroupBy: PropTypes.bool,
  loading: PropTypes.bool,
  multiSourceIndex: PropTypes.number,
  onKeyDown: PropTypes.func,
  onOpenChange: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
  Popover: PropTypes.elementType.isRequired,
  removeSelector: PropTypes.func.isRequired,
  selector: selectorShape.isRequired,
  setPropagation: PropTypes.func.isRequired,
  showCustom: PropTypes.bool.isRequired,
  showCustomBinSettings: PropTypes.bool.isRequired,
  showCustomSQLSelector: PropTypes.func.isRequired,
  startEditingSelector: PropTypes.func.isRequired,
  stopEditingSelector: PropTypes.func.isRequired,
  stopPropagation: PropTypes.func,
  submitCustomDimension: PropTypes.func.isRequired,
  type: PropTypes.oneOf(["measure", "dimension", "postFilter"]).isRequired
}

export function SelectorPillContent({ Popover, ...props }) {
  if (props.editMode || props.loading) {
    return (
      <Popover
        addCustomDimension={props.addCustomDimension}
        addCustomMeasure={props.addCustomMeasure}
        addCustomPostFilter={props.addCustomPostFilter}
        chartId={props.chartId}
        closeCustomSelector={props.closeCustomSelector}
        dataSource={props.dataSource}
        index={props.index}
        isDropdownOpen={props.isDropdownOpen}
        loading={props.loading}
        multiSourceIndex={props.multiSourceIndex}
        onKeyDown={props.onKeyDown}
        onOpenChange={props.onOpenChange}
        onValueChange={props.onValueChange}
        removeSelector={props.removeSelector}
        selector={props.selector}
        setPropagation={props.setPropagation}
        showCustom={props.showCustom}
        showCustomBinSettings={props.showCustomBinSettings}
        showCustomSQLSelector={props.showCustomSQLSelector}
        stopEditingSelector={props.stopEditingSelector}
        stopPropagation={props.stopPropagation}
        submitCustomDimension={props.submitCustomDimension}
        editParameterizedCustomSql={props.editParameterizedCustomSql}
      />
    )
  } else if (
    props.selector.name ||
    props.selector.value ||
    props.selector.custom
  ) {
    return (
      <SelectorPillParent
        chartId={props.chartId}
        dataSource={props.dataSource}
        index={props.index}
        openSelectorPopover={props.startEditingSelector}
        removeSelector={props.removeSelector}
        selector={props.selector}
        selectorIsDisabled={props.selector.inactive}
        selectorType={`${props.type}s`}
        editParameterizedCustomSql={props.editParameterizedCustomSql}
        {...props.selector}
      />
    )
  } else {
    return (
      <div
        className={cx("add-btn-wrap", {
          "is-required": props.selector.isRequired,
          inactive: !props.dataSource || props.selector.inactive
        })}
      >
        <button
          className={cx("button add-btn", {
            inactive: !props.dataSource || props.selector.inactive
          })}
          id={`${props.type}-add-${props.chartId || 0}`}
          onClick={props.startEditingSelector}
        >
          {`+ add ${props.type}`}
        </button>
      </div>
    )
  }
}

export default compose(
  withStateContainer,
  withHandlers({ onValueChange })
)(SelectorContainer)
