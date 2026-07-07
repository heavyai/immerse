// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { AnyAction } from "redux"
import { connect, ConnectedProps } from "react-redux"
import { ThunkDispatch } from "redux-thunk"
import {
  topnSetMeasure,
  topnSetSortOrder,
  topnSetMeasureAggregate
} from "vega/actions/top-n-action-creators"
import { enhanceColumnMetadata } from "services/ImmerseCrossFilter/utils"
import { DATA_TYPE_CATEGORY } from "components/data-column-selector/constants"

import {
  MeasureExpression,
  COUNT_OPTION,
  isGroupable,
  MeasureOption,
  ComboDataSelection,
  Aggregate
} from "vega/constants/data-selection-types"
import { VegaCustomizableTopNOptions, AppState } from "vega/charts/types"

import SortOrderWidget from "vega/components/SortOrderWidget"
import SortMeasureSelector from "vega/components/SortTopN/SortMeasureSelector"

import { getLayerById } from "vega/utils/data-selection"
import { makeMeasureExpressionFromMeasureOption } from "vega/actions/data-selection-thunks"

import "./styles.scss"

type OwnProps = {
  chartId: string
  layerId: string
}

const mapStateToProps = (state: AppState, { chartId, layerId }: OwnProps) => {
  const chart = state.charts[chartId]
  const dataSelection = getLayerById(
    chart.dataSelections,
    layerId
  ) as ComboDataSelection
  const table = dataSelection.table
  const columnsMeta =
    state.dashboard.dataSources[table?.name || ""]?.columnMetadata
  const topNOptions = dataSelection.topNoptions as VegaCustomizableTopNOptions
  const ordering = topNOptions.sort

  const options: MeasureOption[] | [] = table
    ? [
        COUNT_OPTION,
        // TODO: not sure if this isGroupable filter is necessary
        ...enhanceColumnMetadata(columnsMeta)
          .filter(isGroupable)
          .map((col) => ({
            ...col,
            filterType: col.parameter
              ? DATA_TYPE_CATEGORY.COLUMN_PARAMETER
              : col.type,
            value: col.is_join ? `${col.table}.${col.value}` : col.value
          }))
      ]
    : []

  return {
    options,
    selectedMeasure: topNOptions.measure,
    ordering,
    table,
    disabled: !options
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>,
  { chartId, layerId }: OwnProps
) => ({
  actions: {
    setMeasure(measure: MeasureExpression) {
      dispatch(topnSetMeasure(chartId, layerId, "topNoptions", measure))
    },
    setOrdering(order: VegaCustomizableTopNOptions["sort"]) {
      dispatch(topnSetSortOrder(chartId, layerId, "topNoptions", order))
    },
    setMeasureAggregate(aggregate: Aggregate) {
      dispatch(
        topnSetMeasureAggregate(chartId, layerId, "topNoptions", aggregate)
      )
    }
  }
})

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>,
  OwnProps,
  AppState
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector> & OwnProps

const SortTopNSelector: FC<Props> = ({
  actions,
  ordering,
  selectedMeasure,
  disabled,
  options,
  table
}) => {
  // Do this here so we can pass `table` to actions.setMeasure
  const setMeasure = (measureOption: MeasureOption) => {
    if (table) {
      const measureExpression = makeMeasureExpressionFromMeasureOption(
        table.name,
        measureOption
      )
      actions.setMeasure(measureExpression)
    }
  }
  return (
    <div className="sort-topN">
      <div className="sort-topN-body">
        <SortMeasureSelector
          options={options}
          disabled={disabled}
          selectedMeasure={selectedMeasure}
          setMeasure={setMeasure}
          setMeasureAggregate={actions.setMeasureAggregate}
        />
        <div data-testid="sort-topN-button">
          <SortOrderWidget order={ordering} setOrder={actions.setOrdering} />
        </div>
      </div>
    </div>
  )
}

export default connector(SortTopNSelector)
