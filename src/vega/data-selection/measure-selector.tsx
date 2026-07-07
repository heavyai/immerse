// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { AnyAction } from "redux"
import { ThunkDispatch } from "redux-thunk"
import { connect, ConnectedProps } from "react-redux"
import cx from "classnames"

import { enhanceColumnMetadata } from "services/ImmerseCrossFilter/utils"

import VegaSelector from "vega/components/VegaSelector/VegaSelector"

import {
  isGroupable,
  Aggregate,
  CountOption,
  BarMeasureName,
  MeasureExpression,
  MeasureOption,
  CUSTOM_SQL_SELECTOR_TYPE
} from "vega/constants/data-selection-types"
import { getLayerById } from "vega/utils/data-selection"
import AggregateSubComponent from "vega/components/SelectorSubComponent/AggregateSubComponent"
import { AppState } from "vega/charts/types"
import {
  setMeasureOption,
  clearMeasure,
  setMeasureAggregate,
  editCustomSqlMeasure, // for old selectors
  editParameterizedCustomSql,
  setParameterizedCustomMeasureFromDropdown
} from "vega/actions/data-selection-thunks"
import { ParameterTypes } from "components/parameters/parameters-types"
import { getDataTableFilterType } from "vega/utils/selectors"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import {
  getParameterizedCustomSqlMetadata,
  parameterDefinitionToSelectorMetadata
} from "utils/parameterized-custom-sql-metadata"
import { getFullColumnName } from "components/join-manager/utils"
import { CHART_DEFS, CHART_TYPES } from "constants/chart-types"

const countOption: CountOption = {
  value: "# Records",
  label: "# Records",
  isCount: true,
  type: "INT", // for data-column-selector#gettypecategory to read, for now
  filterType: "INT"
}

const getDisplayName = (measureName: BarMeasureName): string =>
  measureName === "size" ? "Base measure" : "Color by measure"

interface OwnProps {
  chartId: string
  layerId: string
  measureName: BarMeasureName
  measureIndex: number | null
  disabled?: boolean
  required?: boolean
}

const mapStateToProps = (
  state: AppState,
  { chartId, layerId, measureName, measureIndex, disabled }: OwnProps
) => {
  const chart = state.charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)
  const displayName = getDisplayName(measureName)
  const table = dataSelection?.table

  const chartDimensionSettings = CHART_DEFS[chart.type].dimensionSettings
  const measureSettings = chartDimensionSettings?.measures?.[measureIndex]

  const columnsMeta = [
    ...getParameterizedCustomSqlMetadata(
      table?.name,
      ParameterTypes.CUSTOM_MEASURE,
      parameterDefinitionToSelectorMetadata
    ),
    ...getParameterizedCustomSqlMetadata(
      table?.name,
      ParameterTypes.GLOBAL_MEASURE,
      parameterDefinitionToSelectorMetadata
    ),
    ...enhanceColumnMetadata(
      state.dashboard.dataSources[table?.name || ""]?.columnMetadata,
      table?.name
    )
  ]
    .sort((a, b) => a.value.localeCompare(b.value))
    .map((col) => ({
      ...col,
      filterType: getDataTableFilterType(col),
      value: getFullColumnName(col, "value")
    }))

  let measure: MeasureExpression | null = null
  if (dataSelection) {
    if (measureName === "size") {
      if (measureIndex === null) {
        throw new Error("No measure index passed for array measure")
      }

      measure = dataSelection.measures.size[measureIndex] || null
    } else {
      measure = dataSelection.measures.color
    }
  }

  let options: MeasureOption[] | null = null
  if (columnsMeta) {
    options = [
      ...(chart.type !== CHART_TYPES.BOX_PLOT ? [countOption] : []),
      ...columnsMeta.filter(
        (column) =>
          isGroupable(column) ||
          ((column.sharedCustom || column.globalCustom) &&
            isGroupable(column.column))
      )
    ]
  }

  if (measureSettings) {
    options =
      options?.filter((col) =>
        measureSettings?.type ? measureSettings.type[col.type] : true
      ) ?? []
  }

  return {
    options,
    measure,
    displayName,
    disabled: disabled || !options
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>,
  { chartId, layerId, measureName, measureIndex }: OwnProps
) => ({
  actions: {
    setMeasureOption(option: MeasureOption) {
      if (option.sharedCustom || option.globalCustom) {
        dispatch(
          setParameterizedCustomMeasureFromDropdown(
            chartId,
            layerId,
            measureName,
            measureIndex,
            option
          )
        )
      } else {
        dispatch(
          setMeasureOption(chartId, layerId, measureName, measureIndex, option)
        )
      }
    },
    setMeasureAggregate(aggregate: Aggregate) {
      dispatch(
        setMeasureAggregate(
          chartId,
          layerId,
          measureName,
          measureIndex,
          aggregate
        )
      )
    },
    onCreateCustomSql() {
      dispatch(
        editCustomSqlMeasure(chartId, layerId, measureName, measureIndex)
      )
    },
    onEditParameterizedCustomSql(existingCustomSql, customSQLType) {
      dispatch(
        editParameterizedCustomSql(
          chartId,
          layerId,
          measureName,
          measureIndex,
          customSQLType,
          existingCustomSql
        )
      )
    },
    clearMeasure() {
      dispatch(clearMeasure(chartId, layerId, measureName, measureIndex))
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

const makeSelectedOptionFromMeasure = (measure) => {
  if (!measure) {
    return null
  }
  if (measure?.type === "count") {
    return countOption
  } else if (measure?.sharedCustom || measure?.globalCustom) {
    return {
      value: measure.sql,
      label: process(measure.sql, { useDisplayName: true }),
      isCustom: true,
      sharedCustom: Boolean(measure?.sharedCustom),
      globalCustom: Boolean(measure?.globalCustom)
    }
  } else if (measure?.type === CUSTOM_SQL_SELECTOR_TYPE) {
    return { value: measure.name, isCustom: true }
  }

  return measure.column
}
const MeasureSelector: FC<Props> = ({
  disabled,
  required,
  options,
  displayName,
  measure,
  actions
}) => {
  const selectedOption = makeSelectedOptionFromMeasure(measure)

  return (
    <div
      className={cx("selector-wrapper", {
        "dual-selector": measure?.type === "column_aggregate"
      })}
    >
      <VegaSelector
        disabled={disabled}
        required={required}
        selectedOption={selectedOption}
        options={options}
        updateValue={actions.setMeasureOption}
        placeholder={displayName}
        onClear={actions.clearMeasure}
        onCreateCustomSql={actions.onCreateCustomSql}
        onEditParameterizedCustomSql={actions.onEditParameterizedCustomSql}
        customSqlLabel="Create SQL measure"
      />
      {measure?.type === "column_aggregate" && (
        <AggregateSubComponent
          expression={measure}
          onAggregateChange={actions.setMeasureAggregate}
        />
      )}
    </div>
  )
}

export default connector(MeasureSelector)
