// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { chartShape, crossfilterShape } from "constants/prop-types"
import React, { Component } from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import { createSetter } from "utils/helpers"
import { isBERendered, isGeoChart } from "charts/raster-chart/raster-utils"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import ChartErrors from "components/chart-errors/chart-errors"
import MapDCChartAxisOverlay from "components/chart-axis-overlay"
import { ZoomToFiltersOverlay } from "components/zoom-to-filters-overlay/zoom-to-filters-overlay"
import { LayerDrawer } from "components/layer-drawer/layer-drawer"
import { CHART_TYPES } from "constants/charts"
import { updateSelectorAction } from "actions/selector-action-creators"
import { createLabelUpdate } from "charts/raster-chart/raster-chart-actions"
export const chartContainerTestId = "chartContainerTestId"

function chartContainerClassname(chartSpec = {}, quickFilterNotchVisible) {
  const chartSpecClassName = `chart-container chart-type-${chartSpec.type} ${
    (chartSpec.type === "pointmap" || chartSpec.type === "geoheat") &&
    chartSpec.basemap
      ? `basemap-${chartSpec.basemap.label.toLowerCase()}`
      : ""
  }`

  const beRendered =
    isBERendered(chartSpec.type) ||
    chartSpec.type === CHART_TYPES.BACKEND_CHOROPLETH

  return cx(chartSpecClassName, {
    "quick-filters-visible": quickFilterNotchVisible,
    "chart-type-be-rendered": beRendered
  })
}

// MEGA-HACK ALERT!!
// Sometimes (such as when coming back from the chart editor), the changes resulting
// from a route change and react-grid-layout update haven't yet had a chance to propagate,
// because we are still in the same React update cycle. This is covered over for most
// charts in Immerse today, because several old heavyai-charting focused actions fire that
// result in another eager update anyway, upon exiting the chart editor. However, for
// new Vega charts, this is not the case. So we add this defensive check here in the
// component itself
//
// After waiting a single tick for the call stack of this React update cycle to clear,
// we check the clientHeight and clientWidth of the grid item again. If it changed,
// we force another React update of this component, resulting in the chart being
// given the correct, updated size.
const getSize = (component) => {
  const { width, height } = component

  setTimeout(() => {
    if (!(component.width === width && component.height === height)) {
      component.forceUpdate()
    }
  }, 0)

  return { width, height }
}

