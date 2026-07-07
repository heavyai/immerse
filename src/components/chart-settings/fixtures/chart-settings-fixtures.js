// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const twoLayerChart = {
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
      layerId: "-NM0TFFchMOnaGb85I2E",
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
  selectedLayerId: "-NM0TFFchMOnaGb85I2E",
  vegaSortColumn: {
    col: {
      name: "measure0"
    },
    index: 0,
    order: "desc"
  },
  presentation: {
    orientation: "column",
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
  densityAccumulatorEnabled: true,
  dimensions: [
    {
      isRequired: false,
      isError: false,
      inactive: false,
      name: "Lon",
      isBinned: false,
      isBinnable: false,
      table: "colorado_dem",
      type: "FLOAT",
      precision: 0,
      is_array: false,
      is_dict: false,
      name_is_ambiguous: false,
      label: "raster_lon",
      value: "raster_lon",
      custom: false,
      axisLabel: null,
      extract: false,
      loading: false,
      timeBin: null,
      minMax: [-106.00013732910156, -105.00041961669922]
    },
    {
      inactive: false,
      name: "Lat",
      isRequired: false,
      isBinned: false,
      isBinnable: false,
      isError: false,
      table: "colorado_dem",
      type: "FLOAT",
      precision: 0,
      is_array: false,
      is_dict: false,
      name_is_ambiguous: false,
      label: "raster_lat",
      value: "raster_lat",
      custom: false,
      axisLabel: null,
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
  fillEnabled: false,
  fillOpacity: 0.5,
  layers: [
    {
      rasterLayerId: "rasterLayerId:-NM0TX2EJDUw-omirSYU",
      measures: [
        {
          inactive: false,
          name: "x",
          isRequired: false,
          isError: false,
          table: "colorado_dem",
          type: "FLOAT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "raster_lon",
          value: "raster_lon",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          minMax: [-106.00013732910156, -105.00041961669922],
          initMinMax: [-106.00013732910156, -105.00041961669922],
          hideOther: true
        },
        {
          inactive: false,
          name: "y",
          isRequired: false,
          isError: false,
          table: "colorado_dem",
          type: "FLOAT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "raster_lat",
          value: "raster_lat",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          minMax: [38.00041580200195, 39.00013732910156],
          initMinMax: [38.00041580200195, 39.00013732910156],
          hideOther: true
        },
        {
          inactive: false,
          name: "size",
          isRequired: false,
          isError: false
        },
        {
          inactive: false,
          name: "color",
          isRequired: false,
          isError: false,
          table: "colorado_dem",
          type: "FLOAT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "z",
          value: "z",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          minMax: [1525.5, 4299.47900390625],
          initMinMax: [1525.5, 4299.47900390625],
          hideOther: true,
          colorType: "quantitative"
        },
        {
          inactive: false,
          name: "orientation",
          isRequired: false,
          isError: false
        }
      ],
      dimensions: [
        {
          inactive: false,
          name: null,
          isBinned: false,
          isBinnable: false,
          isRequired: false,
          isError: false
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
      pixelSize: 10,
      mark: "hex",
      dataSource: "colorado_dem",
      type: "pointmap",
      densityAccumulatorEnabled: true,
      autoSize: true,
      cap: 10000000,
      hoverSelectedColumns: [
        {
          inactive: false,
          name: "color",
          isRequired: false,
          isError: false,
          table: "colorado_dem",
          type: "FLOAT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "z",
          value: "z",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          minMax: [1525.5, 4299.47900390625],
          initMinMax: [1525.5, 4299.47900390625],
          hideOther: true,
          colorType: "quantitative",
          format: "custom-imperial"
        }
      ],
      geoJoin: {},
      borderWidth: 0,
      borderColor: "#ffffff",
      hasBorderColorFromFill: false,
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
        size: 450
      },
      opacity: "0.07",
      postFilters: [
        {
          name: "postFilter",
          required: true,
          operator: null,
          min: "",
          max: "",
          type: {
            int2: true,
            int4: true,
            int8: true,
            SMALLINT: true,
            TINYINT: true,
            INT: true,
            BIGINT: true,
            FLOAT: true,
            DOUBLE: true,
            DECIMAL: true,
            CUSTOM: true
          },
          inactive: false,
          isRequired: true
        }
      ],
      activeZoomLevel: true
    },
    {
      measures: [
        {
          isRequired: false,
          isError: false,
          inactive: false,
          name: "value",
          table: "colorado_dem",
          type: "FLOAT",
          precision: 0,
          is_array: false,
          is_dict: false,
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
      ],
      dimensions: [
        {
          isRequired: false,
          isError: false,
          inactive: false,
          name: "Lon",
          isBinned: false,
          isBinnable: false,
          table: "colorado_dem",
          type: "FLOAT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "raster_lon",
          value: "raster_lon",
          custom: false,
          axisLabel: null,
          extract: false,
          loading: false,
          timeBin: null,
          minMax: [-106.00013732910156, -105.00041961669922]
        },
        {
          inactive: false,
          name: "Lat",
          isRequired: false,
          isBinned: false,
          isBinnable: false,
          isError: false,
          table: "colorado_dem",
          type: "FLOAT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "raster_lat",
          value: "raster_lat",
          custom: false,
          axisLabel: null,
          extract: false,
          loading: false,
          timeBin: null,
          minMax: [38.00041580200195, 39.00013732910156]
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
      dataSource: "colorado_dem",
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
      fillEnabled: false,
      fillOpacity: 0.5,
      griddingCell: {
        size: 449
      },
      activeZoomLevel: true,
      rasterLayerId: "rasterLayerId:-NM0wd88LammrrGw_uxH",
      pixelSize: 10,
      mark: "hex",
      borderWidth: 0,
      borderColor: "#ffffff",
      hasBorderColorFromFill: false
    }
  ],
  griddingCell: {
    size: 449
  },
  dataSource: "colorado_dem",
  height: 493,
  mapZoomCenter: {
    zoom: 10.414928570092956,
    center: {
      lng: -105.48730697811789,
      lat: 38.50539475613087
    },
    bounds: {
      lonMin: -105.68610586216514,
      lonMax: -105.28850809406973,
      latMin: 38.40597910237017,
      latMax: 38.60467336059128
    }
  },
  pixelSize: 10,
  currentLayer: "master",
  mark: "hex",
  borderWidth: 0,
  borderColor: "#ffffff",
  hasBorderColorFromFill: false,
  postFilters: [
    {
      name: "postFilter",
      required: true,
      operator: null,
      min: "",
      max: "",
      type: {
        int2: true,
        int4: true,
        int8: true,
        SMALLINT: true,
        TINYINT: true,
        INT: true,
        BIGINT: true,
        FLOAT: true,
        DOUBLE: true,
        DECIMAL: true,
        CUSTOM: true
      },
      inactive: false,
      isRequired: true
    }
  ],
  rasterLayerId: "rasterLayerId:-NM0wd88LammrrGw_uxH",
  geoJoin: {},
  measures: [
    {
      isRequired: false,
      isError: false,
      inactive: false,
      name: "value",
      table: "colorado_dem",
      type: "FLOAT",
      precision: 0,
      is_array: false,
      is_dict: false,
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
  ],
  activeZoomLevel: true,
  basemap: {
    label: "Current Immerse Theme",
    value: "current"
  },
  dcFlag: 6888938239682241
}
