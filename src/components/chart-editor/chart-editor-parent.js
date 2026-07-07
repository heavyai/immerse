// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { categoricalColorFromChart } from "reducers/charts/helpers/color-helpers"
import { batch, connect } from "react-redux"
import { Redirect, withRouter } from "react-router-dom"
import PropTypes from "prop-types"
import {
  chartShape,
  selectorPillHoverShape,
  dimensionShape,
  measureShape
} from "constants/prop-types"

import { matchPath } from "react-router"
import { ROUTE_CHART_EDITOR } from "routes/paths"

import {
  applyChartEdits,
  cancelChartEdits,
  maybeRevertChartToOldState,
  setChartEditorToInitialState,
  saveDataSources,
  saveCurrentChart,
  saveChartsSnapshot
} from "actions/chart-editor-action-creators"
import {
  createChart,
  updateSagaChart,
  deleteChart
} from "actions/charts-action-creators"
import { addChart } from "actions/dashboard-layout-action-creators"
import {
  enterMultiSourceModeAndOpenFold,
  addMultiSourceAndOpenFold,
  deleteMultiSourceAndOpenPreviousFold
} from "actions/chart-editor-multisource-action-creators"
import { updateChartType } from "actions/update-chart-type-action-creators"
import { navigateToDashboard } from "actions/dashboard-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import { discardInactiveSelectors } from "actions/selector-action-creators"
import { setChartSpecificBinFilters } from "vega/actions/filter-action-creators-crossfilter-interop"
import * as RasterActions from "charts/raster-chart/raster-chart-actions"
import {
  MULTISOURCE_CHART_TYPES,
  isVegaChart,
  CHART_TYPES
} from "constants/charts"
import {
  vegaChartHasDataSource,
  vegaChartHasError,
  vegaChartSelectorsEmpty
} from "vega/utils/data-selection"

import { any, clone, concat, filter, isEmpty, isNil, values } from "ramda"
import { chartSupportsChartSpecificFilters } from "charts/utils/chart-type"
import { ChartEditor } from "./chart-editor"
import { CHART_TYPE_WINDBARB } from "charts/raster-chart/windbarb/constants"
import { isCrossSectionTerrainEnabled } from "charts/raster-chart/cross-section/hooks/use-cross-section-terrain-enabled"
import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"
import {
  clearLastPaletteMappingId,
  updatePaletteMapping
} from "components/shared-settings/palette-mapping-thunks"

const getRouteParams = ({ pathname }) => {
  const match = matchPath(pathname, { path: ROUTE_CHART_EDITOR }) || {
    params: {}
  }

  return match.params
}

const isSelectorValid = (selector) => Boolean(selector.value)

const hasActiveSelectors = (chart) => {
  const selectors = concat(chart.measures, chart.dimensions)
  return (
    chart.type === "text" ||
    chart.type === "text2" ||
    any(isSelectorValid, selectors)
  )
}

const isMultiLayer = (chart) => {
  const isCrossSectionAndEnabled =
    isCrossSectionType(chart.type) && isCrossSectionTerrainEnabled()
  const isMultiLayerType = [
    "geoheat",
    "pointmap",
    "backendChoropleth",
    "linemap",
    CHART_TYPES.CONTOUR,
    CHART_TYPE_WINDBARB
  ].includes(chart.type)
  return isMultiLayerType || isCrossSectionAndEnabled
}

const isMultiSourceChart = (chart) =>
  MULTISOURCE_CHART_TYPES.includes(chart.type)

const hasMultiSourceWithTable = (chart) =>
  Boolean(
    chart.multiSources &&
      values(filter(({ table }) => table, chart.multiSources)).length
  )

const normalizeSelectors = (selectors = []) =>
  selectors.map((selector, index) => ({
    ...selector,
    index,
    multiSourceIndex: isNil(selector.multiSourceIndex)
      ? 0
      : selector.multiSourceIndex
  }))

