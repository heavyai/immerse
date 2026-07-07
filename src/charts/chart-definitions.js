// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { registerChart } from "charts/chart-registration"

import iFrameChartDefinition from "charts/iframe/definition"
import TableChartDefinition from "charts/table/definition"
import TextChartDefinition from "charts/text/definition"
import Text2ChartDefinition from "charts/text2/definition"
import PieChartDefinition from "charts/pie/definition"
import NumberChartDefinition from "charts/number/definition"
import HeatChartDefinition from "charts/heat/definition"
import RowChartDefinition from "charts/row/definition"
import BubbleChartDefinition from "charts/bubble/definition"
import PointMapDefinition from "charts/raster-chart/point/definition"
import LineMapDefinition from "charts/raster-chart/line-map/definition"
import BackendChoroplethDefinition from "charts/raster-chart/backend-choropleth/definition"
import GeoHeatChartDefinition from "charts/raster-chart/geoheat/definition"
import BackendScatterChartDefinition from "charts/raster-chart/backend-scatter/definition"
import CrossSectionChartDefinition from "charts/raster-chart/cross-section/definition"
import CrossSectionTerrainChartDefinition from "charts/raster-chart/cross-section/terrain-definition"
import StackedBarChartDefinition from "charts/bar-chart/definition"
import HistogramChartDefinition from "charts/histogram/definition"
import OldComboChartDefinition from "charts/combo/definition"
import CountChartDefinition from "charts/count/definition"
import NewComboChartDefinition from "charts/vega-combo/definition"
import DeckGLChartDefinition from "charts/deckgl/definition"
import DeckGLPointmapDefinition from "charts/deckgl/pointmap-definition"
import DeckGLLinemapDefinition from "charts/deckgl/linemap-definition"
import DeckGLChoroplethDefinition from "charts/deckgl/choropleth-definition"
import FEChoroplethDefinition from "charts/fe-choropleth/definition"
import LineChartDefinition from "charts/line/definition"
import GaugeChartDefinition from "charts/gauge/definition"
import SkewTChartDefinition from "charts/skewt/definition"
import WindbarbDefinition from "charts/raster-chart/windbarb/definition"
import ContourChartDefinition from "charts/raster-chart/contour/definition"
import BoxPlotChartDefinition from "./box-plot/definition"

let chartsAreDefined = false

function registerCharts() {
  if (chartsAreDefined) {
    return
  }

  // the order that the charts are added here is the order that they will
  // display in the chart type ribbon.
  registerChart(TableChartDefinition)
  registerChart(TextChartDefinition)
  registerChart(Text2ChartDefinition)
  registerChart(NumberChartDefinition)
  registerChart(GaugeChartDefinition)
  registerChart(SkewTChartDefinition)
  registerChart(NewComboChartDefinition)
  registerChart(StackedBarChartDefinition)
  registerChart(RowChartDefinition)
  registerChart(PieChartDefinition)
  registerChart(BubbleChartDefinition)
  registerChart(BackendScatterChartDefinition)
  registerChart(BoxPlotChartDefinition)
  registerChart(HeatChartDefinition)
  registerChart(HistogramChartDefinition)
  registerChart(OldComboChartDefinition)
  registerChart(CrossSectionChartDefinition)
  registerChart(CrossSectionTerrainChartDefinition)
  registerChart(DeckGLChartDefinition)
  registerChart(PointMapDefinition)
  registerChart(WindbarbDefinition)
  registerChart(LineMapDefinition)
  registerChart(GeoHeatChartDefinition)
  registerChart(BackendChoroplethDefinition)
  registerChart(FEChoroplethDefinition)
  registerChart(iFrameChartDefinition)
  registerChart(ContourChartDefinition)

  // these aren't actually visible
  registerChart(LineChartDefinition)
  registerChart(CountChartDefinition)
  registerChart(DeckGLPointmapDefinition)
  registerChart(DeckGLLinemapDefinition)
  registerChart(DeckGLChoroplethDefinition)

  chartsAreDefined = true
}

registerCharts()
