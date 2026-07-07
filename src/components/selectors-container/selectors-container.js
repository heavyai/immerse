// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ChartActions from "actions/charts-action-creators"
import {
  customDimension,
  customMeasure,
  customPostFilter
} from "actions/custom-selector-thunks"
import compose from "recompose/compose"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import setPropTypes from "recompose/setPropTypes"
import {
  editParameterizedCustomSQLSelector,
  OLD_SELECTORS_TO_MODAL_TYPE,
  openCustomSQLSelectorModal
} from "components/custom-sql-manager/custom-sql-manager-actions"

const propTypes = {
  type: PropTypes.oneOf(["measures", "dimensions", "postFilters"]),
  selectors: PropTypes.arrayOf(PropTypes.object).isRequired,
  chartId: PropTypes.string.isRequired,
  chartType: PropTypes.string.isRequired,
  multiSourceIndex: PropTypes.number.isRequired
}

function mapStateToProps({ charts }, { chartId }) {
  return {
    chartType: charts[chartId].type,
    dimensions: charts[chartId].dimensions
  }
}

function mapDispatchToProps(dispatch, { chartId, type, multiSourceIndex }) {
  return {
    addCustomMeasure: (chartType) => (index, value, label) => {
      dispatch(
        customMeasure(
          chartId,
          chartType,
          index,
          {
            value,
            custom: true,
            isError: false,
            label: label || "Custom Measure",
            type: "CUSTOM"
          },
          multiSourceIndex
        )
      )
    },
    addCustomPostFilter: (chartType) => (index, value, label) => {
      dispatch(
        customPostFilter(chartId, chartType, index, {
          value,
          custom: true,
          isError: false,
          label: label || "Custom Measure",
          type: "CUSTOM"
        })
      )
    },
    addCustomDimension: (chartType) => (index, value, label) => {
      dispatch(
        customDimension(
          chartId,
          chartType,
          index,
          {
            value,
            custom: true,
            isError: false,
            label: label || "Custom Dimension",
            type: "CUSTOM"
          },
          multiSourceIndex
        )
      )
    },
    createNewCustomSQL: (dataSource) => (index) => {
      dispatch(
        openCustomSQLSelectorModal(
          chartId,
          multiSourceIndex,
          dataSource,
          null,
          index,
          {},
          OLD_SELECTORS_TO_MODAL_TYPE[type],
          true
        )
      )
    },
    editParameterizedCustomSql: (dataSource, selectorType) => (
      name,
      customSQLType
    ) =>
      dispatch(
        editParameterizedCustomSQLSelector({
          customSelectorValue: name,
          activeDataSource: dataSource,
          chartId,
          selectorType,
          customSQLType,
          isOldSelector: true,
          layerId: multiSourceIndex
        })
      ),
    addSelector: (chartType) => (index, selector) => {
      dispatch(
        ChartActions.addSelector(type)(
          chartId,
          chartType,
          index,
          selector,
          multiSourceIndex
        )
      )
    },
    removeSelector(index, dataType) {
      dispatch(ChartActions.removeSelector(chartId, { index, type, dataType }))
    },
    clearSelector(index) {
      dispatch(ChartActions.clearSelector(chartId, { index, type }))
    }
  }
}

function mergeProps(
  stateProps,
  dispatchProps,
  {
    selectors,
    chartId,
    dataSource,
    type,
    index,
    multiSourceIndex,
    dimensionsFilter
  }
) {
  return {
    type,
    chartId,
    chartType: stateProps.chartType,
    dataSource,
    [type]: selectors,
    hasActiveDimensions:
      stateProps.dimensions.filter((d) => d.value && !d.inactive).length > 0,
    index,
    addSelector: dispatchProps.addSelector(stateProps.chartType),
    clearSelector: dispatchProps.clearSelector,
    removeSelector: dispatchProps.removeSelector,
    addCustomMeasure: dispatchProps.addCustomMeasure(stateProps.chartType),
    addCustomPostFilter: dispatchProps.addCustomPostFilter(
      stateProps.chartType
    ),
    addCustomDimension: dispatchProps.addCustomDimension(stateProps.chartType),
    createNewCustomSQL: dispatchProps.createNewCustomSQL(dataSource),
    multiSourceIndex,
    editParameterizedCustomSql: dispatchProps.editParameterizedCustomSql(
      dataSource,
      type
    ),
    dimensions: dimensionsFilter
      ? stateProps.dimensions.filter(dimensionsFilter)
      : stateProps.dimensions
  }
}

export default compose(
  setPropTypes(propTypes),
  connect(mapStateToProps, mapDispatchToProps, mergeProps)
)
