// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SizeMe } from "react-sizeme"
import {
  addPointMapEventListeners,
  removePointMapEventListeners
} from "actions/dc-action-creators"
import {
  calculateGridStates,
  findInsertionSpot,
  pxToGridUnits,
  getChartMinHeight,
  getChartMinWidth
} from "./dashboard-helpers"
import {
  dashboardSpecShape,
  reactGridLayoutShape,
  chartShape
} from "constants/prop-types"
import React, { Component } from "react"
import PropTypes from "prop-types"
import ReactGridLayout from "react-grid-layout"
import { addDashboardTab } from "actions/dashboard-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import { updateLayout } from "actions/dashboard-layout-action-creators"
import ChartContainerHeader from "components/chart-container-header/chart-container-header"
import ChartContainerPanel from "components/chart-container-panel/chart-container-panel"
import { createNewChartAfterMax } from "actions/create-new-chart-action-creators"
import cx from "classnames"
import DashboardTopPanelParent from "components/dashboard-top-panel/dashboard-top-panel-parent"
import { debounce } from "lodash"
import { newChartIndex } from "utils/add-chart-helpers"
import { RESIZE_DEBOUNCE_MS } from "constants/magic-variables"
import { isMultiLayer } from "components/chart-editor/chart-editor"
import { Route } from "react-router-dom"
import ChartEditorParent from "components/chart-editor/chart-editor-parent"

import DashboardConfigPanel from "components/dashboard-config-panel"
import MigrationRibbon from "components/migration/migration-ribbon"
import QuickFilterNotch from "components/quick-filters/quick-filter"
import Tabs from "components/tabs/Tabs"
import {
  ImmerseUIRequired,
  IMMERSE_UI_ADD_CHART
} from "services/immerse-ui-provider"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import {
  getQuickFiltersForChart,
  isQuickFilterVisibleOnDashboard
} from "components/quick-filters/quick-filter-utils"

import { DEFAULT_DATABASE_STYLES } from "components/ui-config-panel/constants"

import {
  NUM_COLS,
  OFFSET,
  NUM_VISIBLE_ROWS,
  DASHBOARD_CONFIG_HANDLE_WIDTH_PLUS_PADDING,
  PARAMETER_WIDGET_DIMENSIONS_IN_PX,
  PARAMETER_CONTAINER
} from "components/dashboard/dashboard-grid-constants"
import DashboardParameterWidget from "../parameter-widget/DashboardParameterWidget"

const {
  DASHBOARD_TABS,
  DUMP_CHART_JSON,
  DEFAULT_SIMPLE_FILTERS,
  HIDE_CHARTS_CONTAINERS
} = available_feature_flags

import { ImmerseUIContext } from "services/immerse-ui-provider/ImmerseUIContext"

function layoutUnchanged(oldItem, newLayout) {
  const targetKeys = Object.keys(oldItem)
  const newItem = newLayout.find((newDataGrid) => oldItem.i === newDataGrid.i)
  let unchanged = true

  if (newItem) {
    targetKeys.forEach((key) => {
      if (newItem[key] !== oldItem[key]) {
        unchanged = false
      }
    })
  } else {
    unchanged = false
  }
  return unchanged
}

const shouldHideBorder = (type) =>
  getFeatureFlag(HIDE_CHARTS_CONTAINERS) &&
  ["text2", "text", "number"].includes(type)

/**
 * Row height and col width change when the window is resized, which means that
 * our layout--which is in grid units--needs to be recalculated if it has any dimensions
 * that need to maintain an absolute size in pixels.
 * @param type
 * @param colWidth
 * @param rowHeight
 * @return {{minH: *, minW: *}|{minH: *, minW: *, maxH: *}}
 */
function getMinWidthHeight(type, colWidth, rowHeight) {
  if (type === PARAMETER_CONTAINER) {
    const minH = pxToGridUnits(
      PARAMETER_WIDGET_DIMENSIONS_IN_PX.minH,
      rowHeight
    )
    const maxH = pxToGridUnits(
      PARAMETER_WIDGET_DIMENSIONS_IN_PX.maxH,
      rowHeight
    )
    return {
      minH,
      maxH,
      minW: pxToGridUnits(PARAMETER_WIDGET_DIMENSIONS_IN_PX.minW, colWidth)
    }
  }

  return {
    minW: getChartMinWidth(type, colWidth),
    minH: getChartMinHeight(type, rowHeight)
  }
}

