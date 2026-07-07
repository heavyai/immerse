// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const contourChart = () => ({
  autoSize: true,
  areFiltersInverse: false,
  cap: 12,
  renderArea: false,
  color: {
    type: "quantitative",
    key: "mapDScale",
    val: [
      "#115f9a",
      "#1984c5",
      "#22a7f0",
      "#48b5c4",
      "#76c68f",
      "#a6d75b",
      "#c9e52f",
      "#d0ee11",
      "#d0f400"
    ]
  },
  colorDomain: null,
  colorRamps: [],
  dataSelections: [
    {
      layerId: "-NSlHwe43o2ghRZIoHDa",
      table: null,
      dimensions: {
        xAxis: [],
        color: null
      },
      measures: {
        size: [],
        color: null
      }
    }
  ],
  selectedLayerId: "-NSlHwe43o2ghRZIoHDa",
  vegaSortColumn: {
    col: {
      name: "measure0"
    },
    index: 0,
    order: "desc"
  },
  presentation: {
    orientation: "column",
    gridEnabled: true,
    barValuesEnabled: true,
    baseDimensionAxis: {
      groupingMode: "grouped",
      lineAreaEnabled: false
    },
    sizeMeasurePrimaryAxis: {
      cumulativeDistributionEnabled: false,
      percentageDistributionEnabled: false,
      format: "custom-basic"
    },
    sizeMeasureSecondaryAxis: {
      cumulativeDistributionEnabled: false,
      percentageDistributionEnabled: false,
      format: "custom-basic"
    }
  },
  timeLagSettings: null,
  binSettings: null,
  numberOfGroups: 500,
  scales: {
    colorMeasure: {
      palette: {
        type: "quantitative",
        name: "mapDScale"
      },
      domain: null,
      paletteReversed: false
    }
  },
  layersLegendPinned: false,
  collapsedLegendLayers: {},
  dcFlag: null,
  densityAccumulatorEnabled: true,
  dimensions: [
    {
      name: "Lon",
      isRequired: false,
      isError: false,
      inactive: false,
      isBinned: false,
      isBinnable: false,
      axisLabel: null,
      custom: false,
      value: "raster_lon",
      label: "raster_lon",
      is_array: false,
      is_dict: false,
      is_join: false,
      name_is_ambiguous: false,
      table: "colorado_dem",
      type: "FLOAT",
      extract: false,
      loading: false,
      timeBin: null,
      minMax: [-106.00013732910156, -105.00041961669922]
    },
    {
      name: "Lat",
      isRequired: false,
      isError: false,
      inactive: false,
      isBinned: false,
      isBinnable: false,
      axisLabel: null,
      custom: false,
      value: "raster_lat",
      label: "raster_lat",
      is_array: false,
      is_dict: false,
      is_join: false,
      name_is_ambiguous: false,
      table: "colorado_dem",
      type: "FLOAT",
      extract: false,
      loading: false,
      timeBin: null,
      minMax: [38.00041580200195, 39.00013732910156]
    }
  ],
  elasticX: true,
  elasticY: true,
  filters: [],
  geoJson: null,
  loading: false,
  rangeChartEnabled: false,
  rangeFilter: [],
  savedColors: {},
  sortColumn: null,
  renderTableBorders: "none",
  ticks: 3,
  title: "",
  showOther: true,
  rasterShowOther: true,
  showNullDimensions: false,
  markTypes: [],
  multiSources: {},
  legendCollapsed: false,
  showAbsoluteValues: true,
  showPercentValues: false,
  showPercentValuesInPopup: true,
  showAllOthers: true,
  linkedZoomEnabled: false,
  quickFiltersExpanded: true,
  popupEnabled: true,
  hoverSelectedColumns: [],
  active: true,
  version: 1,
  type: "contour",
  zebraStriping: false,
  showNullMeasures: true,
  dataSource: "colorado_dem",
  hasError: false,
  majorContourSettings: {
    borderWidth: 2,
    borderColor: "#666666",
    borderOpacity: 0.75,
    intervalSize: 185
  },
  minorContourSettings: {
    borderWidth: 1,
    borderColor: "#666666",
    borderOpacity: 0.5,
    intervalSubdivisions: 0
  },
  neighborhoodFillRadius: 1,
  fillEnabled: true,
  fillOpacity: 0.5,
  layers: [
    {
      measures: [
        {
          name: "value",
          isRequired: true,
          isError: false,
          inactive: false
        }
      ],
      dimensions: [
        {
          name: "Lon",
          isRequired: true,
          isError: false,
          inactive: false,
          isBinned: false,
          isBinnable: false
        },
        {
          name: "Lat",
          isRequired: true,
          isError: false,
          inactive: false,
          isBinned: false,
          isBinnable: false
        }
      ],
      color: {
        type: "quantitative",
        key: "mapDScale",
        val: [
          "#115f9a",
          "#1984c5",
          "#22a7f0",
          "#48b5c4",
          "#76c68f",
          "#a6d75b",
          "#c9e52f",
          "#d0ee11",
          "#d0f400"
        ]
      },
      dataSource: "flights_2008_7M",
      type: "contour",
      densityAccumulatorEnabled: true,
      autoSize: true,
      cap: 12,
      hoverSelectedColumns: [],
      geoJoin: {},
      popupEnabled: true,
      rasterShowOther: true,
      active: true,
      majorContourSettings: {
        borderWidth: 2,
        borderColor: "#666666",
        borderOpacity: 0.75,
        intervalSize: 185
      },
      minorContourSettings: {
        borderWidth: 1,
        borderColor: "#666666",
        borderOpacity: 0.5,
        intervalSubdivisions: 0
      },
      neighborhoodFillRadius: 1,
      fillEnabled: true,
      fillOpacity: 0.5,
      griddingCell: {
        size: 0
      }
    }
  ],
  griddingCell: {
    size: 405
  },
  height: 495,
  width: 974,
  measures: [
    {
      name: "value",
      isRequired: false,
      isError: false,
      inactive: false,
      table: "colorado_dem",
      type: "FLOAT",
      precision: 0,
      is_array: false,
      is_dict: false,
      is_join: false,
      name_is_ambiguous: false,
      label: "z",
      value: "z",
      custom: false,
      axisLabel: null,
      loading: false,
      aggType: "Avg",
      minMax: [1525.5, 4299.47900390625],
      initMinMax: [1525.5, 4299.47900390625]
    }
  ]
})
