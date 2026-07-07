// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FC, default as React } from "react"
import { connect, ConnectedProps } from "react-redux"
import { ThunkDispatch } from "redux-thunk"
import { AnyAction } from "redux"
import { CHART_DEFS } from "constants/charts"

import { VegaComboChart, VegaBoxPlotChart, AppState } from "vega/charts/types"

import {
  buildSortByDimensions,
  buildSortByMeasures,
  createSortByOptions
} from "components/chart-settings-sort-by-dropdown/chart-settings-sort-by-helpers"

import {
  updateBaseDimensionSortColumn,
  updateBaseDimensionSortOrder
} from "vega/actions/data-selection-action-creators"

import SortOrderWidget from "vega/components/SortOrderWidget"
import CustomSelector from "components/custom-selector/custom-selector"

import "./styles.scss"

type OwnProps = {
  chartId: string
}

const mapStateToProps = ({ charts }: AppState, { chartId }: OwnProps) => {
  const chart = charts[chartId] as VegaComboChart | VegaBoxPlotChart
  const { dimensions, measures } = chart.dataSelections[0]

  return {
    currentSortColumn: chart.vegaSortColumn,
    currentSortOrder: chart.vegaSortColumn.order,
    dimensions,
    measures,
    defaultAggregation: CHART_DEFS[chart.type].defaultAggregation
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>,
  { chartId }: OwnProps
) => {
  return {
    actions: {
      updateSortColumn(columnName: string) {
        dispatch(updateBaseDimensionSortColumn(chartId, columnName))
      },
      updateSortOrder(order: "ASC" | "DESC") {
        const lowerCaseOrder = order.toLowerCase() as "asc" | "desc"
        dispatch(updateBaseDimensionSortOrder(chartId, lowerCaseOrder))
      }
    }
  }
}

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>,
  OwnProps,
  AppState
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector> & OwnProps

const renderOption = ({ label, type }: { label: string; type: string }) => (
  <div className="sort-by-container">
    <span className="sort-by-label">{label}</span>
    {type && <span className="sort-type">{type}</span>}
  </div>
)

const BaseDimensionSort: FC<Props> = ({
  dimensions,
  measures,
  currentSortColumn,
  currentSortOrder,
  defaultAggregation,
  actions
}) => {
  const firstSourceMeasures = measures
  const firstSourceDimensions = dimensions

  const sortByMeasures: {
    label: string
    value: string
    type: string
    aggType?: string
    name: string
  }[] = buildSortByMeasures(firstSourceMeasures, defaultAggregation)

  const sortByDimensions: {
    label: string
    value: string
    type: string
  }[] = buildSortByDimensions(firstSourceDimensions)

  const options = createSortByOptions(
    sortByDimensions,
    sortByMeasures,
    "dimension"
  )

  return (
    <div className="base-dimension-sort-input">
      <div className="sort-column-input">
        <CustomSelector
          currentValue={currentSortColumn}
          onChange={actions.updateSortColumn}
          options={options}
          renderOption={renderOption}
        />
      </div>
      <div className="sort-order-input">
        <SortOrderWidget
          order={currentSortOrder}
          setOrder={actions.updateSortOrder}
        />
      </div>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseDimensionSort)
