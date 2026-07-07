// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  addCustomColor,
  addCustomColorMultiSource,
  removeCustomColor,
  setCustomColor,
  setCustomDefaultOtherColorValue,
  setCustomDefaultOtherColorValueMultiSource,
  toggleOtherMultiSeriesMultiSource,
  toggleOtherMultiSeries,
  removeCustomColorMultiSource
} from "actions/charts-action-creators"
import { updateHideOther } from "actions/charts-color-action-creators"
import { toggleYAxisOrientation } from "charts/combo/line-chart2/line2-action-creators"
import { colorShape, measureShape } from "constants/prop-types"
import React from "react"
import PropTypes from "prop-types"
import compose from "recompose/compose"
import { connect } from "react-redux"
import CustomColorsList from "components/custom-colors/custom-colors-list"
import CustomSelector from "components/custom-selector/custom-selector"
import Icon from "components/icon/icon"
import { LINE_STYLES } from "constants/charts"
import { MS_IN_HALF_SECONDS } from "constants/magic-variables"
import { noop } from "utils/helpers"
import withHandlers from "recompose/withHandlers"
import withState from "recompose/withState"
import { isEmpty, path } from "ramda"
import {
  getDataSource,
  getTrueSelectorIndex
} from "reducers/charts/helpers/multi-source-helpers"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import {
  isD3ChartWithCustomDomainRange,
  isD3ChartWithCategoricalColoring,
  getD3ChartColorDomain,
  getD3ChartColorRange,
  resetD3ChartDomainRange
} from "reducers/charts/helpers/color-helpers"

import TopNToggle from "./topn-toggle"
import cx from "classnames"
import "./custom-colors.scss"

const CHARTS_WITH_ALL_OTHERS = [
  "line",
  "line2",
  "histogram",
  "bar",
  "pointmap",
  "backendScatter",
  "linemap",
  "backendChoropleth"
]

const withAddedState = compose(
  withState("addedColor", "setAddedColor", false),
  withHandlers({
    addedColorAnimation: (props) => (callback = noop) => {
      props.setAddedColor(() => true)
      setTimeout(() => {
        props.setAddedColor(() => false)
        callback()
      }, MS_IN_HALF_SECONDS)
    }
  })
)

function mapDispatchToProps(dispatch, props) {
  return {
    setCustomColorValue(value, index, key) {
      if (value.length) {
        if (props.isMultiSource) {
          dispatch(
            setCustomColor(props.id, index, value, key, props.multiSourceIndex)
          )
        } else {
          dispatch(setCustomColor(props.id, index, value, key))
        }
      }
    },
    setCustomDefaultOtherColorValue(value, key) {
      if (props.isMultiSource) {
        dispatch(
          setCustomDefaultOtherColorValueMultiSource(
            props.id,
            value,
            key,
            props.multiSourceIndex
          )
        )
      } else {
        dispatch(setCustomDefaultOtherColorValue(props.id, value, key))
      }
    },
    addColor(value) {
      props.addedColorAnimation()
      if (props.isMultiSource) {
        dispatch(
          addCustomColorMultiSource(props.id, value, props.multiSourceIndex)
        )
      } else {
        dispatch(addCustomColor(props.id, value))
      }
    },
    toggleOther() {
      if (props.isMultiSource) {
        dispatch(
          toggleOtherMultiSeriesMultiSource(props.id, props.multiSourceIndex)
        )
      } else {
        dispatch(toggleOtherMultiSeries(props.id))
      }
    },
    updateHideOther(val) {
      if (!props.isMultiSource) {
        dispatch(updateHideOther(props.id, val, props.currentLayer))
      }
    },
    removeColor(index) {
      if (props.isMultiSource) {
        dispatch(
          removeCustomColorMultiSource(props.id, index, props.multiSourceIndex)
        )
      } else {
        dispatch(removeCustomColor(props.id, index))
      }
    },
    changeSelectorValue(customKey) {
      if (props.color.customKey !== customKey) {
        props.updateChartColor(
          Object.assign({}, props.color, {
            column: props.keysColumns[customKey],
            customDomain: [],
            customRange: [],
            customKey
          })
        )

        if (isD3ChartWithCategoricalColoring(props.chart)) {
          resetD3ChartDomainRange(props.chart)
        }
      }
    },
    toggleYAxisOrientationWithProps(trueMeasureIndex, orientation) {
      if (props.chartType === "line2") {
        dispatch(
          toggleYAxisOrientation(props.chartId, trueMeasureIndex, orientation)
        )
      }
    }
  }
}

function mergeProps(
  { measures, ...stateProps },
  dispatchProps,
  { hasColorDimension, isMultiSource, multiSourceIndex, ...ownProps }
) {
  const toggleYAxisOrientationWithProps = (trueMeasureIndex, orientation) =>
    dispatchProps.toggleYAxisOrientationWithProps(
      Number(trueMeasureIndex),
      orientation
    )
  const getTrueMeasureIndex = (measureIndex) =>
    getTrueSelectorIndex(
      measures,
      hasColorDimension ? "0" : measureIndex,
      isMultiSource ? multiSourceIndex : null
    )

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    hasColorDimension,
    isMultiSource,
    multiSourceIndex,
    toggleYAxisOrientationWithProps,
    getTrueMeasureIndex
  }
}

