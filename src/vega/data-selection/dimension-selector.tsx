// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { AnyAction } from "redux"
import { ThunkDispatch } from "redux-thunk"
import { connect, ConnectedProps } from "react-redux"
import cx from "classnames"

import { enhanceColumnMetadata } from "services/ImmerseCrossFilter/utils"

import { process } from "utils/ImmerseSQLPlusPlus/parser"

import {
  setDimensionColumn,
  clearDimension,
  editCustomSqlDimension,
  setParameterizedCustomDimensionFromDropdown,
  editParameterizedCustomSql
} from "vega/actions/data-selection-thunks"
import VegaSelector from "vega/components/VegaSelector/VegaSelector"
import NumericalBinningSubComponent from "vega/components/SelectorSubComponent/NumericalBinningSubComponent"
import TimeBinningSubComponent from "vega/components/SelectorSubComponent/TimeBinningSubComponent"
import { AppState } from "vega/charts/types"
import {
  isGroupable,
  isGroupableCategorical,
  isGroupableNumeric,
  isGroupableTime,
  BarDimensionName,
  Column,
  DimensionExpression,
  CUSTOM_SQL_SELECTOR_TYPE
} from "vega/constants/data-selection-types"
import { getLayerById } from "vega/utils/data-selection"
import { getLatestBeatData } from "vega/utils/data"
import { ParameterTypes } from "components/parameters/parameters-types"
import { getDataTableFilterType } from "vega/utils/selectors"
import {
  getParameterizedCustomSqlMetadata,
  parameterDefinitionToSelectorMetadata
} from "utils/parameterized-custom-sql-metadata"
import { getFullColumnName } from "components/join-manager/utils"
import { CHART_DEFS } from "constants/charts"

const getDisplayName = (dimensionName: BarDimensionName): string =>
  dimensionName === "xAxis" ? "Base dimension" : "Group by dimension"

interface OwnProps {
  chartId: string
  layerId: string
  dimensionName: BarDimensionName
  dimensionIndex: number | null
  disabled?: boolean
  required?: boolean
}