class Dashboard extends Component {
  static propTypes = {
    charts: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.shape(chartShape)),
      PropTypes.object
    ]),
    chartContainers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        containerType: PropTypes.string
      })
    ).isRequired,
    parameterContainers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        containerType: PARAMETER_CONTAINER
      })
    ).isRequired,
    children: PropTypes.element,
    dashboardId: PropTypes.number,
    dashboardSpec: dashboardSpecShape.isRequired,
    dispatch: PropTypes.func.isRequired,
    annotationsEditMode: PropTypes.bool,
    editId: PropTypes.string.isRequired,
    editing: PropTypes.bool.isRequired,
    isConnected: PropTypes.bool.isRequired,
    layout: PropTypes.arrayOf(reactGridLayoutShape).isRequired,
    pathname: PropTypes.string,
    useCSSTransforms: PropTypes.bool.isRequired,
    isDashboardLoaded: PropTypes.bool.isRequired,
    isDashboardSaved: PropTypes.bool.isRequired,
    isPolyRasterEnabled: PropTypes.bool.isRequired,
    isMultiLayeringEnabled: PropTypes.bool.isRequired,
    params: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    filters: PropTypes.object,
    showFilterPanelByDefault: PropTypes.bool.isRequired,
    dashboardGridMargin: PropTypes.number.isRequired
  }

  static defaultProps = {
    dashboardGridMargin: DEFAULT_DATABASE_STYLES.chart.dashboardGridMargin
  }

  constructor(props) {
    super(props)

    this.dashboardContainerRef = React.createRef()
  }

  state = Object.assign(
    {},
    {
      prevPathname: "",
      showAdvancedFilterControls: !getFeatureFlag(DEFAULT_SIMPLE_FILTERS),
      dashboardConfigPanelOpen: this.props.showFilterPanelByDefault
    },
    calculateGridStates(
      window.innerHeight,
      window.innerWidth,
      NUM_COLS,
      OFFSET,
      NUM_VISIBLE_ROWS
    )
  )

  componentDidMount() {
    // Recalculate on load, in case the layout was saved at a different resolution
    this.recalculateGridLayout()
    window.onresize = this.debouncedRecalculateGridLayout
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const fromEditing = !nextProps.editing && this.props.editing
    const toEditing = nextProps.editing && !this.props.editing
    const toEditingExistingChart =
      toEditing && this.props.charts[nextProps.editId]

    if (fromEditing) {
      this.props.dispatch(addPointMapEventListeners(this.props.editId))
    }

    if (toEditingExistingChart) {
      this.props.dispatch(removePointMapEventListeners(nextProps.editId))
    }

    if (nextProps.pathname !== this.props.pathname) {
      this.setState({
        prevPathname: this.props.pathname
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.configPanelWidth !== this.props.configPanelWidth) {
      this.debouncedRecalculateGridLayout()
    }
  }

  componentWillUnmount() {
    window.onresize = null
  }

  chartRefs = {}

  recalculateGridLayout = () => {
    const newState = calculateGridStates(
      window.innerHeight,
      this.gridWidth ?? window.innerWidth,
      NUM_COLS,
      OFFSET,
      NUM_VISIBLE_ROWS
    )

    const allContainers = [
      ...this.props.chartContainers,
      ...this.props.parameterContainers
    ]

    this.setState(newState, () => {
      this.props.dispatch(
        updateLayout(
          this.props.layout.map((dataGrid) => {
            const layoutItem = allContainers.find(
              (container) => container.id === dataGrid.i
            )

            const { minW, minH, maxH } = getMinWidthHeight(
              layoutItem?.containerType,
              this.state.colWidth,
              this.state.rowHeight
            )
            return Object.assign({}, dataGrid, {
              w: dataGrid.w,
              h: dataGrid.h < minH || dataGrid.h > maxH ? minH : dataGrid.h,
              minW,
              minH,
              maxH
            })
          })
        )
      )
    })
  }

  debouncedRecalculateGridLayout = debounce(() => {
    this.recalculateGridLayout()
  }, RESIZE_DEBOUNCE_MS)

  onResizeStop = (layout, item) => {
    if (!this.props.layout.length && !Object.keys(this.chartRefs).length) {
      return
    }

    const allContainers = [
      ...this.props.chartContainers,
      ...this.props.parameterContainers
    ]

    const { containerType } = allContainers.find(
      (container) => item.i === container.id
    )

    const { minW, minH, maxH } = getMinWidthHeight(
      containerType,
      this.state.colWidth,
      this.state.rowHeight
    )

    const layoutIndex = layout.findIndex((dataGrid) => dataGrid.i === item.i)
    const newLayout = [...layout]
    newLayout[layoutIndex] = {
      ...layout[layoutIndex],
      minW: layout.minW === undefined ? minW : layout.minW,
      minH: layout.minH === undefined ? minH : layout.minH,
      maxH: layout.maxH === undefined ? maxH : layout.maxH
    }

    this.props.dispatch(updateLayout(newLayout))
  }

  /**
   * Returns a layout object for a given dashboard item. If the item already
   * has a layout stored, returns that object. Otherwise, inserts item into the
   * existing layout.
   * @param id Key to store on layout object
   */
  generateDataGrid = (id) => {
    const { layout, charts } = this.props
    const { rowHeight, colWidth } = this.state
    const chartType = charts[id]?.type

    return (
      layout.find((l) => l.i === id) ||
      findInsertionSpot(layout, NUM_COLS, rowHeight, colWidth, id, chartType)
    )
  }

  onLayoutChange = (layout) => {
    const oldLayout = this.props.layout

    const layoutChanged = oldLayout.some(
      (dataGrid) => !layoutUnchanged(dataGrid, layout)
    )

    if (layoutChanged) {
      this.props.dispatch(updateDashboardSaveState(true))
    }

    this.props.dispatch(updateLayout(layout.map((l) => Object.assign({}, l))))
  }

  addNewChart = () => {
    // This is for the large grey CTA button that appears on the dashboard itself when there are no
    // charts - it is *not* used by the colored Add Chart button on the dashboard toolbar. See
    // src/components/dashboard-top-panel/dashboard-top-panel-parent.js#145 for that
    const nextIndex = newChartIndex(this.props.chartContainers)
    this.props.dispatch(createNewChartAfterMax(nextIndex))
  }

  addChartRef = (id) => (node) => {
    this.chartRefs[id] = node
  }

  toggleAdvancedFilterControls = (showAdvancedFilterControls = undefined) => {
    this.setState({
      showAdvancedFilterControls:
        typeof showAdvancedFilterControls === "boolean"
          ? showAdvancedFilterControls
          : !this.state.showAdvancedFilterControls
    })
  }

  visibleQuickFiltersForChart = (chartId) =>
    getQuickFiltersForChart(
      this.props.omnifilters,
      this.props.charts,
      chartId,
      this.props.dataSources
    ).filter((f) => {
      // show all quick filters in chart editor
      if (this.props.editId && this.props.editId.length) {
        return true
      }
      // otherwise show only visible filters
      return isQuickFilterVisibleOnDashboard(f)
    })

  setDashboardConfigPanelOpen = (open) => {
    this.setState({
      dashboardConfigPanelOpen: open
    })
    // kick layout so it resizes
    this.recalculateGridLayout()
  }

  addTab = () => {
    this.props.dispatch(addDashboardTab())
  }

  render() {
    const {
      charts = {},
      dashboardId,
      editId,
      isPolyRasterEnabled,
      isMultiLayeringEnabled,
      params,
      match,
      location,
      dashboardGridMargin,
      annotationsEditMode,
      restrictViewing,
      editing,
      layout,
      useCSSTransforms,
      chartContainers,
      parameterContainers,
      dispatch
    } = this.props

    const {
      prevPathname,
      showAdvancedFilterControls,
      dashboardConfigPanelOpen: isOpen
    } = this.state

    const inChartEditor = this.props.editing || params.chartId
    const editingChart = charts[editId] || {}
    const layersEnabled =
      isMultiLayeringEnabled && isMultiLayer(editingChart, isPolyRasterEnabled)

    // Padding around the edge of the grid (not between items). This is
    // configurable by the user in the UI config panel. Each grid item / chart has their
    // padding set to 50% of the pixel value set in the UI config panel (so, if
    // they set the dashboard grid margin to 10px, a chart would have a
    // `padding: 5px` style). This takes care of the padding between charts, but
    // means the padding around the outside of the charts is half the necessary
    // width. So this adds that width around the outside of the charts
    const dashboardGridPaddingVertical = dashboardGridMargin / 2
    // And, we want the minimum horizontal padding to equal at least the width
    // of the filter panel / UI config handles
    const dashboardGridPaddingHorizontal = Math.max(
      DASHBOARD_CONFIG_HANDLE_WIDTH_PLUS_PADDING,
      dashboardGridMargin / 2
    )

    return (
      <div
        className={cx(
          "dashboard-container",
          annotationsEditMode && "annotations-edit-mode"
        )}
        id="dashboard-container"
        ref={this.dashboardContainerRef}
        onScroll={this.onScroll}
        data-dashboard-loaded={this.props.isDashboardLoaded}
        data-dashboard-saved={this.props.isDashboardSaved}
      >
        {!inChartEditor && (
          <>
            <DashboardTopPanelParent
              {...{
                id: "top-panel",
                prevPath: prevPathname,
                location,
                showAdvancedFilterControls,
                restrictViewing
              }}
            />
            {getFeatureFlag(DUMP_CHART_JSON) && <MigrationRibbon />}
          </>
        )}
        <div
          className={cx({
            "dashboard-grid-container": !inChartEditor,
            "chart-editor-grid-container": inChartEditor
          })}
        >
          <DashboardConfigPanel
            {...{
              isOpen,
              setOpen: this.setDashboardConfigPanelOpen,
              isInChartEditor: inChartEditor,
              showAdvancedFilterControls,
              toggleAdvancedFilterControls: this.toggleAdvancedFilterControls
            }}
          />
          {!chartContainers.length && !parameterContainers.length && !editId && (
            <ImmerseUIRequired uiKey={IMMERSE_UI_ADD_CHART}>
              <button
                className="button add-chart-cta"
                onClick={this.addNewChart}
              >
                <span className="add-chart-cta-plus">{"+"}</span>
                <span className="add-chart-cta-text">{"Add Chart"}</span>
              </button>
            </ImmerseUIRequired>
          )}
          <ImmerseUIContext.Consumer>
            {({
              immerseUIKeys: { IMMERSE_UI_CHART_RESIZE, IMMERSE_UI_CHART_MOVE }
            }) => (
              <SizeMe>
                {({ size }) => {
                  if (this.gridWidth !== size.width) {
                    this.gridWidth = size.width
                    this.recalculateGridLayout()
                  }
                  return (
                    // Let SizeMe measure the wrapper before ReactGridLayout renders,
                    // since map charts don't handle this initial grid resize well
                    <div className="grid-layout-wrapper">
                      {size.width && (
                        <ReactGridLayout
                          {...{
                            measureBeforeMount: true,
                            className: cx("dashboard", {
                              "chart-edit-mode": editing,
                              "layer-tabs-enabled": layersEnabled
                            }),
                            cols: NUM_COLS,
                            draggableHandle: ".draggable-container-handle",
                            layout,
                            margin: [0, 0],
                            containerPadding: [
                              dashboardGridPaddingHorizontal,
                              dashboardGridPaddingVertical
                            ],
                            onLayoutChange: this.onLayoutChange,
                            onResizeStop: this.onResizeStop,
                            rowHeight: this.state.rowHeight,
                            useCSSTransforms,
                            width: size.width,
                            isDraggable:
                              !restrictViewing &&
                              !editId &&
                              IMMERSE_UI_CHART_MOVE,
                            isResizable:
                              !restrictViewing && IMMERSE_UI_CHART_RESIZE
                          }}
                        >
                          {parameterContainers.map((widget) => (
                            <div
                              key={widget.id}
                              data-grid={layout.find((l) => l.i === widget.id)}
                              className={cx({ invisible: this.props.editId })}
                            >
                              <DashboardParameterWidget
                                widgetId={widget.id}
                                parameter={widget}
                                hideMenu
                                showRemoveIcon
                                renderPopoversToPortal
                              />
                            </div>
                          ))}
                          {this.props.chartContainers.map(
                            ({ id, containerType }) => {
                              const quickFiltersForChart = this.visibleQuickFiltersForChart(
                                id
                              )
                              return (
                                <div
                                  className={cx({
                                    "chart-centered":
                                      this.props.editId &&
                                      this.props.editId === id,
                                    invisible:
                                      this.props.editId &&
                                      this.props.editId !== id,
                                    "no-resize": restrictViewing
                                  })}
                                  data-grid={this.generateDataGrid(id)}
                                  key={id}
                                  ref={this.addChartRef(id)}
                                >
                                  <div
                                    id={`chart${id}-wrapper`}
                                    data-testid={`chart${id}-wrapper`}
                                    className={cx("mapd-chart-wrapper", {
                                      "mapd-chart-wrapper-highlighted":
                                        charts[id].highlighted,
                                      "no-border": shouldHideBorder(
                                        containerType
                                      )
                                    })}
                                  >
                                    <ChartContainerHeader
                                      {...{
                                        chartContainers,
                                        dispatch,
                                        editId,
                                        id,
                                        dashboardId,
                                        restrictViewing
                                      }}
                                    />
                                    <QuickFilterNotch
                                      chartId={id}
                                      editMode={Boolean(editId.length)}
                                      quickFiltersForChart={
                                        quickFiltersForChart
                                      }
                                    />
                                    <ChartContainerPanel
                                      chartType={containerType}
                                      id={id}
                                      quickFilterNotchVisible={
                                        quickFiltersForChart.length &&
                                        charts[id].quickFiltersExpanded
                                      }
                                      chart={charts[id]}
                                    />
                                  </div>
                                </div>
                              )
                            }
                          )}
                        </ReactGridLayout>
                      )}
                    </div>
                  )
                }}
              </SizeMe>
            )}
          </ImmerseUIContext.Consumer>
        </div>
        {getFeatureFlag(DASHBOARD_TABS) && !inChartEditor && (
          <Tabs {...{ restrictViewing }} />
        )}
        <Route
          {...{
            path: `${match.url}/chart/:chartId/edit`,
            children: (props) => <ChartEditorParent {...props} />
          }}
        />
      </div>
    )
  }
}

export default Dashboard
