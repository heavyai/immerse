// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createGeoHeatChart,
  destroyGeoHeatChart,
  updateGeoHeatChart,
  applyNewPropsToExistingChart
} from "./geoheat-actions"
import { equals, not } from "ramda"
import React, { Component } from "react"
import cx from "classnames"
import PropTypes from "prop-types"
import { chartSpecShape } from "constants/prop-types"
import { removeLayerAdapterDimensionMappingHandler } from "./raster-utils"
import {
  circleFeatureIsDisabled,
  lassoFeatureIsDisabled,
  polylineFeatureIsDisabled
} from "charts/utils/disable-map-controls"
import { setHideOtherForOldChart } from "./raster-chart-actions"
import { updateChart } from "actions/update-chart-action-creator"

import "./raster.scss"

function isSelectorLoading({ measures, dimensions }) {
  return (
    measures.some((measure) => measure.loading) ||
    dimensions.some((dimension) => dimension.loading)
  )
}

const createRasterComponent = () =>
  class RasterChartComponent extends Component {
    static propTypes = {
      chart: chartSpecShape.isRequired,
      dispatch: PropTypes.func.isRequired,
      hasError: PropTypes.bool.isRequired,
      id: PropTypes.string.isRequired
    }

    componentDidMount() {
      if (!this.props.hasError && !isSelectorLoading(this.props.chart)) {
        // backward compatibility to support dynamically hide/show All Other on existing raster charts
        this.props.dispatch(
          setHideOtherForOldChart(this.props.id, this.props.chart)
        )
        this.props.dispatch(
          applyNewPropsToExistingChart(this.props.id, this.props.chart)
        )

        this.props.dispatch(
          updateChart(this.props.id, {
            height: this.props.chart.height,
            width: this.props.width
          })
        )

        this.props.dispatch(createGeoHeatChart(this.props.id, this.props.chart))
      }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
      if (
        (nextProps.chart.type !== "backendScatter" &&
          nextProps.chart.currentLayer !== "master" &&
          this.props.chart.currentLayer !== nextProps.chart.currentLayer) ||
        (nextProps.chart.currentLayer === "master" &&
          nextProps.chart.dcFlag === null) ||
        // case for more than 2 layers, and deleting the 2nd layer while on 2nd layer
        (this.props.chart.currentLayer === nextProps.chart.currentLayer &&
          nextProps.chart.layers &&
          this.props.chart.layers &&
          this.props.chart.layers.length !== nextProps.chart.layers.length &&
          not(
            equals(
              this.props.chart.layers[this.props.chart.currentLayer],
              nextProps.chart.layers[nextProps.chart.currentLayer]
            )
          ))
      ) {
        this.props.dispatch(
          createGeoHeatChart(
            this.props.id,
            nextProps.chart,
            nextProps.dashboardId,
            nextProps.tabId
          )
        )
      } else if (
        this.props.chart.layers &&
        not(
          equals(
            this.props.chart.layers[this.props.chart.currentLayer],
            nextProps.chart.layers[nextProps.chart.currentLayer]
          )
        )
      ) {
        this.props.dispatch(updateGeoHeatChart(this.props.id, nextProps.chart))
      }

      if (
        (this.props.chart.width !== nextProps.chart.width ||
          this.props.chart.height !== nextProps.chart.height) &&
        nextProps.chart.width !== 0 &&
        nextProps.chart.height !== 0
      ) {
        this.props.dispatch(
          updateGeoHeatChart(this.props.id, {
            width: nextProps.chart.width,
            height: nextProps.chart.height
          })
        )
      }
    }

    shouldComponentUpdate() {
      return false
    }

    componentWillUnmount() {
      this.props.dispatch(destroyGeoHeatChart(this.props.id))
      if (this.props.chart.layers) {
        this.props.chart.layers.forEach((layer) => {
          const { dataSource, type, measures, dimensions } = layer
          removeLayerAdapterDimensionMappingHandler(
            this.props.id,
            dataSource,
            type,
            measures,
            dimensions
          )
        })
      } else {
        const { dataSource, type, measures, dimensions } = this.props.chart
        removeLayerAdapterDimensionMappingHandler(
          this.props.id,
          dataSource,
          type,
          measures,
          dimensions
        )
      }
    }

    render() {
      return (
        <div
          className={cx({
            "disable-circle": circleFeatureIsDisabled(),
            "disable-lasso": lassoFeatureIsDisabled(),
            "disable-polyline": polylineFeatureIsDisabled()
          })}
          id={`chart${this.props.id}`}
        />
      )
    }
  }

export const GeoHeatChartComponent = createRasterComponent()
export const PointmapChartComponent = createRasterComponent()
export const LinemapChartComponent = createRasterComponent()
export const RasterScatterChartComponent = createRasterComponent()
export const ChoroplethChartComponent = createRasterComponent()
export const ContourChartComponent = createRasterComponent()
export const CrossSectionChartComponent = createRasterComponent()