const mapStateToProps = (
  state: AppState,
  { chartId, layerId, dimensionName, dimensionIndex, disabled }: OwnProps
) => {
  const chart = state.charts[chartId]
  const { binSettings, data, dataSelections } = chart
  const chartDimensionSettings = CHART_DEFS[chart.type].dimensionSettings
  const dimensionSettings = chartDimensionSettings?.dimensions?.[dimensionIndex]

  const dataSelection = getLayerById(dataSelections, layerId)
  const displayName = getDisplayName(dimensionName)
  const table = dataSelection?.table
  const columnsMeta = [
    ...getParameterizedCustomSqlMetadata(
      table?.name,
      ParameterTypes.CUSTOM_DIMENSION,
      parameterDefinitionToSelectorMetadata
    ),
    ...getParameterizedCustomSqlMetadata(
      table?.name,
      ParameterTypes.GLOBAL_DIMENSION,
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

  let dimension: DimensionExpression | null = null
  let columns: Column[] | null = null

  if (dataSelection && columnsMeta) {
    if (dimensionName === "xAxis") {
      if (dimensionIndex === null) {
        throw new Error("No dimension index passed for array dimension")
      }

      dimension = dataSelection.dimensions.xAxis[dimensionIndex] || null

      const binType = binSettings?.dimensionType

      if (binType === "binned_numeric" || binType === "binned_time") {
        // If there are other base dimensions selected on the chart, and the chart
        // is binned, then we can only select columns that match the current type.
        const otherBaseDimensions = Object.values(chart.dataSelections).some(
          (ds) =>
            ds.layerId !== layerId &&
            Boolean(ds.dimensions.xAxis[dimensionIndex])
        )

        if (otherBaseDimensions) {
          columns = columnsMeta.filter(
            binType === "binned_time"
              ? (col) =>
                  isGroupableTime(col) ||
                  ((col.sharedCustom || col.globalCustom) &&
                    isGroupableTime(col.column))
              : (col) =>
                  isGroupableNumeric(col) ||
                  ((col.sharedCustom || col.globalCustom) &&
                    isGroupableNumeric(col.column))
          )
        }
      }
    } else {
      dimension = dataSelection.dimensions.color

      columns = columnsMeta.filter(
        (col) =>
          isGroupableCategorical(col) ||
          ((col.sharedCustom || col.globalCustom) &&
            isGroupableCategorical(col.column))
      )
    }
  }

  if (columnsMeta && columns === null) {
    columns = columnsMeta.filter(
      (column) =>
        isGroupable(column) ||
        ((column.sharedCustom || column.globalCustom) &&
          isGroupable(column.column))
    )
  }

  // We always show the sub selector when we have a compatible base dimension type -
  // even if the binSettings are currently null (that means binning/extract are off)
  const isBaseTimeDimension =
    dimensionName === "xAxis" && dimension && isGroupableTime(dimension.column)
  const isBaseNumericDimension =
    dimensionName === "xAxis" &&
    dimension &&
    isGroupableNumeric(dimension.column)

  const minmaxPending =
    data &&
    dimensionName === "xAxis" &&
    (isBaseTimeDimension || isBaseNumericDimension) &&
    binSettings &&
    (binSettings.dimensionType === "binned_numeric" ||
      binSettings.dimensionType === "binned_time") &&
    (binSettings.manualMin === null || binSettings.manualMax === null)
      ? // Take minmax results from focus chart as source of truth
        !data.focus
          .map(getLatestBeatData)
          .every((beatData) => Boolean(beatData?.minmax))
      : false

  if (dimensionSettings) {
    columns =
      columns?.filter((col) =>
        dimensionSettings?.type ? dimensionSettings.type[col.type] : true
      ) ?? []
  }
  return {
    columns,
    dimension,
    displayName,
    isBaseTimeDimension,
    isBaseNumericDimension,
    binSettings,
    minmaxPending,
    disabled: disabled || !columns
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>,
  { chartId, layerId, dimensionName, dimensionIndex }: OwnProps
) => ({
  actions: {
    setDimensionColumn(option) {
      if (option.sharedCustom || option.globalCustom) {
        dispatch(
          setParameterizedCustomDimensionFromDropdown(
            chartId,
            layerId,
            dimensionName,
            dimensionIndex,
            option
          )
        )
      } else {
        dispatch(
          setDimensionColumn(
            chartId,
            layerId,
            dimensionName,
            dimensionIndex,
            option
          )
        )
      }
    },
    onCreateCustomSql() {
      dispatch(
        editCustomSqlDimension(chartId, layerId, dimensionName, dimensionIndex)
      )
    },
    onEditParameterizedCustomSql(existingCustomSql, customSQLType) {
      dispatch(
        editParameterizedCustomSql(
          chartId,
          layerId,
          dimensionName,
          dimensionIndex,
          customSQLType,
          existingCustomSql
        )
      )
    },
    clearDimension() {
      dispatch(clearDimension(chartId, layerId, dimensionName, dimensionIndex))
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

const DimensionSelector: FC<Props> = ({
  chartId,
  disabled,
  required,
  columns,
  displayName,
  dimension,
  isBaseTimeDimension,
  isBaseNumericDimension,
  binSettings,
  minmaxPending,
  actions
}) => {
  let columnValue = dimension?.column
  if (dimension?.type === CUSTOM_SQL_SELECTOR_TYPE) {
    columnValue = {
      value: dimension.name,
      isCustom: true
    }
  }

  if (dimension?.sharedCustom || dimension?.globalCustom) {
    columnValue = {
      value: dimension.sql,
      label: process(dimension.sql, { useDisplayName: true }),
      isCustom: true,
      sharedCustom: Boolean(dimension?.sharedCustom),
      globalCustom: Boolean(dimension?.globalCustom)
    }
  }

  const optionsWithValue = columns
  let subSelector = null

  if (isBaseTimeDimension) {
    if (binSettings?.dimensionType === "binned_time") {
      if (!minmaxPending) {
        subSelector = <TimeBinningSubComponent chartId={chartId} />
      }
    } else {
      subSelector = <TimeBinningSubComponent chartId={chartId} />
    }
  } else if (isBaseNumericDimension) {
    if (binSettings?.dimensionType === "binned_numeric") {
      if (!minmaxPending) {
        subSelector = <NumericalBinningSubComponent chartId={chartId} />
      }
    } else {
      subSelector = <NumericalBinningSubComponent chartId={chartId} />
    }
  }

  return (
    <div
      className={cx("selector-wrapper", {
        "dual-selector": subSelector
      })}
    >
      <VegaSelector
        disabled={minmaxPending || disabled}
        required={required}
        loading={minmaxPending}
        selectedOption={columnValue}
        options={optionsWithValue}
        updateValue={actions.setDimensionColumn}
        placeholder={displayName}
        onClear={actions.clearDimension}
        onCreateCustomSql={actions.onCreateCustomSql}
        onEditParameterizedCustomSql={actions.onEditParameterizedCustomSql}
        customSqlLabel="Create SQL dimension"
      />
      {subSelector}
    </div>
  )
}

export default connector(DimensionSelector)