export function mapStateToProps(
  {
    dc: { render, redraw },
    charts,
    dashboard,
    connection,
    parameters,
    chartEditor: {
      savedCharts,
      savedFilters,
      savedDataSources,
      selectedMultiSourcePanel,
      tablePreviewName,
      editId: editorId,
      wasCancelled
    },
    ui: { selectorPillHover },
    sharedSettings
  },
  { tablePreview, location }
) {
  const params = getRouteParams(location)
  const { chartId: id } = params || {}
  const chart = charts[id] || {}
  const dimensions = normalizeSelectors(chart.dimensions)
  const measures = normalizeSelectors(chart.measures)
  const chartIsInMultiSourceMode = Object.keys(chart.multiSources || {}).length

  // Vega integration - This branches several properties that control whether
  // certain prompts should be shown in place of the chart, before a valid
  // data selection has been filled in and the chart can render correctly:
  // - Data source prompt (chart-editor-data-source-prompt.js)
  // --- This component displays before you select a table (data source)
  // --- It might be temporarily replaced with a table preview on hovering one
  // - 'Error message' or 'error display' (chart-editor-error-message.js)
  // --- This component shows the chart's data selection requirements
  // --- (dimensions and measures), which are still missing or invalid
  const vega = isVegaChart(chart.type)
  const hasDataSource = vega
    ? vegaChartHasDataSource(chart)
    : Boolean(chart.dataSource) || hasMultiSourceWithTable(chart)
  const shouldShowErrorDisplay = vega
    ? Boolean(
        !tablePreview &&
          charts[id] &&
          hasDataSource &&
          (vegaChartHasError(chart) || vegaChartSelectorsEmpty(chart))
      )
    : Boolean(
        (!tablePreview &&
          charts[id] &&
          hasDataSource &&
          (chart.hasError || chart.dataError || !hasActiveSelectors(chart))) ||
          render.error ||
          redraw.error
      )

  return {
    id,
    params,
    charts,
    chartEditor: {
      savedCharts,
      savedFilters,
      savedDataSources,
      selectedMultiSourcePanel,
      tablePreviewName,
      editId: editorId,
      wasCancelled
    },
    dashboard,
    connection,
    dimensions,
    measures,
    parameters,
    isMultiSourceEnabled: isMultiSourceChart(chart),
    isMultiLayeringEnabled: Boolean(connection.isMultiLayeringEnabled),
    chart,
    editorId,
    savedCharts,
    savedChart: savedCharts[id] || {},
    savedFilters: savedFilters[id] || [],
    savedDataSources,
    selectedMultiSourcePanel:
      !chartIsInMultiSourceMode && selectedMultiSourcePanel === 0
        ? null
        : selectedMultiSourcePanel,
    shouldShowAddNewDataSourceButton:
      isMultiSourceChart(chart) && hasDataSource,
    shouldShowDataSourcePrompt: Boolean(
      !tablePreview &&
        charts[id] &&
        !hasDataSource &&
        chart.type !== "text" &&
        chart.type !== CHART_TYPES.TEXT2
    ),
    shouldShowErrorDisplay,
    selectorPillHover,
    tablePreview: tablePreviewName,
    isPolyRasterEnabled: Boolean(connection.isPolyRasterEnabled),
    sharedSettings
  }
}

