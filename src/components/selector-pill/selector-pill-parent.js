// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as SelectorActions from "actions/selector-action-creators"

import { getIsNonGeoJoinedChoroplethColorMeasure } from "components/measure-selectors-popover/measure-selectors-popover-parent"
import {
  editParameterizedCustomSQLSelector,
  OLD_SELECTORS_TO_MODAL_TYPE,
  openCustomSQLSelectorModal,
  CustomSQLTypes
} from "components/custom-sql-manager/custom-sql-manager-actions"
import {
  getBinIntervalLabel,
  getSelectorAlias,
  getSelectorPillStyles
} from "./selector-pill-parent-helpers"
import { shouldShowAggType } from "utils/selector-helpers"

import compose from "recompose/compose"
import { connect } from "react-redux"
import enhanceComponentIf from "utils/enhance-component-if"
import makeDropAndDraggable from "./make-drop-and-draggable"
import mapProps from "recompose/mapProps"
import PropTypes from "prop-types"
import SelectorPill from "./selector-pill"
import { selectorShape } from "constants/prop-types"
import setPropTypes from "recompose/setPropTypes"
import { TIME_UNITS } from "constants/data-types"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { removeCustomDomainRange } from "actions/charts-color-action-creators"

const propTypes = {
  aggType: PropTypes.string,
  chartId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  label: PropTypes.string,
  name: PropTypes.string,
  selector: selectorShape.isRequired,
  openSelectorPopover: PropTypes.func.isRequired,
  removeSelector: PropTypes.func.isRequired,
  selectorType: PropTypes.oneOf(["measures", "dimensions", "postFilters"]),
  type: PropTypes.string,
  value: PropTypes.string
}

export function mapStateToProps(
  { charts },
  { chartId, label, aggType, isBinned, loading, selector }
) {
  const numDimensions = charts[chartId].dimensions.filter(
    (d) => d.value && !d.inactive
  ).length
  const chartType = charts[chartId].type
  const isNonGeoJoinedChoroplethColorMeasure = getIsNonGeoJoinedChoroplethColorMeasure(
    charts[chartId],
    selector
  )

  const processedLabel = process(label, { useDisplayName: true })

  return {
    numDimensions,
    shouldShowCustom: selector.custom,
    chart: charts[chartId],
    shouldShowAggType: shouldShowAggType(
      chartType,
      selector,
      numDimensions,
      label,
      aggType,
      isNonGeoJoinedChoroplethColorMeasure
    ),
    isBinned,
    loading,
    processedLabel
  }
}

export function mapDispatchToProps(
  dispatch,
  { chartId, dataSource, multiSourceIndex, selectorType }
) {
  const swapSelectorsForType = SelectorActions.swapSelectors(
    chartId,
    selectorType
  )
  return {
    swapSelectors(hoverIndex, dragIndex) {
      dispatch(swapSelectorsForType(hoverIndex, dragIndex))
    },
    editParameterizedCustomSQLOption(index, selector) {
      if (selector.sharedCustom || selector.globalCustom) {
        dispatch(
          editParameterizedCustomSQLSelector({
            customSelectorValue: selector.value,
            activeDataSource: dataSource,
            chartId,
            selectorType,
            customSQLType: selector.sharedCustom
              ? CustomSQLTypes.CUSTOM_SQL_EDIT_SHARED
              : CustomSQLTypes.CUSTOM_SQL_EDIT_GLOBAL,
            selectorIndex: index,
            isOldSelector: true
          })
        )
      } else {
        dispatch(
          openCustomSQLSelectorModal(
            chartId,
            multiSourceIndex,
            dataSource,
            null,
            index,
            {
              name: selector.label,
              sql: selector.value
            },
            OLD_SELECTORS_TO_MODAL_TYPE[selectorType],
            true
          )
        )
      }
    },
    resetCustomDomainRange() {
      dispatch(removeCustomDomainRange(chartId))
    }
  }
}

export function mergeProps(props) {
  const {
    connectDropTarget,
    connectDragSource,
    isBinned,
    chart,
    numDimensions,
    ...restProps
  } = props

  return {
    ...restProps,
    binIntervalLabel: getBinIntervalLabel(restProps.timeBin, restProps.extract),
    isBinned: typeof isBinned === "undefined" ? false : isBinned,
    isTime: TIME_UNITS[props.selector.type],
    alias: getSelectorAlias(chart.type, restProps, numDimensions),
    makeDraggable: enhanceComponentIf(connectDragSource, restProps.label),
    makeDroppable: connectDropTarget,
    style: getSelectorPillStyles({ ...restProps, chartType: chart.type }),
    handleSelectorClick() {
      if (props.inactive) {
        return
      }

      if (props.selector.custom) {
        props.editParameterizedCustomSQLOption(props.index, props.selector)
      } else {
        props.openSelectorPopover()
      }
    },
    handleAggClick() {
      if (props.inactive) {
        return
      }

      props.openSelectorPopover()
    },
    onRemoveClick() {
      props.removeSelector(props.index, props.type)
    }
  }
}

export default compose(
  setPropTypes(propTypes),
  connect(mapStateToProps, mapDispatchToProps),
  makeDropAndDraggable,
  mapProps(mergeProps)
)(SelectorPill)
