// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as LineChartActions from "charts/line/line-chart-action-creators"
import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"
import { deleteChart, duplicateChart } from "actions/charts-action-creators"
import exportChartData from "./export-chart-data"
import { updateChart } from "actions/update-chart-action-creator"
import { clearCrossFilters } from "vega/actions/filter-action-creators"
import { hasNonBoundingBoxNonGeoJoinFilter } from "vega/utils/filter"
import { navigateToChartEditor } from "actions/dashboard-action-creators"
import React, { useState } from "react"
import PropTypes from "prop-types"
import EditChartIcon from "./edit-chart-icon"

import ChartTitle from "components/chart-title/chart-title-parent"
import { connect } from "react-redux"
import cx from "classnames"
import Icon from "components/icon/icon"
import { Icon as GlyphIcon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import IconDataSource from "components/icon-data-source/icon-data-source"
import { contains, filter, identity } from "ramda"
import { backendCharts, CHART_TYPES, isVegaChart } from "constants/charts"
import {
  isRasterChart,
  isMultiLayer,
  isGeoTypeSupportedRasterChart,
  isLayerHidden
} from "charts/raster-chart/raster-utils"
import { ChartContainerHeaderDropdown } from "./chart-container-header-dropdown"
import ChartFiltersPopup from "components/chart-filters/chart-filters-popup"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import {
  pauseCrossFilter,
  isCrossFilterPaused,
  pauseMapMoveCrossFilter,
  isMapMoveCrossFilterPaused
} from "services/ConnectorWithQueue"
import {
  saveSnapshot,
  loadSnapshot
} from "components/migration/snapshots-action-creators"
import {
  duplicateAsOmniChart,
  upgradeToOmniChart,
  isUpgradableChart
} from "components/migration/migration-utility"
import IconLinkOff from "../svg-icons/icon-link-off"
import IconLink from "../svg-icons/icon-link"
import { showModal } from "actions/ui-action-creators"
import { redrawChart } from "actions/dc-action-creators"
import Services from "services/immerse"
import { CHART_EXPORT as CHART_EXPORT_MODAL } from "constants/modal-types"
import { defaultChartAddonAction } from "chart-addons/utils/default-chart-addon-action"

import {
  ImmerseUIRequired,
  IMMERSE_UI_ENTER_CHART_EDITOR,
  IMMERSE_UI_CHART_KEBAB
} from "services/immerse-ui-provider"
import { useImmerseUIContext } from "services/immerse-ui-provider/ImmerseUIContext"
import { updateDashboardSaveState } from "../../actions/dashboard-save-state-action-creators"
import useChartsCount from "hooks/useChartsCount"
import {
  getChartTypeAddons,
  getChartAddonOfType
} from "chart-addons/chart-addon-registry"
import { isUserExportDisabled } from "utils/user"

import "./styles.scss"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"

const {
  ENABLE_CHART_FILTER_VIEW,
  ENABLE_CHART_SNAPSHOTS,
  ENABLE_NEW_COMBO_CHART,
  ENABLE_LINKED_ZOOM,
  CROSSFILTER_PAUSE_CHART_BUTTON,
  CROSSFILTER_PAUSE_MAPMOVE_BUTTON,
  ENABLE_MAP_EXPORTS,
  ENABLE_TABLE_CHART_EXPORT,
  RASTER_CHART_KEBAB_VISIBILITY_TOGGLE,
  LIMIT_CHARTS_PER_DASHBOARD,
  ENABLE_CHART_ADDONS,
  HIDE_TEXT_CHART_HEADERS
} = available_feature_flags

// if BE Choropleth is filtered (polygon selection filter) in distributed,
// we can't export the filtered rows due to deterministic rowid in distributed
const isDistributedDataExportDisabled = (chartType, filters, hardwareInfo) =>
  chartType === "backendChoropleth" &&
  filters &&
  Boolean(filters.length) &&
  Array.isArray(hardwareInfo) &&
  hardwareInfo.length > 1 // more than one 'hardware info' result means we are connected to a distributed cluster

const shouldHideHeader = (type) =>
  getFeatureFlag(HIDE_TEXT_CHART_HEADERS) && ["text2", "text"].includes(type)

export function mapStateToProps(
  {
    charts,
    dashboard: { dataSources },
    omnifilters,
    snapshots = { chart: {} },
    connection: { hardwareInfo, roles },
    chartAddons = {}
  },
  { id, editId }
) {
  const {
    type,
    title,
    dataSource,
    layers,
    currentLayer,
    linkedZoomEnabled,
    dcFlag,
    filters
  } = charts[id]
  const layerSources = [
    ...new Set((layers || []).map((l) => l.dataSource))
  ].filter((s) => s)
  const isMultiSource = currentLayer === "master" && layerSources.length > 1
  let isFrontendChart = true
  if (contains(type, backendCharts)) {
    isFrontendChart = false
  }

  const typeSupportsServerSideExport = (chartType) =>
    isGeoTypeSupportedRasterChart(chartType) ||
    chartType === "pointmap" ||
    chartType === CHART_TYPES.BACKEND_SCATTER

  const allExportableLayersHidden =
    isRasterChart(type) &&
    layers?.every(
      (l) => isLayerHidden(l) || !typeSupportsServerSideExport(l.type)
    )

  const supportsServerSideExport =
    ((typeSupportsServerSideExport(type) &&
      getFeatureFlag(ENABLE_MAP_EXPORTS)) ||
      type === "table") &&
    (!layers || layers?.some(({ type: t }) => typeSupportsServerSideExport(t)))

  const chartAddon = chartAddons[charts[id].addon]

  return {
    chartAddon,
    dataSource: isMultiSource ? layerSources.join(", ") : dataSource,
    dataSourceAlias: isMultiSource
      ? "multi"
      : dataSource && dataSources[dataSource] && dataSources[dataSource].alias,
    isFrontendChart,
    // Vega integration - needed to toggle Vega-only menu items below
    vegaChart: isVegaChart(type),
    shouldShowSourceIcon: isMultiSource || Object.keys(dataSources).length > 1,
    shouldShowExportButton:
      type !== "text" &&
      type !== "text2" &&
      type !== CHART_TYPES.BOX_PLOT &&
      !(
        type === CHART_TYPES.TABLE && !getFeatureFlag(ENABLE_TABLE_CHART_EXPORT)
      ),
    type,
    layers,
    title,
    isEditMode: Boolean(editId.length && editId !== ""),
    shouldShowClearFilters:
      omnifilters.filter(
        (omnifilter) =>
          omnifilter.appliesTo === "CROSSFILTER" &&
          omnifilter.chartId === id &&
          hasNonBoundingBoxNonGeoJoinFilter(omnifilter) &&
          omnifilter.enabled
      ).length > 0,
    id,
    hasSnapshots: Boolean(snapshots.chart[id] && snapshots.chart[id].length),
    linkedZoomEnabled,
    dcFlag,
    disableDistributedDataExport: isDistributedDataExportDisabled(
      type,
      filters,
      hardwareInfo
    ),
    supportsServerSideExport,
    roles,
    allExportableLayersHidden
  }
}

export function mapDispatchToProps(dispatch, { id }) {
  return {
    actions: {
      handleEditChart() {
        dispatch(navigateToChartEditor(id))
      },
      handleDuplicateChart() {
        dispatch(duplicateChart(id))
      },
      handleExportChartData() {
        exportChartData(id)
      },
      showModal(param) {
        dispatch(showModal(param))
      },
      handleDeleteChart() {
        dispatch(deleteChart(id))
      },
      clearFilters() {
        dispatch(
          updateChart(id, {
            areFiltersInverse: false,
            filters: [],
            rangeFilter: []
          })
        )
        dispatch(updateDashboardSaveState())
      },
      clearCrossFilters() {
        dispatch(clearCrossFilters(id))
      },
      clearRasterChartFilters() {
        dispatch(RasterChartActions.clearRasterChartFilters(id, true))
      },
      clearLineChartFilters() {
        dispatch(LineChartActions.clearFilters(id))
      },
      saveSnapshot() {
        dispatch(saveSnapshot(id))
      },
      loadSnapshot() {
        dispatch(loadSnapshot(id))
      },
      duplicateAsOmniChart() {
        dispatch(duplicateAsOmniChart(id))
      },
      upgradeToOmniChart() {
        dispatch(upgradeToOmniChart(id))
      },
      handleToggleLinkedZoom(linkedZoomEnabled) {
        dispatch(RasterChartActions.toggleLinkedZoom(id, linkedZoomEnabled))
      },
      redrawChart(dcFlag, chartId) {
        const dcChart = Services.get("dc").getChart(dcFlag)
        dispatch(redrawChart(dcChart, chartId))
      },
      toggleRasterChartLayerVisibility(layerId) {
        dispatch(RasterChartActions.toggleRasterLayer(id, layerId))
        dispatch(RasterChartActions.combineRasterLayers(id, layerId))
      }
    }
  }
}

export function mergeProps(stateProps, dispatchProps, ownProps) {
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    actions: Object.assign({}, dispatchProps.actions, {
      clearFilters() {
        // this is so wrong. Fix it later.
        if (stateProps.vegaChart || stateProps.type === "gauge") {
          dispatchProps.actions.clearCrossFilters()
        } else if (isRasterChart(stateProps.type)) {
          dispatchProps.actions.clearRasterChartFilters()
        } else if (
          stateProps.type === "line" ||
          stateProps.type === "histogram"
        ) {
          dispatchProps.actions.clearLineChartFilters()
        } else {
          dispatchProps.actions.clearFilters()
        }
      }
    })
  }
}