export function mapDispatchToProps(dispatch, props) {
  const params = getRouteParams(props.location)
  return {
    dispatch,
    applyChartEdits(id, chart) {
      dispatch(applyChartEdits(id, chart.type))
    },
    cancelChartEdits(id, chart) {
      dispatch(cancelChartEdits(id, chart.type))
    },
    updateChart(id, update) {
      dispatch(updateSagaChart(id, update))
    },
    updateChartType(id, type) {
      dispatch(updateChartType(id, type))
    },
    goToDashboard() {
      dispatch(navigateToDashboard())
    },
    maybeRevertChartToOldState(
      id,
      hasSaved,
      savedChart,
      chart,
      savedDataSources,
      dataSource,
      shouldResetChart,
      savedFilters,
      parametersSnapshot,
      savedCharts
    ) {
      dispatch(
        maybeRevertChartToOldState(
          id,
          hasSaved,
          savedChart,
          chart,
          savedDataSources,
          dataSource,
          shouldResetChart,
          savedFilters,
          parametersSnapshot,
          savedCharts
        )
      )
    },
    discardInactiveSelectors(id) {
      dispatch(discardInactiveSelectors(id))
    },
    savePaletteMappingChanges({ id: chartId, chart, sharedSettings }) {
      if ([CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(chart.type)) {
        // Save any unsaved palette mapping changes, and re-apply to layer
        chart.dataSelections.forEach((ds) => {
          let pmId = null
          let isMeasure = false
          const { layerId } = ds
          if (
            ds.measures.color?.lastPaletteMappingId &&
            !ds.measures.color?.paletteMappingId
          ) {
            pmId = ds.measures.color?.lastPaletteMappingId
            isMeasure = true
          } else if (
            ds.dimensions.color?.lastPaletteMappingId &&
            !ds.dimensions.color?.paletteMappingId
          ) {
            pmId = ds.dimensions.color?.lastPaletteMappingId
          } else if (ds.lastPaletteMappingId && !ds.paletteMappingId) {
            pmId = ds.lastPaletteMappingId
          }
          if (pmId) {
            const selectedPaletteMapping = sharedSettings.mappings.find(
              (pm) => pm.id === pmId
            )
            const color = categoricalColorFromChart(
              chart,
              selectedPaletteMapping,
              layerId,
              isMeasure
            )
            dispatch(
              updatePaletteMapping({
                chartId,
                layerId,
                pmId,
                color,
                isMeasure
              })
            )
            dispatch(clearLastPaletteMappingId(chartId, layerId, isMeasure))
          }
        })
      } else {
        // Do all the layers if they exist, then do the chart
        chart.layers?.forEach((layer, idx) => {
          // If we have a palette mapping id, don't do anything
          const pmId = layer.color?.lastPaletteMappingId
          if (pmId && !layer.color?.paletteMappingId) {
            const color = layer.color
            dispatch(
              updatePaletteMapping({
                chartId,
                layerId: idx,
                pmId,
                color
              })
            )
          }
        })
        const pmId = chart.color.lastPaletteMappingId
        if (!chart.color.paletteMappingId && pmId) {
          const color = categoricalColorFromChart(chart)
          dispatch(
            updatePaletteMapping({
              chartId,
              pmId,
              color
            })
          )
        }
        dispatch(clearLastPaletteMappingId(chartId))
      }
    },
    setChartEditorToInitialState() {
      dispatch(setChartEditorToInitialState())
    },
    updateDashboardSaveState(warnUnsaved = false) {
      dispatch(updateDashboardSaveState(warnUnsaved))
    },
    setChartSpecificBinFilters() {
      dispatch(setChartSpecificBinFilters(params.chartId))
    },
    showMaster(chartId, layerId) {
      dispatch(RasterActions.saveCurrentRasterLayer(chartId, layerId))
      dispatch(RasterActions.combineRasterLayers(chartId))
    },
    switchLayer(chartId, layerId, currentLayerId = 0) {
      dispatch(RasterActions.destroyRasterChartLegend(chartId)) // destroy raster chart legends when switching between layers
      dispatch(RasterActions.destroyRasterChart(chartId)) // destroy previous chart when switching between layers
      dispatch(RasterActions.saveCurrentRasterLayer(chartId, currentLayerId))
      dispatch(RasterActions.setRasterLayer(chartId, layerId))
    },
    setLayerLabel(chartId, currentLayerId = 0, labelText) {
      dispatch(
        RasterActions.setLayerLabel(chartId, currentLayerId, labelText.trim())
      )
    },
    saveCurrentLayer(chartId, currentLayerId = 0) {
      dispatch(RasterActions.saveCurrentRasterLayer(chartId, currentLayerId))
    },
    addLayer(chartId, currentLayerId = 0, chartType) {
      dispatch(RasterActions.saveCurrentRasterLayer(chartId, currentLayerId))
      // If it's a cross section chart, add a new terrain layer, otherwise
      // create a layer of the same type
      const newLayerType = isCrossSectionType(chartType)
        ? CHART_TYPES.CROSS_SECTION_TERRAIN
        : chartType
      dispatch(RasterActions.addNewRasterLayer(chartId, newLayerType))
    },
    deleteLayer(chartId, currentLayerId) {
      dispatch(
        RasterActions.deleteRasterLayer(
          chartId,
          currentLayerId,
          this.currentLayer
        )
      ) // currentLayerId is updated current layer whereas this.currentLayer is prev state currentLayer that helps to handle legend logic
    },
    onEnterMultiSourceMode() {
      dispatch(enterMultiSourceModeAndOpenFold(params.chartId))
    },
    onAddMultiSource() {
      dispatch(addMultiSourceAndOpenFold(params.chartId))
    },
    onDeleteMultiSource(multiSourceIndex) {
      dispatch(
        deleteMultiSourceAndOpenPreviousFold(params.chartId, multiSourceIndex)
      )
    },
    setEditorInitialState({
      charts,
      dashboard: { dataSources, loadState, currentDataSource },
      params: { chartId }
    }) {
      if (loadState.complete) {
        // Create an empty chart container
        if (!charts[chartId]) {
          batch(() => {
            dispatch(createChart(chartId, currentDataSource))
            dispatch(addChart(`${chartId}`))
          })
        }
        dispatch(
          saveDataSources({
            currentDataSource,
            dataSources: clone(dataSources)
          })
        )
        dispatch(saveCurrentChart(chartId, clone(charts[chartId])))

        dispatch(saveChartsSnapshot(charts))
      }
    },
    deleteChart(chartId) {
      dispatch(deleteChart(chartId))
    }
  }
}

export function mergeProps(stateProps, dispatchProps) {
  return {
    ...stateProps,
    ...dispatchProps,
    init: () => {
      dispatchProps.setEditorInitialState(stateProps)
    }
  }
}

const usePrevValues = (value, callback) => {
  const prevValues = useRef(value)

  useEffect(() => {
    callback(prevValues.current)
    return () => {
      prevValues.current = value
    }
  }, [value, callback])
}

export const chartEditorParentSaveChart = (props) => {
  props.updateDashboardSaveState(true)
  props.discardInactiveSelectors(props.id)
  if (
    isMultiLayer(props.chart) &&
    props.chart.layers &&
    props.chart.currentLayer !== "master"
  ) {
    props.saveCurrentLayer(props.id, props.chart.currentLayer)
    if (props.chart.layers.length > 1) {
      props.showMaster(props.id, props.chart.currentLayer)
    }
  }
  props.savePaletteMappingChanges(props)
  props.applyChartEdits(props.id, props.chart)
  props.goToDashboard()
}

export const ChartEditorParent = (props) => {
  const [hasSaved, setHasSaved] = useState(false)
  const [parametersSnapshot, setParametersSnapshot] = useState(null)

  const resetChartEditor = ({
    id,
    savedChart,
    chart,
    savedDataSources,
    dataSource,
    tablePreview,
    shouldShowErrorDisplay
  } = {}) => {
    const shouldResetChart =
      tablePreview ||
      props.tablePreview ||
      shouldShowErrorDisplay ||
      props.shouldShowErrorDisplay
    props.maybeRevertChartToOldState(
      id || props.id,
      hasSaved,
      savedChart || props.savedChart,
      chart || props.chart,
      savedDataSources || props.savedDataSources,
      dataSource || props.chart.dataSource,
      shouldResetChart,
      props.savedFilters,
      parametersSnapshot,
      props.savedCharts
    )
    props.setChartEditorToInitialState()
    setHasSaved(false)
    setParametersSnapshot(null)
  }

  const cancelEditing = () => {
    resetChartEditor()
    props.cancelChartEdits(props.id, props.chart)
    props.goToDashboard()
  }

  useEffect(() => {
    return () => {
      resetChartEditor()
    }
  }, []) // eslint-disable-line

  // this is a replacement for using componentDidUpdate with prevProps
  usePrevValues(
    useMemo(
      () => ({
        id: props.id,
        savedChart: props.savedChart,
        chart: props.chart,
        savedDataSources: props.savedDataSources,
        dataSource: props.dataSource,
        tablePreview: props.tablePreview,
        shouldShowErrorDisplay: props.shouldShowErrorDisplay
      }),
      [
        props.id,
        props.savedChart,
        props.chart,
        props.savedDataSources,
        props.dataSource,
        props.tablePreview,
        props.shouldShowErrorDisplay
      ]
    ),
    useCallback(
      (prevValues) => {
        const {
          params,
          charts,
          chartEditor: { wasCancelled },
          editorId
        } = props

        const inChartEditor = params?.chartId
        const transitionedEditorToDashboard = !inChartEditor && prevValues.id
        const lastChartEdited = charts[prevValues.id]
        const shouldDeleteEditedChart =
          transitionedEditorToDashboard &&
          !hasSaved &&
          lastChartEdited &&
          Object.keys(prevValues.savedChart).length === 0
        if (shouldDeleteEditedChart) {
          props.deleteChart(prevValues.id)
        }
        // `resetChartEditor` will be called by the cancel button, so don't call it twice
        if (transitionedEditorToDashboard && !wasCancelled) {
          resetChartEditor(prevValues)
        } else if (!params.chartId && editorId) {
          resetChartEditor()
        }
      },
      [props.params, props.charts, props.chartEditor, props.editorId, hasSaved] // eslint-disable-line
    )
  )

  const chartEditorDataReady = !isEmpty(props.chart) && props.editorId
  useEffect(() => {
    if (!chartEditorDataReady && props.params.chartId) {
      setParametersSnapshot(props.parameters)
      props.init()
    }
  }, [chartEditorDataReady, props.params.chartId]) // eslint-disable-line

  if (!chartEditorDataReady || !props.params.chartId) {
    return null
  }

  return props.dashboard.loadState.complete ? (
    <ChartEditor
      addLayer={props.addLayer}
      cancelEditing={cancelEditing}
      chart={props.chart}
      dimensions={props.dimensions}
      measures={props.measures}
      deleteLayer={props.deleteLayer}
      dispatch={props.dispatch}
      id={props.id}
      isMultiSourceEnabled={props.isMultiSourceEnabled}
      isMultiLayeringEnabled={props.isMultiLayeringEnabled}
      isPolyRasterEnabled={props.isPolyRasterEnabled}
      onAddMultiSource={props.onAddMultiSource}
      onDeleteMultiSource={props.onDeleteMultiSource}
      onEnterMultiSourceMode={props.onEnterMultiSourceMode}
      saveChart={() => {
        chartEditorParentSaveChart(props)
        setHasSaved(true)
        setParametersSnapshot(null)
      }}
      saveCurrentLayer={props.saveCurrentLayer}
      selectorPillHover={props.selectorPillHover}
      selectedMultiSourcePanel={props.selectedMultiSourcePanel}
      shouldShowAddNewDataSourceButton={props.shouldShowAddNewDataSourceButton}
      shouldShowDataSourcePrompt={props.shouldShowDataSourcePrompt}
      shouldShowErrorDisplay={props.shouldShowErrorDisplay}
      showMaster={props.showMaster}
      switchLayer={props.switchLayer}
      setLayerLabel={props.setLayerLabel}
      tablePreview={props.tablePreview}
      updateChart={props.updateChart}
      updateChartType={props.updateChartType}
      supportsChartSpecificFilters={chartSupportsChartSpecificFilters(
        props.chart
      )}
    />
  ) : (
    <Redirect
      to={`/${props.connection.sessionInfo.database}/dashboard${
        props.params.dashboardId ? "/${props.params.dashboardId}" : ""
      }`}
    />
  )
}

ChartEditorParent.propTypes = {
  addLayer: PropTypes.func,
  applyChartEdits: PropTypes.func.isRequired,
  cancelChartEdits: PropTypes.func.isRequired,
  chart: PropTypes.oneOfType([chartShape, PropTypes.object]).isRequired,
  deleteLayer: PropTypes.func.isRequired,
  setLayerLabel: PropTypes.func.isRequired,
  discardInactiveSelectors: PropTypes.func.isRequired,
  dimensions: PropTypes.arrayOf(dimensionShape).isRequired,
  measures: PropTypes.arrayOf(measureShape).isRequired,
  dispatch: PropTypes.func.isRequired,
  goToDashboard: PropTypes.func.isRequired,
  id: PropTypes.string,
  initPreview: PropTypes.string,
  isMultiSourceEnabled: PropTypes.bool.isRequired,
  isMultiLayeringEnabled: PropTypes.bool.isRequired,
  isPolyRasterEnabled: PropTypes.bool.isRequired,
  maybeRevertChartToOldState: PropTypes.func.isRequired,
  onAddMultiSource: PropTypes.func,
  onDeleteMultiSource: PropTypes.func,
  onDropdownClose: PropTypes.func,
  onEnterMultiSourceMode: PropTypes.func,
  onHidePreview: PropTypes.func,
  saveCurrentLayer: PropTypes.func,
  savedChart: PropTypes.oneOfType([chartShape, PropTypes.object]).isRequired,
  savedDataSources: PropTypes.object,
  selectorPillHover: selectorPillHoverShape.isRequired,
  selectedMultiSourcePanel: PropTypes.number,
  setChartEditorToInitialState: PropTypes.func.isRequired,
  shouldShowAddNewDataSourceButton: PropTypes.bool.isRequired,
  shouldShowDataSourcePrompt: PropTypes.bool.isRequired,
  shouldShowErrorDisplay: PropTypes.bool.isRequired,
  showMaster: PropTypes.func,
  switchLayer: PropTypes.func,
  tablePreview: PropTypes.string,
  updateChart: PropTypes.func.isRequired,
  updateChartType: PropTypes.func.isRequired,
  updateDashboardSaveState: PropTypes.func.isRequired,
  match: PropTypes.object,
  location: PropTypes.object.isRequired,
  editorId: PropTypes.string,
  params: PropTypes.object
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withRouter(ChartEditorParent))