export default class ChartContainer extends Component {
  static propTypes = {
    allChartsInitialized: PropTypes.bool.isRequired,
    areSelectorsEmpty: PropTypes.bool.isRequired,
    areSelectorsLoading: PropTypes.bool,
    ChartComponent: PropTypes.elementType,
    chartSpec: chartShape.isRequired,
    cid: PropTypes.string.isRequired,
    baseCrossfilter: crossfilterShape,
    crossfilter: crossfilterShape,
    dcFlag: PropTypes.number,
    dispatch: PropTypes.func.isRequired,
    errorType: PropTypes.string,
    hasError: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    requiredAttributes: PropTypes.bool.isRequired,
    updateChart: PropTypes.func.isRequired,
    dataError: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.errorType === "sort") {
      this.props.updateChart(this.props.cid, { sortColumn: null })
    }
  }

  createGridItemRef = (node) => {
    this.gridItem = node
    this.forceUpdate()
  }

  get shouldChartBeRendered() {
    return (
      this.props.ChartComponent &&
      !this.props.hasError &&
      !this.props.areSelectorsEmpty &&
      this.props.requiredAttributes &&
      this.gridItem &&
      this.gridItem.clientWidth > 0 &&
      this.gridItem.clientHeight > 0
    )
  }

  get height() {
    return Math.max(this.gridItem?.clientHeight, 0)
  }

  get width() {
    return this.gridItem ? this.gridItem.clientWidth : 0
  }

  shouldRenderChartAxisOverlay = () => {
    return [
      CHART_TYPES.SCATTER,
      CHART_TYPES.BACKEND_SCATTER,
      CHART_TYPES.HEAT
    ].includes(this.props.chart.type)
  }

  getAxisLabel = () => {
    switch (this.props.chart.type) {
      case CHART_TYPES.SCATTER:
        return {
          y:
            this.props.chart.measures[1].axisLabel ||
            this.props.chart.measures[1].label,
          x:
            this.props.chart.measures[0].axisLabel ||
            this.props.chart.measures[0].label
        }
      case CHART_TYPES.BACKEND_SCATTER:
        return {
          y:
            this.props.chart.measures[1].axisLabel ||
            this.props.chart.measures[1].label,
          x:
            this.props.chart.measures[0].axisLabel ||
            this.props.chart.measures[0].label
        }
      case CHART_TYPES.HEAT:
        return {
          y:
            this.props.chart.dimensions[1].axisLabel ||
            this.props.chart.dimensions[1].label,
          x:
            this.props.chart.dimensions[0].axisLabel ||
            this.props.chart.dimensions[0].label
        }
      default:
        return {
          y: "",
          x: ""
        }
    }
  }

  getUpdateAxisLabel = () => {
    switch (this.props.chart.type) {
      case CHART_TYPES.SCATTER:
        return {
          x: (value) =>
            this.props.dispatch(
              updateSelectorAction(
                this.props.cid,
                "measures",
                0,
                createSetter("axisLabel")(value)
              )
            ),
          y: (value) =>
            this.props.dispatch(
              updateSelectorAction(
                this.props.cid,
                "measures",
                1,
                createSetter("axisLabel")(value)
              )
            )
        }
      case CHART_TYPES.BACKEND_SCATTER:
        return {
          y: (value) =>
            this.props.dispatch(createLabelUpdate(this.props.cid, 1, value)),
          x: (value) =>
            this.props.dispatch(createLabelUpdate(this.props.cid, 0, value))
        }
      case CHART_TYPES.HEAT:
        return {
          x: (value) =>
            this.props.dispatch(
              updateSelectorAction(
                this.props.cid,
                "dimensions",
                0,
                createSetter("axisLabel")(value)
              )
            ),
          y: (value) =>
            this.props.dispatch(
              updateSelectorAction(
                this.props.cid,
                "dimensions",
                1,
                createSetter("axisLabel")(value)
              )
            )
        }
      default:
        return {
          y: "",
          x: ""
        }
    }
  }

  shouldShowRightContainer = () =>
    !this.props.isEditingChart &&
    this.props.chart?.layers &&
    isGeoChart(this.props.chart.type)
  shouldShowLayerDrawer = () => this.width >= 390

  render() {
    const { ChartComponent } = this.props
    const Addon = this.props.addon?.addonType?.component || (() => null)

    return (
      <div
        className={chartContainerClassname(
          this.props.chartSpec,
          this.props.quickFilterNotchVisible
        )}
        ref={this.createGridItemRef}
        data-testid={chartContainerTestId}
      >
        <div className="left-container">
          {this.shouldChartBeRendered &&
            this.shouldRenderChartAxisOverlay() && (
              <MapDCChartAxisOverlay
                chartId={this.props.cid}
                hasContinuousLegend={this.props.chart.measures.some(
                  (measure) =>
                    measure.name === "color" &&
                    measure.colorType === "quantitative"
                )}
                yAxisLabel={this.getAxisLabel().y}
                xAxisLabel={this.getAxisLabel().x}
                updateXAxisLabel={this.getUpdateAxisLabel().x}
                updateYAxisLabel={this.getUpdateAxisLabel().y}
              />
            )}

          {this.props.dataError &&
            !this.props.isEditingChart &&
            getFeatureFlag(available_feature_flags.CHART_LEVEL_ERRORS) && (
              <ChartErrors errorMessage={this.props.dataError} />
            )}

          {this.shouldChartBeRendered && (
            <ChartComponent
              allChartsInitialized={this.props.allChartsInitialized}
              chart={{
                ...this.props.chartSpec,
                shiftToZoom: getFeatureFlag(
                  available_feature_flags.UI_SHIFT_TO_ZOOM
                ),
                ...getSize(this)
              }}
              baseCrossfilter={this.props.baseCrossfilter}
              crossfilter={this.props.crossfilter}
              dcFlag={this.props.dcFlag}
              dispatch={this.props.dispatch}
              hasError={this.props.hasError}
              id={this.props.cid}
              dashboardId={this.props.dashboardId}
              tabId={this.props.tabId}
              parameterValues={this.props.parameterValues}
            />
          )}
          {this.shouldChartBeRendered && (
            <Addon
              chartId={this.props.cid}
              chartAddonId={this.props.addon?.id}
            />
          )}
        </div>
        {this.shouldShowRightContainer() && (
          <div className="right-container">
            <ZoomToFiltersOverlay chartId={this.props.cid} />
            {this.shouldShowLayerDrawer() && (
              <LayerDrawer
                chartId={this.props.cid}
                dcFlag={this.props.chart.dcFlag}
                layers={this.props.chart.layers}
                containerWidth={this.width}
              />
            )}
          </div>
        )}
      </div>
    )
  }
}