ChartContainerHeader.propTypes = {
  actions: PropTypes.shape({
    clearFilters: PropTypes.func.isRequired,
    handleEditChart: PropTypes.func.isRequired,
    handleDeleteChart: PropTypes.func.isRequired
  }).isRequired,
  dataSource: PropTypes.string,
  dataSourceAlias: PropTypes.string,
  id: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  isFrontendChart: PropTypes.bool.isRequired,
  shouldShowClearFilters: PropTypes.bool.isRequired,
  shouldShowExportButton: PropTypes.bool.isRequired,
  shouldShowSourceIcon: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string,
  layers: PropTypes.array,
  linkedZoomEnabled: PropTypes.bool,
  disableDistributedDataExport: PropTypes.bool,
  supportsServerSideExport: PropTypes.bool,
  roles: PropTypes.arrayOf(PropTypes.string)
}

const CHART_ICON_WIDTH = 24 // pixels - must match .chart-button style

export function ChartContainerHeader({
  dataSource,
  dataSourceAlias,
  shouldShowClearFilters,
  isEditMode,
  id,
  shouldShowExportButton,
  shouldShowSourceIcon,
  actions,
  type,
  chartAddon,
  layers,
  isFrontendChart,
  hasSnapshots,
  linkedZoomEnabled,
  dcFlag,
  disableDistributedDataExport,
  supportsServerSideExport,
  restrictViewing,
  roles,
  dispatch,
  allExportableLayersHidden
}) {
  const [isPaused, setPaused] = useState(isCrossFilterPaused(id))
  const [isMapMovePaused, setMapMovePaused] = useState(
    isMapMoveCrossFilterPaused(id)
  )
  const chartsCount = useChartsCount()
  const chartsLimit = getFeatureFlag(LIMIT_CHARTS_PER_DASHBOARD)
  const joinDataSource = useJoinFromParameter(dataSource)
  const dataSourceDisplayName = joinDataSource
    ? joinDataSource.name
    : dataSource

  const showSourceIcon =
    shouldShowSourceIcon &&
    dataSourceAlias &&
    type !== "text" &&
    type !== "text2"
  const showLinkedZoomIcon =
    getFeatureFlag(ENABLE_LINKED_ZOOM) && isMultiLayer(type)
  let exportDataTitleString = "Download CSV"
  if (type === "text" || type === "text2") {
    exportDataTitleString = "Download HTML"
  } else if (supportsServerSideExport) {
    exportDataTitleString = "Export Data"
  }

  const dataSourceIcon = () => (
    <div key="dataSource" className={"chart-data-source"}>
      <div className="chart-data-source-tooltip">{dataSourceDisplayName}</div>
      <IconDataSource alias={dataSourceAlias} />
    </div>
  )

  const linkedZoomIcon = () => (
    <Tooltip
      content={
        linkedZoomEnabled
          ? "Disable zoom sync with other map charts"
          : "Sync map zoom with other map charts"
      }
      enterDelay={300}
    >
      <div
        key="linkedZoom"
        className={cx("chart-linked-zoom", {
          "linked-zoom-enabled": linkedZoomEnabled
        })}
        onClick={() => actions.handleToggleLinkedZoom(!linkedZoomEnabled)}
      >
        {linkedZoomEnabled ? <IconLink /> : <IconLinkOff />}
      </div>
    </Tooltip>
  )

  const clearFiltersIcon = () => (
    <Tooltip content="Clear chart filters" enterDelay={300}>
      <div
        key="clearFilters"
        className={"delete-chart-filters"}
        onClick={actions.clearFilters}
      >
        <Icon name="filter-x" />
      </div>
    </Tooltip>
  )

  const editChartIcon = () => (
    <ImmerseUIRequired key="editChart" uiKey={IMMERSE_UI_ENTER_CHART_EDITOR}>
      <Tooltip content="Edit chart" enterDelay={500}>
        <div
          className={"chart-button chart-settings-button"}
          data-testid="chart-settings-button"
          id={`chart-${id}-settings`}
          onClick={actions.handleEditChart}
        >
          <EditChartIcon />
        </div>
      </Tooltip>
    </ImmerseUIRequired>
  )

  // Raster chart data export modal
  const onHandleExportRasterChartData = () => {
    if (!disableDistributedDataExport && !allExportableLayersHidden) {
      actions.showModal({
        type: CHART_EXPORT_MODAL,
        content: id
      })
    } else {
      return
    }
  }

  const trimEmpty = filter(identity)

  const chartLeftControls = trimEmpty([
    showSourceIcon && dataSourceIcon(),
    shouldShowClearFilters && clearFiltersIcon(),
    showLinkedZoomIcon && linkedZoomIcon(),
    getFeatureFlag(ENABLE_CHART_FILTER_VIEW) && (
      <ChartFiltersPopup key="view-filters" chartId={id} />
    )
  ])

  const KebabControls = () => {
    const {
      immerseUIKeys: {
        IMMERSE_UI_DUPLICATE_CHART,
        IMMERSE_UI_DOWNLOAD_CSV,
        IMMERSE_UI_REMOVE_CHART
      }
    } = useImmerseUIContext()

    const isTrialModeEnabled = isUserExportDisabled(roles)

    const items = [
      {
        key: "chart-delete-button",
        icon: <GlyphIcon icon="cancel" size="small" />,
        title: "Remove Chart",
        onClick: actions.handleDeleteChart,
        visible: IMMERSE_UI_REMOVE_CHART
      },
      {
        key: "chart-duplicate-button",
        icon: <GlyphIcon icon="content_copy" size="small" />,
        title: "Duplicate Chart",
        ...(chartsLimit > 0 && chartsCount >= chartsLimit
          ? {
              disabled: true,
              tooltip: `Disabled because the administrative chart limit is currently set to ${chartsLimit}`
            }
          : {
              onClick: actions.handleDuplicateChart
            }),
        visible: IMMERSE_UI_DUPLICATE_CHART
      },
      {
        key: `chart-export-button`,
        icon: <GlyphIcon icon="file_download" size="small" />,
        title: exportDataTitleString,
        ...(allExportableLayersHidden
          ? {
              disabled: true,
              tooltip:
                "All exportable layers are currently hidden. To export a layer's data, ensure that layer is toggled to visible and that the current zoom level is within the layer's visible zoom level."
            }
          : {}),
        ...(disableDistributedDataExport
          ? {
              disabled: true,
              tooltip:
                "Filtered export is not currently supported in distributed mode."
            }
          : {}),
        onClick: supportsServerSideExport
          ? onHandleExportRasterChartData
          : actions.handleExportChartData,
        visible: supportsServerSideExport
          ? shouldShowExportButton && !isTrialModeEnabled
          : isFrontendChart &&
            shouldShowExportButton &&
            IMMERSE_UI_DOWNLOAD_CSV &&
            !isTrialModeEnabled
      },
      {
        key: "crossfilter-pause-button",
        icon: <GlyphIcon icon={isPaused ? "play_arrow" : "pause"} />,
        title: `${isPaused ? "Run" : "Pause"} receipt of crossfilters`,
        onClick: () => {
          const newPaused = !isPaused
          pauseCrossFilter(newPaused, id)
          setPaused(newPaused)
          actions.redrawChart(dcFlag, id)
        },
        visible: getFeatureFlag(CROSSFILTER_PAUSE_CHART_BUTTON)
      },
      {
        key: "crossfilter-pause-move-button",
        icon: <GlyphIcon icon={isMapMovePaused ? "play_arrow" : "pause"} />,
        materialIcon: isMapMovePaused ? "play_arrow" : "pause",
        title: `${isMapMovePaused ? "Run" : "Pause"} crossfilter on map move`,
        onClick: () => {
          const newPaused = !isMapMovePaused
          pauseMapMoveCrossFilter(newPaused, id)
          setMapMovePaused(newPaused)
          actions.redrawChart(dcFlag, id)
        },
        visible:
          getFeatureFlag(CROSSFILTER_PAUSE_MAPMOVE_BUTTON) &&
          isRasterChart(type)
      },
      {
        key: "save-snapshot-button",
        icon: <GlyphIcon icon="add_a_photo" />,
        title: "Save snapshot",
        onClick: actions.saveSnapshot,
        visible: getFeatureFlag(ENABLE_CHART_SNAPSHOTS) && !isTrialModeEnabled
      },
      {
        key: "load-snapshot-button",
        icon: <GlyphIcon icon="camera_roll" />,
        title: "Load snapshot",
        onClick: actions.loadSnapshot,
        visible:
          getFeatureFlag(ENABLE_CHART_SNAPSHOTS) &&
          hasSnapshots &&
          !isTrialModeEnabled
      },
      {
        key: "duplicate-and-migrate-chart-button",
        icon: <Icon name="chart-vega-combo" />,
        tooltip: "Duplicate as New Combo",
        title: (
          <div>
            Duplicate as <span className="new-button">New</span> Combo
          </div>
        ),
        onClick: actions.duplicateAsOmniChart,
        visible:
          getFeatureFlag(ENABLE_NEW_COMBO_CHART) && isUpgradableChart(type)
      },
      {
        key: "migrate-chart-button",
        icon: <Icon name="chart-vega-combo" />,
        tooltip: "Upgrade to New Combo",
        title: (
          <div>
            Upgrade to <span className="new-button">New</span> Combo
          </div>
        ),
        onClick: actions.upgradeToOmniChart,
        visible:
          getFeatureFlag(ENABLE_NEW_COMBO_CHART) && isUpgradableChart(type)
      }
    ]

    if (
      getFeatureFlag(RASTER_CHART_KEBAB_VISIBILITY_TOGGLE) &&
      isRasterChart(type) &&
      layers?.length > 1
    ) {
      items.unshift(
        ...layers.map(({ active, labelText }, layerId) => {
          const layerName = labelText?.length
            ? `${labelText}`
            : `Layer ${layerId + 1}`
          return {
            key: `toggle-raster-layer-visibility-${layerId}`,
            icon: (
              <GlyphIcon
                icon={active ? "visibility" : "visibility_off"}
                className="icon"
              />
            ),
            title: `${active ? "Hide" : "Show"} ${layerName}`,
            onClick: () => actions.toggleRasterChartLayerVisibility(layerId)
          }
        })
      )
    }

    if (getFeatureFlag(ENABLE_CHART_ADDONS)) {
      getChartTypeAddons(type).forEach((addon) => {
        const {
          label,
          icon,
          action = defaultChartAddonAction,
          userHasPermission
        } = getChartAddonOfType(addon)

        if (userHasPermission(roles)) {
          items.push({
            key: `addon-${addon}`,
            icon,
            tooltip: label,
            title: (
              <div
                style={{
                  fontWeight: addon === chartAddon?.type ? "bold" : undefined
                }}
              >
                {label}
              </div>
            ),
            onClick: () =>
              action({
                chartId: id,
                chartAddonType: addon,
                currentChartAddon: chartAddon?.type,
                dispatch
              })
          })
        }
      })
    }

    // If an add on does not specify visible property, it defaults to true
    const visibleItems = items.filter((item) => item.visible ?? true)
    if (visibleItems.length === 0) {
      return <></>
    }
    return (
      <ImmerseUIRequired uiKey={IMMERSE_UI_CHART_KEBAB} key="dropdown">
        <ChartContainerHeaderDropdown items={visibleItems} />
      </ImmerseUIRequired>
    )
  }

  const chartRightControls = trimEmpty([editChartIcon(), KebabControls()])

  const shadowStyle = (length) =>
    isEditMode ? null : { width: `${CHART_ICON_WIDTH * length}px` }

  const chartLeftShadowStyle = shadowStyle(chartLeftControls.length)
  const chartRightShadowStyle = shadowStyle(chartRightControls.length)

  return (
    <div
      className={cx("chart-container-header", `chart-type-${type}`, {
        showSourceIcon: "has-source-icon",
        hidden: shouldHideHeader(type) && !isEditMode
      })}
      data-testid="chart-container-header"
    >
      <ChartTitle
        {...{
          id,
          isEditMode,
          restrictViewing
        }}
      />
      <div className="chart-left-controls">{chartLeftControls}</div>
      {!restrictViewing && !isEditMode && (
        <div
          className="chart-right-controls"
          data-testid="chart-right-controls"
        >
          {chartRightControls}
        </div>
      )}
      <div className="chart-left-shadow" style={chartLeftShadowStyle} />
      <div className="chart-right-shadow" style={chartRightShadowStyle} />
    </div>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ChartContainerHeader)
