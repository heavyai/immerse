// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import pushid from "pushid"
import APP_CONFIG from "constants/app-config"

import { ChartState } from "reducers/charts/charts-reducer-types"

import { createVegaComboDataSelection } from "vega/utils/data-selection"
import { createVegaComboPresentationSettings } from "vega/utils/presentation"
import { createVegaComboScalesSettings } from "vega/utils/scales"
import { getInitialChartData } from "charts/utils/initialize-new-chart"
import { DEFAULT_VIOLIN_PRECISION } from "components/chart-settings/box-plot/components/data-formatting-components/data-settings"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

// Note that dimensions/meausres must be init'd with length > 0 (e.g. an empty object)
// as some code expects to map over this collection.
// See src/reducers/charts/error-checking-reducer/check-for-missing/check-for-missing-dimensions.js#L6-L18
export const initialChart = (defaults?: Partial<ChartState>): ChartState => {
  const vegaComboLayerId = pushid()

  return {
    autoSize: true,
    areFiltersInverse: false,
    cap: 12,
    renderArea: false,
    color: null,
    colorDomain: null,
    colorRamps: [],
    fullColorHashing: true,

    // Vega integration
    dataSelections: [createVegaComboDataSelection(vegaComboLayerId)],
    selectedLayerId: vegaComboLayerId,
    vegaSortColumn: {
      col: { name: "measure0" },
      index: 0,
      order: "desc"
    },
    presentation: createVegaComboPresentationSettings(),
    timeLagSettings: null,
    binSettings: null,
    numberOfGroups: 500,
    violinDistributionPrecision: DEFAULT_VIOLIN_PRECISION,
    outliersEnabled: getFeatureFlag(
      available_feature_flags.ENABLE_BOX_PLOT_OUTLIERS_DEFAULT
    ),

    // Scales prop is used for color measure and size measure
    scales: createVegaComboScalesSettings(),
    layersLegendPinned: false,
    collapsedLegendLayers: {},

    dcFlag: null,
    densityAccumulatorEnabled: true,
    dimensions: [{}],
    elasticX: true,
    elasticY: true,
    filters: [],
    geoJson: null,
    loading: false,
    measures: [{}],
    rangeChartEnabled: false,
    rangeFilter: [],
    savedColors: {},
    sortColumn: null,
    renderTableBorders: "none",
    ticks: 3,
    title: "",
    showOther: false,
    rasterShowOther: false, // All Other toggle in raster chart categorical color is introduced in 5.6, so need to use new property to keep it default to ON. The flag is the same as showOther property. Now default to OFF due to full color hashing in 8.5
    showNullDimensions: true,
    markTypes: [], // applies to dual y-axis charts only
    multiSources: {},
    // Used by the chart-legend component, currently only used by line2
    legendCollapsed: false,
    // showAbsoluteValues, showPercentValues, and showAllOthers are currently only used for Pie Chart
    showAbsoluteValues: true,
    showPercentValues: false,
    showPercentValuesInPopup: true,
    showAllOthers: true,
    linkedZoomEnabled: false,
    quickFiltersExpanded: true,
    popupEnabled: true,
    hoverSelectedColumns: [],
    active: true,
    ...(defaults || {}),
    ...getInitialChartData(
      defaults?.type || APP_CONFIG.default_chart_type || "table"
    )
  }
}