CustomColorHeader.propTypes = {
  changeSelectorValue: PropTypes.func.isRequired,
  color: colorShape.isRequired,
  colorDimensionActive: PropTypes.bool.isRequired,
  colorMeasure: measureShape,
  headerLabel: PropTypes.string,
  keysColumns: PropTypes.object.isRequired,
  lockedTopN: PropTypes.bool.isRequired,
  onUnlockTopN: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })
  )
}

function CustomColorHeader(props) {
  if (props.options.length > 1) {
    return (
      <CustomSelector
        className="custom-color-selector"
        currentValue={props.color.customKey}
        id="color-by-dimension-selector"
        onChange={props.changeSelectorValue}
        options={props.options}
      />
    )
  }
  return (
    <div className="custom-colors-header">
      {props.headerLabel
        ? process(props.headerLabel, { useDisplayName: true })
        : "Custom Colors"}
      {props.colorDimensionActive && (
        <TopNToggle
          lockedTopN={props.lockedTopN}
          onUnlockTopN={props.onUnlockTopN}
        />
      )}
    </div>
  )
}

CustomColors.propTypes = Object.assign({}, CustomColorHeader.propTypes, {
  additionalColors: PropTypes.arrayOf(PropTypes.string),
  allowRemoval: PropTypes.bool.isRequired,
  buttonLabel: PropTypes.string.isRequired,
  chart: PropTypes.any,
  chartId: PropTypes.string, // same as `props.id`
  chartType: PropTypes.string.isRequired,
  colorDimensionActive: PropTypes.bool.isRequired,
  hasAxisSelector: PropTypes.bool,
  hasColorDimension: PropTypes.bool,
  id: PropTypes.string.isRequired,
  removeCustomColors: PropTypes.func.isRequired,
  table: PropTypes.string,
  updateChartColor: PropTypes.func.isRequired,
  lockedTopN: PropTypes.bool.isRequired,
  markTypes: PropTypes.arrayOf(PropTypes.string),
  multiSourceIndex: PropTypes.string,
  onUnlockTopN: PropTypes.func.isRequired
})

function CustomColors(props) {
  let lineStyles = []
  if (!isEmpty(path(["color", "lineStyles"], props))) {
    lineStyles = props.color.lineStyles
  } else if (path(["color", "customDomain"], props)) {
    lineStyles = props.color.customDomain.map(() => LINE_STYLES[0])
  }

  const getRange = () => {
    if (isD3ChartWithCustomDomainRange(props.chart)) {
      return getD3ChartColorRange(props.chart)
    } else {
      return path(["color", "customRange"], props)
        ? props.color.customRange.filter((i) => i !== "other")
        : []
    }
  }

  const getDomain = () => {
    if (isD3ChartWithCustomDomainRange(props.chart)) {
      return getD3ChartColorDomain(props.chart)
    } else {
      return props.color.customDomain ?? []
    }
  }

  const hasOther = CHARTS_WITH_ALL_OTHERS.includes(props.chartType)

  const palette = props.color?.palette ?? props.color?.customColors

  return (
    <div
      className={cx("custom-colors-widget", {
        "with-removal": props.allowRemoval
      })}
    >
      {props.allowRemoval && (
        <button
          className="button custom-colors-remove"
          id="custom-colors-remove"
          onClick={props.removeCustomColors}
          title={"Remove Custom Colors"}
        >
          <Icon name="delete" />
        </button>
      )}
      <CustomColorHeader {...props} />
      <CustomColorsList
        addColor={props.addColor}
        additionalColors={props.additionalColors}
        addedColor={props.addedColor}
        buttonLabel={props.buttonLabel}
        chart={props.chart}
        chartId={props.chartId}
        columnName={
          props.color?.column &&
          process(props.color.column, { trackUsage: false })
        }
        defaultOtherDomain={props.color && props.color.defaultOtherDomain}
        defaultOtherLineStyle={
          (props.color && props.color.defaultOtherLineStyle) || LINE_STYLES[0]
        }
        defaultOtherRange={props.color && props.color.defaultOtherRange}
        disableAdd={props.disableAdd}
        disableOthers={
          props.disableOthers || isD3ChartWithCustomDomainRange(props.chart)
        }
        disableRemove={props.disableRemove}
        disableToggle={props.disableToggle}
        domain={getDomain()}
        getTrueMeasureIndex={props.getTrueMeasureIndex}
        hasAxisSelector={props.hasAxisSelector}
        hasLineStyles={props.chartType === "line2"}
        hasOther={hasOther}
        lineStyles={lineStyles}
        markTypes={props.markTypes}
        multiSourceIndex={props.multiSourceIndex}
        palette={palette}
        range={getRange()}
        removeColor={props.removeColor}
        setCustomColorValue={props.setCustomColorValue}
        setCustomDefaultOtherColorValue={props.setCustomDefaultOtherColorValue}
        showOther={props.showOther}
        table={props.table}
        toggleOther={props.toggleOther}
        toggleYAxisOrientation={props.toggleYAxisOrientationWithProps}
        hideOther={props.color && props.color.hideOther}
        updateHideOther={props.updateHideOther}
      />
    </div>
  )
}

export default compose(
  withAddedState,
  connect(
    (state, { multiSourceIndex }) => {
      const chartState = state.charts[state.chartEditor.editId]
      const measures = chartState.measures
      const table = getDataSource(chartState, multiSourceIndex)

      return {
        measures,
        table
      }
    },
    mapDispatchToProps,
    mergeProps
  )
)(CustomColors)
