// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"

import { getDataSourcesList } from "actions/tables-action-creators"
import { SourceSelectorOptionKeys } from "vega/components/SourceSelector/BaseSourceSelector"
import { initChartEditorTablePreview } from "actions/chart-editor-action-creators"
import { selectDataSource } from "actions/data-source-action-creators"
import { setChartSpecificBinFilters } from "vega/actions/filter-action-creators-crossfilter-interop"
import { openCustomSourceManager } from "components/custom-source-manager/custom-source-manager-actions"

import { processTablesListFromDashboardState } from "./utils"
import { BaseDataSourceSelector } from "./base-data-source-selector"
import { openJoinManager } from "components/join-manager/join-manager-actions"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"

export const DataSourceSelector = (props) => {
  const dispatch = useDispatch()
  const tablesList = useSelector((state) => state.tables.list)
  const loadingTables = useSelector((state) => state.tables.loading)
  const loadedTables = useSelector((state) => state.tables.loaded)
  const dataSources = useSelector((state) => state.dashboard.dataSources)
  const charts = useSelector((state) => state.charts)
  const joinDataSources = useSelector((state) => state.joinDataSources)
  const { tables } = useMemo(() => {
    return processTablesListFromDashboardState(
      dataSources,
      tablesList,
      joinDataSources
    )
  }, [dataSources, tablesList, joinDataSources])

  const clearTablePreview = () => dispatch(initChartEditorTablePreview(null))

  const onHoverPreview = (option) => {
    if (!Object.values(SourceSelectorOptionKeys).includes(option.value)) {
      dispatch(initChartEditorTablePreview(option.value))
    } else {
      clearTablePreview()
    }
  }

  const onSelectDataSource = async (option, multiSourceIndex) => {
    if (option.value === SourceSelectorOptionKeys.CUSTOM) {
      await dispatch(
        openCustomSourceManager({
          activeDataSource: charts[props.chartId].dataSource,
          layerId: multiSourceIndex,
          chartId: props.chartId
        })
      )
    } else if (option.value === SourceSelectorOptionKeys.JOIN) {
      await dispatch(
        openJoinManager({
          layerId: multiSourceIndex,
          chartId: props.chartId
        })
      )
    } else {
      await dispatch(
        selectDataSource(
          { chartId: props.chartId },
          option.value,
          multiSourceIndex
        )
      )
    }
    await dispatch(setChartSpecificBinFilters(props.chartId))

    clearTablePreview()
  }

  const isClickOutsideTableInfo = (e) =>
    e.target.className !== "table-column-body"

  const joinDataSource = useJoinFromParameter(props.dataSource)
  const parsedDataSource = joinDataSource?.name ?? props.dataSource
  return (
    <BaseDataSourceSelector
      dataSource={parsedDataSource}
      getTables={() => dispatch(getDataSourcesList())}
      multiSourceIndex={props.multiSourceIndex}
      onClickOutside={isClickOutsideTableInfo}
      onDropdownClose={clearTablePreview}
      onHidePreview={props.onHidePreview}
      onHoverPreview={onHoverPreview}
      onSelect={onSelectDataSource}
      tables={tables}
      loadingTables={loadingTables}
      loadedTables={loadedTables}
    />
  )
}

export default DataSourceSelector
