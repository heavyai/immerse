// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export default {
  charts: {
    "1": {
      dataSource: null,
      autoSize: true,
      areFiltersInverse: false,
      cap: 12,
      renderArea: false,
      color: null,
      colorDomain: null,
      dataSelections: [
        {
          layerId: "-Mn72H75hzyU6vM6KjxK",
          table: {
            name: "flights"
          },
          dimensions: {
            xAxis: [
              {
                type: "column",
                table: "flights",
                column: {
                  table: "flights",
                  column: "arrdelay",
                  label: "arrdelay",
                  type: "SMALLINT",
                  precision: 0,
                  is_array: false,
                  is_dict: false,
                  name_is_ambiguous: false,
                  value: "arrdelay",
                  filterType: "SMALLINT"
                }
              }
            ],
            color: {
              type: "column",
              table: "flights",
              column: {
                table: "flights",
                column: "plane_type",
                label: "plane_type",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true,
                name_is_ambiguous: false,
                value: "plane_type",
                filterType: "STR"
              }
            }
          },
          measures: {
            size: [
              {
                type: "column_aggregate",
                table: "flights",
                column: {
                  table: "flights",
                  column: "actualelapsedtime",
                  label: "actualelapsedtime",
                  type: "SMALLINT",
                  precision: 0,
                  is_array: false,
                  is_dict: false,
                  name_is_ambiguous: false,
                  value: "actualelapsedtime",
                  filterType: "SMALLINT"
                },
                aggregate: "Avg",
                markSettings: {
                  markType: "bar",
                  lineStyle: "solid",
                  axis: "primary",
                  markColor: "#27aeef"
                }
              }
            ],
            color: null
          },
          topNoptions: {
            allOthers: {
              key: "others0",
              color: "#888888",
              disabled: false,
              isAllOther: true
            },
            n: 5,
            measure: {
              type: "count",
              table: "flights"
            },
            sort: "DESC",
            showAllOthersInLegend: true,
            allowNullKeys: true
          }
        }
      ],
      selectedLayerId: "-Mn72H75hzyU6vM6KjxK",
      vegaSortColumn: {
        col: {
          name: "dimension0"
        },
        index: 0,
        order: "asc"
      },
      presentation: {
        orientation: "column",
        baseDimensionAxis: {
          groupingMode: "grouped",
          lineAreaEnabled: false
        },
        sizeMeasurePrimaryAxis: {
          cumulativeDistributionEnabled: false,
          percentageDistributionEnabled: false
        },
        sizeMeasureSecondaryAxis: {
          cumulativeDistributionEnabled: false,
          percentageDistributionEnabled: false
        }
      },
      binSettings: {
        dimensionType: "binned_numeric",
        manualMin: null,
        manualMax: null,
        numOfBins: 12,
        format: null
      },
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
      sortColumn: {
        col: {
          name: "countval"
        },
        index: 0,
        order: "desc"
      },
      ticks: 3,
      title: "",
      type: "vega-combo",
      showOther: true,
      rasterShowOther: true,
      showNullDimensions: true,
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
      isNotDc: true,
      data: {
        focus: [
          {
            "48": {
              minmaxQuery:
                'SELECT MIN(arrdelay) as dimensionMin, MAX(arrdelay) as dimensionMax FROM flights WHERE ("flights"."dest_lon" is not null AND "flights"."dest_lat" is not null AND "flights"."dest_lon" >= -114.254183575 AND "flights"."dest_lon" <= 114.254183575 AND "flights"."dest_lat" >= -6.863576525 AND "flights"."dest_lat" <= 44.653189977)',
              minmax: [
                {
                  dimensionMin: -1437,
                  dimensionMax: 2598
                }
              ],
              groupByDimensionQuery:
                'SELECT count(*) AS val, plane_type AS key FROM flights WHERE (("flights"."dest_lon" is not null AND "flights"."dest_lat" is not null AND "flights"."dest_lon" >= -114.254183575 AND "flights"."dest_lon" <= 114.254183575 AND "flights"."dest_lat" >= -6.863576525 AND "flights"."dest_lat" <= 44.653189977) AND "flights"."arrdelay" >= -1437 AND "flights"."arrdelay" <= 2598) GROUP BY key HAVING val IS NOT NULL ORDER BY val DESC LIMIT 5',
              groupByDimension: [
                {
                  val: 60940614,
                  key: null
                },
                {
                  val: 33583513,
                  key: "Corporation"
                },
                {
                  val: 224249,
                  key: "Individual"
                },
                {
                  val: 73141,
                  key: "Foreign Corporation"
                },
                {
                  val: 44202,
                  key: "Co-Owner"
                }
              ],
              allOthersGroupEnabled: true,
              allOthersSentinel: "-MnMG3M56NrIgutqNZfd",
              tableQuery:
                'SELECT AVG(actualelapsedtime) AS measure0, CASE WHEN (plane_type IS NULL OR plane_type IN (\'Corporation\',\'Individual\',\'Foreign Corporation\',\'Co-Owner\')) THEN plane_type ELSE \'-MnMG3M56NrIgutqNZfd\' END AS dimensionColor, CASE WHEN arrdelay >= 2598 THEN 12 ELSE WIDTH_BUCKET(arrdelay, -1437, 2598, 12) END - 1 AS dimension0 FROM flights WHERE (("flights"."dest_lon" is not null AND "flights"."dest_lat" is not null AND "flights"."dest_lon" >= -114.254183575 AND "flights"."dest_lon" <= 114.254183575 AND "flights"."dest_lat" >= -6.863576525 AND "flights"."dest_lat" <= 44.653189977) AND actualelapsedtime IS NOT NULL AND "flights"."arrdelay" IS NOT NULL AND "flights"."arrdelay" >= -1437 AND "flights"."arrdelay" <= 2598) GROUP BY dimension0, dimensionColor HAVING ((dimension0 >= 0 AND dimension0 < 12) OR dimension0 IS NULL) ORDER BY dimension0 asc NULLS LAST',
              table: [
                {
                  measure0: 157.94594594594594,
                  dimensionColor: null,
                  dimension0: 0
                },
                {
                  measure0: 191.5,
                  dimensionColor: "Corporation",
                  dimension0: 0
                },
                {
                  measure0: 157.45,
                  dimensionColor: null,
                  dimension0: 1
                },
                {
                  measure0: 211.44444444444446,
                  dimensionColor: "Corporation",
                  dimension0: 1
                },
                {
                  measure0: 84.51515151515152,
                  dimensionColor: null,
                  dimension0: 2
                },
                {
                  measure0: -399.5,
                  dimensionColor: "Corporation",
                  dimension0: 2
                },
                {
                  measure0: 102.16279069767442,
                  dimensionColor: "Corporation",
                  dimension0: 3
                },
                {
                  measure0: 162.91390728476821,
                  dimensionColor: null,
                  dimension0: 3
                },
                {
                  measure0: 152.0910946322879,
                  dimensionColor: "Co-Owner",
                  dimension0: 4
                },
                {
                  measure0: 126.57727941704835,
                  dimensionColor: "Corporation",
                  dimension0: 4
                },
                {
                  measure0: 153.7741449456789,
                  dimensionColor: "Individual",
                  dimension0: 4
                },
                {
                  measure0: 143.6705313369551,
                  dimensionColor: "-MnMG3M56NrIgutqNZfd",
                  dimension0: 4
                },
                {
                  measure0: 137.22602457892137,
                  dimensionColor: "Foreign Corporation",
                  dimension0: 4
                },
                {
                  measure0: 109.09395696266034,
                  dimensionColor: null,
                  dimension0: 4
                },
                {
                  measure0: 151.55555555555554,
                  dimensionColor: "-MnMG3M56NrIgutqNZfd",
                  dimension0: 5
                },
                {
                  measure0: 201.53608247422682,
                  dimensionColor: "Co-Owner",
                  dimension0: 5
                },
                {
                  measure0: 214.66517857142858,
                  dimensionColor: "Foreign Corporation",
                  dimension0: 5
                },
                {
                  measure0: 151.60619977037888,
                  dimensionColor: null,
                  dimension0: 5
                },
                {
                  measure0: 192.76722532588454,
                  dimensionColor: "Individual",
                  dimension0: 5
                },
                {
                  measure0: 154.53095947233243,
                  dimensionColor: "Corporation",
                  dimension0: 5
                },
                {
                  measure0: 140.8,
                  dimensionColor: "Co-Owner",
                  dimension0: 6
                },
                {
                  measure0: 176.5,
                  dimensionColor: "Individual",
                  dimension0: 6
                },
                {
                  measure0: 145.9221651521138,
                  dimensionColor: null,
                  dimension0: 6
                },
                {
                  measure0: 142.7926267281106,
                  dimensionColor: "Corporation",
                  dimension0: 6
                },
                {
                  measure0: 124.66666666666667,
                  dimensionColor: "-MnMG3M56NrIgutqNZfd",
                  dimension0: 6
                },
                {
                  measure0: 798.625,
                  dimensionColor: "Foreign Corporation",
                  dimension0: 6
                },
                {
                  measure0: 160.19736842105263,
                  dimensionColor: null,
                  dimension0: 7
                },
                {
                  measure0: 83,
                  dimensionColor: "Foreign Corporation",
                  dimension0: 7
                },
                {
                  measure0: 167.5243553008596,
                  dimensionColor: "Corporation",
                  dimension0: 7
                },
                {
                  measure0: 164.0625,
                  dimensionColor: "Individual",
                  dimension0: 7
                },
                {
                  measure0: 210.33333333333334,
                  dimensionColor: "Co-Owner",
                  dimension0: 7
                },
                {
                  measure0: 171,
                  dimensionColor: "-MnMG3M56NrIgutqNZfd",
                  dimension0: 7
                },
                {
                  measure0: 171.5,
                  dimensionColor: "Individual",
                  dimension0: 8
                },
                {
                  measure0: 689.7905405405405,
                  dimensionColor: "Corporation",
                  dimension0: 8
                },
                {
                  measure0: 132,
                  dimensionColor: "-MnMG3M56NrIgutqNZfd",
                  dimension0: 8
                },
                {
                  measure0: 622.1835748792271,
                  dimensionColor: null,
                  dimension0: 8
                },
                {
                  measure0: 310.875,
                  dimensionColor: "Corporation",
                  dimension0: 9
                },
                {
                  measure0: 206.71428571428572,
                  dimensionColor: null,
                  dimension0: 9
                },
                {
                  measure0: 172,
                  dimensionColor: "Corporation",
                  dimension0: 10
                },
                {
                  measure0: 129,
                  dimensionColor: null,
                  dimension0: 10
                },
                {
                  measure0: 169,
                  dimensionColor: "Corporation",
                  dimension0: 11
                }
              ],
              fullMinMax: [
                {
                  dimensionMin: -1437,
                  dimensionMax: 2598
                }
              ]
            },
            "49": null,
            "50": null
          }
        ]
      },
      basemap: {
        label: "Current Immerse Theme",
        value: "current"
      }
    },
    "2": {
      dataSource: "flights",
      autoSize: true,
      areFiltersInverse: false,
      cap: 100,
      renderArea: false,
      color: {
        type: "custom",
        key: "mapD",
        val: ["#22A7F0", "#3ad6cd", "#d4e666"],
        column: "dest_state",
        customKey: "key1",
        isCustom: true,
        customDomain: ["CA", "TX", "IL", "FL", "GA"],
        customRange: ["#22A7F0", "#ea5545", "#bdcf32", "#b33dc6", "#ef9b20"],
        lineStyles: ["solid", "solid", "solid", "solid", "solid"],
        defaultOtherDomain: "other",
        defaultOtherRange: "#27aeef"
      },
      colorDomain: null,
      dataSelections: [
        {
          layerId: "-Mn72MjTLboXdJp54gHl",
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
      selectedLayerId: "-Mn72MjTLboXdJp54gHl",
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
          percentageDistributionEnabled: false
        },
        sizeMeasureSecondaryAxis: {
          cumulativeDistributionEnabled: false,
          percentageDistributionEnabled: false
        }
      },
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
          name: "X Axis",
          table: "flights",
          type: "STR",
          precision: 0,
          is_array: false,
          is_dict: true,
          name_is_ambiguous: false,
          label: "dest",
          value: "dest",
          custom: false,
          axisLabel: null,
          max_val: null,
          min_val: null,
          maxBinSize: null,
          currentHighValue: null,
          currentLowValue: null,
          autobin: false,
          numOfBins: null,
          isBinned: false,
          isBinnable: false
        },
        {
          inactive: false,
          name: "Color",
          isRequired: false,
          isError: false,
          table: "flights",
          type: "STR",
          precision: 0,
          is_array: false,
          is_dict: true,
          name_is_ambiguous: false,
          label: "dest_state",
          value: "dest_state",
          custom: false,
          axisLabel: null,
          max_val: null,
          min_val: null,
          maxBinSize: null,
          currentHighValue: null,
          currentLowValue: null,
          autobin: false,
          numOfBins: null,
          isBinned: false,
          isBinnable: false,
          topN: ["CA", "TX", "IL", "FL", "GA"]
        }
      ],
      elasticX: true,
      elasticY: true,
      filters: [],
      geoJson: null,
      loading: false,
      measures: [
        {
          isRequired: false,
          isError: false,
          inactive: false,
          name: "val",
          label: "# Records",
          value: "*",
          type: "SMALLINT",
          custom: false,
          axisLabel: null,
          minMax: null,
          categories: null,
          colorType: "quantitative",
          aggType: "Count",
          originIndex: 0
        }
      ],
      rangeChartEnabled: false,
      rangeFilter: [],
      savedColors: {
        custom: {
          type: "custom",
          key: "mapD",
          val: ["#22A7F0", "#3ad6cd", "#d4e666"],
          customKey: "key1",
          isCustom: true,
          customDomain: ["Count # Records"],
          customRange: ["#22A7F0"],
          lineStyles: ["solid"],
          defaultOtherDomain: "other",
          defaultOtherRange: "#27aeef"
        },
        custom_dest_state: {
          type: "custom",
          key: "mapD",
          val: ["#22A7F0", "#3ad6cd", "#d4e666"],
          column: "dest_state",
          customKey: "key1",
          isCustom: true,
          customDomain: ["CA", "TX", "IL", "FL", "GA"],
          customRange: ["#22A7F0", "#ea5545", "#bdcf32", "#b33dc6", "#ef9b20"],
          lineStyles: ["solid", "solid", "solid", "solid", "solid"],
          defaultOtherDomain: "other",
          defaultOtherRange: "#27aeef"
        }
      },
      sortColumn: {
        col: {
          name: "val"
        },
        index: 0,
        order: "desc"
      },
      ticks: 3,
      title: "",
      type: "bar",
      showOther: true,
      rasterShowOther: true,
      showNullDimensions: true,
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
      hasError: false,
      data: [
        {
          key0: "ORD",
          key1: "IL",
          val: 6638034
        },
        {
          key0: "ATL",
          key1: "GA",
          val: 6094186
        },
        {
          key0: "DFW",
          key1: "TX",
          val: 5745593
        },
        {
          key0: "LAX",
          key1: "CA",
          val: 4086930
        },
        {
          key0: "PHX",
          key1: "All Others",
          val: 3497759
        },
        {
          key0: "DEN",
          key1: "All Others",
          val: 3335222
        },
        {
          key0: "DTW",
          key1: "All Others",
          val: 2997138
        },
        {
          key0: "IAH",
          key1: "TX",
          val: 2889971
        },
        {
          key0: "MSP",
          key1: "All Others",
          val: 2765191
        },
        {
          key0: "SFO",
          key1: "CA",
          val: 2725675
        },
        {
          key0: "STL",
          key1: "All Others",
          val: 2720250
        },
        {
          key0: "EWR",
          key1: "All Others",
          val: 2708414
        },
        {
          key0: "LAS",
          key1: "All Others",
          val: 2629198
        },
        {
          key0: "CLT",
          key1: "All Others",
          val: 2553154
        },
        {
          key0: "LGA",
          key1: "All Others",
          val: 2292799
        },
        {
          key0: "BOS",
          key1: "All Others",
          val: 2287186
        },
        {
          key0: "PHL",
          key1: "All Others",
          val: 2162966
        },
        {
          key0: "PIT",
          key1: "All Others",
          val: 2079567
        },
        {
          key0: "SLC",
          key1: "All Others",
          val: 2004414
        },
        {
          key0: "MCO",
          key1: "FL",
          val: 1964871
        },
        {
          key0: "CVG",
          key1: "All Others",
          val: 1921932
        },
        {
          key0: "DCA",
          key1: "All Others",
          val: 1827731
        },
        {
          key0: "BWI",
          key1: "All Others",
          val: 1716097
        },
        {
          key0: "SAN",
          key1: "CA",
          val: 1541355
        },
        {
          key0: "MIA",
          key1: "FL",
          val: 1449024
        },
        {
          key0: "CLE",
          key1: "All Others",
          val: 1415706
        },
        {
          key0: "IAD",
          key1: "All Others",
          val: 1337232
        },
        {
          key0: "JFK",
          key1: "All Others",
          val: 1330748
        },
        {
          key0: "TPA",
          key1: "FL",
          val: 1318788
        },
        {
          key0: "MEM",
          key1: "All Others",
          val: 1212178
        },
        {
          key0: "HOU",
          key1: "TX",
          val: 1210885
        },
        {
          key0: "B",
          key1: "All Others",
          val: 1176329
        },
        {
          key0: "MCI",
          key1: "All Others",
          val: 1171265
        },
        {
          key0: "MDW",
          key1: "IL",
          val: 1170660
        },
        {
          key0: "OAK",
          key1: "CA",
          val: 1160059
        },
        {
          key0: "SJC",
          key1: "CA",
          val: 1105503
        },
        {
          key0: "PDX",
          key1: "All Others",
          val: 1052506
        },
        {
          key0: "RDU",
          key1: "All Others",
          val: 1039785
        },
        {
          key0: "FLL",
          key1: "FL",
          val: 1010732
        },
        {
          key0: "DAL",
          key1: "TX",
          val: 956244
        },
        {
          key0: "MSY",
          key1: "All Others",
          val: 951584
        },
        {
          key0: "IND",
          key1: "All Others",
          val: 821732
        },
        {
          key0: "S",
          key1: "CA",
          val: 820658
        },
        {
          key0: "SMF",
          key1: "CA",
          val: 812211
        },
        {
          key0: "SAT",
          key1: "TX",
          val: 805623
        },
        {
          key0: "AUS",
          key1: "TX",
          val: 800279
        },
        {
          key0: "ONT",
          key1: "CA",
          val: 771385
        },
        {
          key0: "ABQ",
          key1: "All Others",
          val: 757834
        },
        {
          key0: "CMH",
          key1: "All Others",
          val: 756511
        },
        {
          key0: "BDL",
          key1: "All Others",
          val: 647691
        },
        {
          key0: "BUR",
          key1: "CA",
          val: 579731
        },
        {
          key0: "PBI",
          key1: "FL",
          val: 530112
        },
        {
          key0: "JAX",
          key1: "FL",
          val: 518611
        },
        {
          key0: "ELP",
          key1: "TX",
          val: 511678
        },
        {
          key0: "RNO",
          key1: "All Others",
          val: 508778
        },
        {
          key0: "BUF",
          key1: "All Others",
          val: 487886
        },
        {
          key0: "OKC",
          key1: "All Others",
          val: 480476
        },
        {
          key0: "TUL",
          key1: "All Others",
          val: 468860
        },
        {
          key0: "SDF",
          key1: "All Others",
          val: 459724
        },
        {
          key0: "SJU",
          key1: "All Others",
          val: 458710
        },
        {
          key0: "MKE",
          key1: "All Others",
          val: 444009
        },
        {
          key0: "PVD",
          key1: "All Others",
          val: 440405
        },
        {
          key0: "ORF",
          key1: "All Others",
          val: 431627
        },
        {
          key0: "TUS",
          key1: "All Others",
          val: 411976
        },
        {
          key0: "OMA",
          key1: "All Others",
          val: 405239
        },
        {
          key0: "BHM",
          key1: "All Others",
          val: 405068
        },
        {
          key0: "RSW",
          key1: "FL",
          val: 396645
        },
        {
          key0: "GSO",
          key1: "All Others",
          val: 386589
        },
        {
          key0: "DAY",
          key1: "All Others",
          val: 379693
        },
        {
          key0: "ROC",
          key1: "All Others",
          val: 365926
        },
        {
          key0: "RIC",
          key1: "All Others",
          val: 357681
        },
        {
          key0: "SYR",
          key1: "All Others",
          val: 335364
        },
        {
          key0: "LIT",
          key1: "All Others",
          val: 328219
        },
        {
          key0: "ALB",
          key1: "All Others",
          val: 291304
        },
        {
          key0: "COS",
          key1: "All Others",
          val: 267395
        },
        {
          key0: "GRR",
          key1: "All Others",
          val: 240478
        },
        {
          key0: "MHT",
          key1: "All Others",
          val: 239986
        },
        {
          key0: "BOI",
          key1: "All Others",
          val: 236970
        },
        {
          key0: "DSM",
          key1: "All Others",
          val: 222183
        },
        {
          key0: "CHS",
          key1: "All Others",
          val: 221634
        },
        {
          key0: "ICT",
          key1: "All Others",
          val: 209012
        },
        {
          key0: "GSP",
          key1: "All Others",
          val: 199283
        },
        {
          key0: "TYS",
          key1: "All Others",
          val: 199167
        },
        {
          key0: "JAN",
          key1: "All Others",
          val: 189548
        },
        {
          key0: "SAV",
          key1: "GA",
          val: 184985
        },
        {
          key0: "LBB",
          key1: "TX",
          val: 172200
        },
        {
          key0: "CAE",
          key1: "All Others",
          val: 167209
        },
        {
          key0: "MDT",
          key1: "All Others",
          val: 166293
        },
        {
          key0: "SRQ",
          key1: "FL",
          val: 166127
        },
        {
          key0: "PWM",
          key1: "All Others",
          val: 161037
        },
        {
          key0: "ISP",
          key1: "All Others",
          val: 157980
        },
        {
          key0: "HSV",
          key1: "All Others",
          val: 157811
        },
        {
          key0: "MAF",
          key1: "TX",
          val: 156065
        },
        {
          key0: "LGB",
          key1: "CA",
          val: 155717
        },
        {
          key0: "PNS",
          key1: "FL",
          val: 155712
        }
      ],
      isNotDc: true,
      filterString:
        '("flights"."dest_lon" is not null\n          AND "flights"."dest_lat" is not null\n          AND "flights"."dest_lon" >= -130.8471148 AND "flights"."dest_lon" <= 130.8471148 AND "flights"."dest_lat" >= -10.61153081 AND "flights"."dest_lat" <= 47.288459007)',
      isLoadingData: false,
      basemap: {
        label: "Current Immerse Theme",
        value: "current"
      }
    },
    "3": {
      dataSource: "flights",
      autoSize: true,
      areFiltersInverse: false,
      cap: 100,
      renderArea: false,
      color: {
        type: "ordinal",
        key: "mapD",
        val: ["#22A7F0", "#3ad6cd", "#d4e666"],
        defaultOtherDomain: "Default"
      },
      colorDomain: null,
      dataSelections: [
        {
          layerId: "-Mn72RdCsI1k93d2Sv5w",
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
      selectedLayerId: "-Mn72RdCsI1k93d2Sv5w",
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
          percentageDistributionEnabled: false
        },
        sizeMeasureSecondaryAxis: {
          cumulativeDistributionEnabled: false,
          percentageDistributionEnabled: false
        }
      },
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
          inactive: false,
          name: null,
          isRequired: false,
          isError: false,
          table: "flights",
          type: "SMALLINT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "airtime",
          value: "airtime",
          custom: false,
          axisLabel: null,
          extract: false,
          loading: false,
          timeBin: null,
          min_val: -3818,
          max_val: 3508,
          currentLowValue: -3818,
          currentHighValue: 3508,
          cardinality: 2196,
          isBinned: true,
          isBinnable: true,
          autobin: true,
          maxBinSize: 250,
          numOfBins: 12
        },
        {
          isRequired: false,
          isError: false
        }
      ],
      elasticX: true,
      elasticY: true,
      filters: [],
      geoJson: null,
      loading: false,
      measures: [
        {
          isRequired: false,
          isError: false,
          inactive: false,
          name: "val",
          table: "flights",
          type: "SMALLINT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "arrdelay",
          value: "arrdelay",
          custom: false,
          axisLabel: null,
          minMax: null,
          categories: null,
          colorType: "quantitative",
          aggType: "Avg",
          originIndex: 0
        },
        {
          name: "color",
          isRequired: false,
          isError: false,
          table: "flights",
          type: "STR",
          precision: 0,
          is_array: false,
          is_dict: true,
          name_is_ambiguous: false,
          label: "plane_status",
          value: "plane_status",
          custom: false,
          axisLabel: null,
          minMax: null,
          categories: null,
          colorType: "quantitative",
          aggType: "# Unique",
          originIndex: 1
        }
      ],
      rangeChartEnabled: false,
      rangeFilter: [],
      savedColors: {},
      sortColumn: {
        col: {
          name: "val"
        },
        index: 0,
        order: "desc"
      },
      ticks: 3,
      title: "",
      type: "row",
      showOther: true,
      rasterShowOther: true,
      showNullDimensions: true,
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
      hasError: false,
      basemap: {
        label: "Current Immerse Theme",
        value: "current"
      },
      dcFlag: 5957017165650401
    },
    "4": {
      dataSource: "bad_faker_geo",
      autoSize: true,
      areFiltersInverse: false,
      cap: 100,
      renderArea: false,
      color: {
        type: "custom",
        key: "mapD",
        val: ["#22A7F0", "#3ad6cd", "#d4e666"],
        column: "Color",
        customKey: "key1",
        isCustom: true,
        customDomain: ["green", "yellow", "black", "gray", "white"],
        customRange: ["#22A7F0", "#ea5545", "#bdcf32", "#b33dc6", "#ef9b20"],
        lineStyles: ["solid", "solid", "solid", "solid", "solid"],
        defaultOtherDomain: "other",
        defaultOtherRange: "#27aeef"
      },
      colorDomain: null,
      dataSelections: [
        {
          layerId: "-Mn7SMyw1IK84hh5sEkb",
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
      selectedLayerId: "-Mn7SMyw1IK84hh5sEkb",
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
          percentageDistributionEnabled: false
        },
        sizeMeasureSecondaryAxis: {
          cumulativeDistributionEnabled: false,
          percentageDistributionEnabled: false
        }
      },
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
          name: "X Axis",
          table: "bad_faker_geo",
          type: "STR",
          precision: 0,
          is_array: false,
          is_dict: true,
          name_is_ambiguous: false,
          label: "City",
          value: "City",
          custom: false,
          axisLabel: null,
          max_val: null,
          min_val: null,
          maxBinSize: null,
          currentHighValue: null,
          currentLowValue: null,
          autobin: false,
          numOfBins: null,
          isBinned: false,
          isBinnable: false
        },
        {
          name: "Color",
          isRequired: false,
          isError: false,
          inactive: false,
          table: "bad_faker_geo",
          type: "STR",
          precision: 0,
          is_array: false,
          is_dict: true,
          name_is_ambiguous: false,
          label: "Color",
          value: "Color",
          custom: false,
          axisLabel: null,
          max_val: null,
          min_val: null,
          maxBinSize: null,
          currentHighValue: null,
          currentLowValue: null,
          autobin: false,
          numOfBins: null,
          isBinned: false,
          isBinnable: false,
          topN: ["green", "yellow", "black", "gray", "white"]
        }
      ],
      elasticX: true,
      elasticY: true,
      filters: [],
      geoJson: null,
      loading: false,
      measures: [
        {
          isRequired: false,
          isError: false,
          inactive: false,
          name: "val",
          table: "bad_faker_geo",
          type: "DOUBLE",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "Double_",
          value: "Double_",
          custom: false,
          axisLabel: null,
          minMax: null,
          categories: null,
          colorType: "quantitative",
          aggType: "Avg",
          originIndex: 0
        }
      ],
      rangeChartEnabled: false,
      rangeFilter: [],
      savedColors: {
        custom_Color: {
          type: "custom",
          key: "mapD",
          val: ["#22A7F0", "#3ad6cd", "#d4e666"],
          column: "Color",
          customKey: "key1",
          isCustom: true,
          customDomain: ["green", "yellow", "black", "gray", "white"],
          customRange: ["#22A7F0", "#ea5545", "#bdcf32", "#b33dc6", "#ef9b20"],
          lineStyles: ["solid", "solid", "solid", "solid", "solid"],
          defaultOtherDomain: "other",
          defaultOtherRange: "#27aeef"
        }
      },
      sortColumn: {
        col: {
          name: "val"
        },
        index: 0,
        order: "desc"
      },
      ticks: 3,
      title: "",
      type: "bar",
      showOther: true,
      rasterShowOther: true,
      showNullDimensions: true,
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
      hasError: false,
      isNotDc: true,
      filterString: "",
      isLoadingData: false,
      basemap: {
        label: "Current Immerse Theme",
        value: "current"
      },
      data: [
        {
          key0: "Beni Douala",
          key1: "white",
          val: 80151089576973.62
        },
        {
          key0: "Sillanwali",
          key1: "black",
          val: 64141273803560.13
        },
        {
          key0: "Tandil",
          key1: "yellow",
          val: 63632794049780.164
        },
        {
          key0: "Yablonovskiy",
          key1: "green",
          val: 62646498109883.89
        },
        {
          key0: "Artsyz",
          key1: "yellow",
          val: 59909640225971.54
        },
        {
          key0: "Zvenihorodka",
          key1: "yellow",
          val: 59049756620097.69
        },
        {
          key0: "Soure",
          key1: "gray",
          val: 58421687427193.61
        },
        {
          key0: "Paoy Paet",
          key1: "gray",
          val: 55338910766045.41
        },
        {
          key0: "Maspalomas",
          key1: "gray",
          val: 53479305981220.51
        },
        {
          key0: "Thetford",
          key1: "black",
          val: 52881726518754.88
        },
        {
          key0: "Segundo Ensanche",
          key1: "yellow",
          val: 49819614017157.305
        },
        {
          key0: "Olupona",
          key1: "green",
          val: 49666301028798
        },
        {
          key0: "Saint-Omer",
          key1: "yellow",
          val: 49250037620471.09
        },
        {
          key0: "Recife",
          key1: "black",
          val: 49158619839596.73
        },
        {
          key0: "Maspalomas",
          key1: "green",
          val: 46118062855167.75
        },
        {
          key0: "Zvenihorodka",
          key1: "gray",
          val: 43461734365120.586
        },
        {
          key0: "Mesagne",
          key1: "yellow",
          val: 42198961791699.21
        },
        {
          key0: "Tyler",
          key1: "black",
          val: 41935565028514.62
        },
        {
          key0: "Gaziantep",
          key1: "white",
          val: 41810098184173.13
        },
        {
          key0: "Yablonovskiy",
          key1: "yellow",
          val: 41411058752519.58
        },
        {
          key0: "Narva",
          key1: "yellow",
          val: 41054822665329.195
        },
        {
          key0: "Kidodi",
          key1: "gray",
          val: 40656950644993.78
        },
        {
          key0: "Olupona",
          key1: "white",
          val: 40017070554196.055
        },
        {
          key0: "Aykhal",
          key1: "green",
          val: 40014349861929.56
        },
        {
          key0: "Great Wyrley",
          key1: "gray",
          val: 39782593418441.18
        },
        {
          key0: "Talavera de la Reina",
          key1: "black",
          val: 39002505550923.625
        },
        {
          key0: "Soledade",
          key1: "white",
          val: 38486549172006.9
        },
        {
          key0: "Las Gabias",
          key1: "yellow",
          val: 38420136232997.97
        },
        {
          key0: "Leland",
          key1: "green",
          val: 37762546773144.91
        },
        {
          key0: "Onex",
          key1: "yellow",
          val: 37547911055619.78
        },
        {
          key0: "Mudanya",
          key1: "green",
          val: 37516584203693.44
        },
        {
          key0: "Barbil",
          key1: "green",
          val: 37281671625572.2
        },
        {
          key0: "Yeysk",
          key1: "yellow",
          val: 37044146345483.836
        },
        {
          key0: "Teghra",
          key1: "black",
          val: 36447488059804.84
        },
        {
          key0: "Olupona",
          key1: "black",
          val: 36381450169448.164
        },
        {
          key0: "Nowra",
          key1: "green",
          val: 36042676337906.19
        },
        {
          key0: "Paracho de Verduzco",
          key1: "green",
          val: 35907474824305.36
        },
        {
          key0: "Idenao",
          key1: "yellow",
          val: 35747558255234.516
        },
        {
          key0: "Aykhal",
          key1: "gray",
          val: 35524396989677.875
        },
        {
          key0: "Teghra",
          key1: "white",
          val: 35271456053369.81
        },
        {
          key0: "Tyler",
          key1: "white",
          val: 35238675280551.305
        },
        {
          key0: "Beni Douala",
          key1: "black",
          val: 35091697651915.914
        },
        {
          key0: "Messaad",
          key1: "yellow",
          val: 35021301592878.164
        },
        {
          key0: "New Kingston",
          key1: "yellow",
          val: 34704169533847.035
        },
        {
          key0: "Croix-des-Bouquets",
          key1: "black",
          val: 34342629689556.57
        },
        {
          key0: "Aykhal",
          key1: "white",
          val: 34297957668007.28
        },
        {
          key0: "Thenia",
          key1: "green",
          val: 33718189453002.09
        },
        {
          key0: "Bibiani",
          key1: "gray",
          val: 33512378978458.04
        },
        {
          key0: "Sangla Hill",
          key1: "yellow",
          val: 33352865902843.25
        },
        {
          key0: "Chiguayante",
          key1: "green",
          val: 33095985041813.51
        },
        {
          key0: "Petrozavodsk",
          key1: "yellow",
          val: 32686162763918.48
        },
        {
          key0: "Beni Douala",
          key1: "gray",
          val: 32529152023721.24
        },
        {
          key0: "Paoy Paet",
          key1: "yellow",
          val: 32462806784214.88
        },
        {
          key0: "Bang Ban",
          key1: "green",
          val: 32316377625449.875
        },
        {
          key0: "Petrozavodsk",
          key1: "black",
          val: 31865357565665.906
        },
        {
          key0: "Mesagne",
          key1: "gray",
          val: 31730286209427.96
        },
        {
          key0: "Landshut",
          key1: "white",
          val: 31180420534664.363
        },
        {
          key0: "New Kingston",
          key1: "black",
          val: 31086297076606.84
        },
        {
          key0: "San Juan",
          key1: "white",
          val: 31040612157628.94
        },
        {
          key0: "Recife",
          key1: "gray",
          val: 31036333870386.92
        },
        {
          key0: "Durazno",
          key1: "yellow",
          val: 30960657445687.54
        },
        {
          key0: "Caravaca",
          key1: "gray",
          val: 30920993996936.523
        },
        {
          key0: "Losheim",
          key1: "black",
          val: 30917228021775.45
        },
        {
          key0: "New Kingston",
          key1: "gray",
          val: 30855173891452.227
        },
        {
          key0: "Kantharalak",
          key1: "green",
          val: 30759430300053.203
        },
        {
          key0: "Petrozavodsk",
          key1: "white",
          val: 30526117245456.29
        },
        {
          key0: "Milagro",
          key1: "green",
          val: 29969790017046.28
        },
        {
          key0: "Mesagne",
          key1: "green",
          val: 29892225718946.875
        },
        {
          key0: "Losheim",
          key1: "green",
          val: 29823647721325.207
        },
        {
          key0: "Messaad",
          key1: "gray",
          val: 29804025649659.414
        },
        {
          key0: "Bobigny",
          key1: "green",
          val: 29688559477540.867
        },
        {
          key0: "Talavera de la Reina",
          key1: "yellow",
          val: 29659969077152.07
        },
        {
          key0: "Sasayama",
          key1: "white",
          val: 29539338768632.332
        },
        {
          key0: "West Des Moines",
          key1: "gray",
          val: 29330866260931.836
        },
        {
          key0: "Durazno",
          key1: "black",
          val: 29275928772017.832
        },
        {
          key0: "Montecchio Maggiore-Alte Ceccato",
          key1: "yellow",
          val: 29152633757640.01
        },
        {
          key0: "Houthalen",
          key1: "white",
          val: 29084075225008.137
        },
        {
          key0: "Les Olives",
          key1: "yellow",
          val: 28983084570582.223
        },
        {
          key0: "Carindale",
          key1: "green",
          val: 28948883722475.215
        },
        {
          key0: "Edremit",
          key1: "black",
          val: 28809276377232.438
        },
        {
          key0: "Sillanwali",
          key1: "white",
          val: 28792884273805.613
        },
        {
          key0: "Ariccia",
          key1: "white",
          val: 28588165007798.43
        },
        {
          key0: "Ilesa",
          key1: "white",
          val: 28419576091588.594
        },
        {
          key0: "Soure",
          key1: "yellow",
          val: 28304753340835.96
        },
        {
          key0: "Shepetivka",
          key1: "yellow",
          val: 28026516373885.742
        },
        {
          key0: "Bushey",
          key1: "gray",
          val: 27997991200065.85
        },
        {
          key0: "Gainsborough",
          key1: "green",
          val: 27935793823669.348
        },
        {
          key0: "Isfahan",
          key1: "white",
          val: 27738245715558.746
        },
        {
          key0: "West Des Moines",
          key1: "black",
          val: 27326104486851.95
        },
        {
          key0: "Chharra",
          key1: "black",
          val: 27216451984514.277
        },
        {
          key0: "Chharra",
          key1: "gray",
          val: 26869761517697.74
        },
        {
          key0: "Damnoen Saduak",
          key1: "black",
          val: 26621960019370.06
        },
        {
          key0: "Andijon",
          key1: "gray",
          val: 26437401665081.074
        },
        {
          key0: "Idenao",
          key1: "green",
          val: 25536742369211.145
        },
        {
          key0: "Schleswig",
          key1: "green",
          val: 25433368720429.758
        },
        {
          key0: "Sasayama",
          key1: "green",
          val: 25421974844550.39
        },
        {
          key0: "Sangla Hill",
          key1: "gray",
          val: 25169390011187.742
        },
        {
          key0: "Schleswig",
          key1: "gray",
          val: 25133668182124.15
        },
        {
          key0: "Thenia",
          key1: "white",
          val: 25041513093595.277
        },
        {
          key0: "Ksar Chellala",
          key1: "green",
          val: 24719878717357.215
        },
        {
          key0: "Sillanwali",
          key1: "yellow",
          val: 24654753080122.69
        },
        {
          key0: "Reus",
          key1: "white",
          val: 24412545141956.85
        },
        {
          key0: "Myawadi",
          key1: "gray",
          val: 24125645463636.75
        },
        {
          key0: "Jhol",
          key1: "green",
          val: 24077148356298.066
        },
        {
          key0: "Tupelo",
          key1: "yellow",
          val: 23997781935726.105
        },
        {
          key0: "Houthalen",
          key1: "yellow",
          val: 23980586838973.68
        },
        {
          key0: "Saint-Omer",
          key1: "black",
          val: 23922789404771.03
        },
        {
          key0: "Bibiani",
          key1: "yellow",
          val: 23729730530882.16
        },
        {
          key0: "Yamada",
          key1: "yellow",
          val: 23682460293963.06
        },
        {
          key0: "Manaoag",
          key1: "yellow",
          val: 23258557566545.34
        },
        {
          key0: "Recife",
          key1: "white",
          val: 23088252944213.227
        },
        {
          key0: "Kalavoor",
          key1: "green",
          val: 22634088778851.39
        },
        {
          key0: "Santa Gertrudes",
          key1: "black",
          val: 22624128381227.707
        },
        {
          key0: "Jhol",
          key1: "gray",
          val: 22521998239617.086
        },
        {
          key0: "Mudanya",
          key1: "yellow",
          val: 22388904710289.5
        },
        {
          key0: "Talavera de la Reina",
          key1: "green",
          val: 22360983380495.266
        },
        {
          key0: "Nayoro",
          key1: "gray",
          val: 22288275678204.867
        },
        {
          key0: "Soledade",
          key1: "yellow",
          val: 22257315393622.855
        },
        {
          key0: "Andijon",
          key1: "green",
          val: 22194756028473.234
        },
        {
          key0: "Huntley",
          key1: "gray",
          val: 22148172097454.734
        },
        {
          key0: "Croix-des-Bouquets",
          key1: "yellow",
          val: 22110703004426.707
        },
        {
          key0: "Mvomero",
          key1: "yellow",
          val: 22071298159364.613
        },
        {
          key0: "Valletta",
          key1: "yellow",
          val: 21980688271069.023
        },
        {
          key0: "Biu",
          key1: "yellow",
          val: 21977135255195.035
        },
        {
          key0: "Damnoen Saduak",
          key1: "yellow",
          val: 21789410075204.742
        },
        {
          key0: "Hungund",
          key1: "gray",
          val: 21744887059868.18
        },
        {
          key0: "Isfahan",
          key1: "green",
          val: 21736257940200.92
        },
        {
          key0: "Biu",
          key1: "black",
          val: 21625041417765.37
        },
        {
          key0: "Manaoag",
          key1: "black",
          val: 21614946670840.684
        },
        {
          key0: "Teghra",
          key1: "green",
          val: 21481133435288.43
        },
        {
          key0: "Yamada",
          key1: "gray",
          val: 21480022039787.41
        },
        {
          key0: "Croix-des-Bouquets",
          key1: "green",
          val: 21432668656214.062
        },
        {
          key0: "Houthalen",
          key1: "green",
          val: 21015226111298.344
        },
        {
          key0: "Yeysk",
          key1: "green",
          val: 20901680559749.258
        },
        {
          key0: "Barbil",
          key1: "black",
          val: 20880254701027.074
        },
        {
          key0: "Tandil",
          key1: "black",
          val: 20867668406134.836
        },
        {
          key0: "Houthalen",
          key1: "black",
          val: 20483785612976.242
        },
        {
          key0: "Ariccia",
          key1: "black",
          val: 20476787489376.242
        },
        {
          key0: "Franceville",
          key1: "green",
          val: 20452172453662.434
        },
        {
          key0: "Myawadi",
          key1: "yellow",
          val: 20414530638511.324
        },
        {
          key0: "Talavera de la Reina",
          key1: "gray",
          val: 20376198363427.777
        },
        {
          key0: "Sangla Hill",
          key1: "green",
          val: 20261160557293.473
        },
        {
          key0: "Landshut",
          key1: "yellow",
          val: 20231163237653.637
        },
        {
          key0: "Artsyz",
          key1: "black",
          val: 20080887098641.51
        },
        {
          key0: "Segundo Ensanche",
          key1: "green",
          val: 20080590131668.18
        },
        {
          key0: "Kidodi",
          key1: "green",
          val: 19958432377107.45
        },
        {
          key0: "Andijon",
          key1: "yellow",
          val: 19954605828362.42
        },
        {
          key0: "Montecchio Maggiore-Alte Ceccato",
          key1: "gray",
          val: 19914878399249.164
        },
        {
          key0: "Paracho de Verduzco",
          key1: "black",
          val: 19914212286655.723
        },
        {
          key0: "Palafrugell",
          key1: "gray",
          val: 19882734003732.973
        },
        {
          key0: "New Kingston",
          key1: "green",
          val: 19371481044894.45
        },
        {
          key0: "Durazno",
          key1: "gray",
          val: 19222794637811.406
        },
        {
          key0: "Ksar Chellala",
          key1: "white",
          val: 19169731265467.227
        },
        {
          key0: "Nowra",
          key1: "black",
          val: 19165995135397.48
        },
        {
          key0: "Temse",
          key1: "yellow",
          val: 19037405251517.652
        },
        {
          key0: "Hungund",
          key1: "yellow",
          val: 18929662306849.19
        },
        {
          key0: "Hendala",
          key1: "yellow",
          val: 18865606186034.36
        },
        {
          key0: "Landshut",
          key1: "green",
          val: 18834900517027.992
        },
        {
          key0: "Nowra",
          key1: "gray",
          val: 18831252048821.637
        },
        {
          key0: "Yamada",
          key1: "white",
          val: 18776042749314.445
        },
        {
          key0: "Losheim",
          key1: "gray",
          val: 18678725461378.918
        },
        {
          key0: "Nowra",
          key1: "white",
          val: 18570401694533.387
        },
        {
          key0: "Losser",
          key1: "green",
          val: 18460232047425.836
        },
        {
          key0: "Mvomero",
          key1: "gray",
          val: 18232189153820.06
        },
        {
          key0: "Palafrugell",
          key1: "white",
          val: 18102307613592.848
        },
        {
          key0: "Chiguayante",
          key1: "black",
          val: 17962470961298.473
        },
        {
          key0: "Espoo",
          key1: "yellow",
          val: 17742516737659.414
        },
        {
          key0: "Les Olives",
          key1: "white",
          val: 17703891997134.77
        },
        {
          key0: "Bordj Zemoura",
          key1: "black",
          val: 17664554243003.734
        },
        {
          key0: "Hungund",
          key1: "white",
          val: 17581341658175.152
        },
        {
          key0: "Soure",
          key1: "green",
          val: 17530061885213.127
        },
        {
          key0: "Robertsonpet",
          key1: "green",
          val: 17404742414454.508
        },
        {
          key0: "Palafrugell",
          key1: "yellow",
          val: 17218288065593.47
        },
        {
          key0: "Caravaca",
          key1: "black",
          val: 17029538290811.701
        },
        {
          key0: "Jaruco",
          key1: "gray",
          val: 17003275443882.701
        },
        {
          key0: "Talavera de la Reina",
          key1: "white",
          val: 16759375430749.584
        },
        {
          key0: "Losheim",
          key1: "yellow",
          val: 16438981305251.639
        },
        {
          key0: "Montecchio Maggiore-Alte Ceccato",
          key1: "black",
          val: 16423839309132.96
        },
        {
          key0: "Jaruco",
          key1: "white",
          val: 16406061522753.674
        },
        {
          key0: "Idenao",
          key1: "white",
          val: 16392970537163.18
        },
        {
          key0: "Ilesa",
          key1: "green",
          val: 16215548691266.666
        },
        {
          key0: "Great Wyrley",
          key1: "black",
          val: 16198574810386.318
        },
        {
          key0: "Damnoen Saduak",
          key1: "green",
          val: 16174193092879.89
        },
        {
          key0: "Shepetivka",
          key1: "green",
          val: 15983846994008.236
        },
        {
          key0: "Smolyan",
          key1: "gray",
          val: 15963640261007.838
        },
        {
          key0: "Jhol",
          key1: "yellow",
          val: 15947113709184.31
        },
        {
          key0: "Ilesa",
          key1: "All Others",
          val: 15919213849578.387
        },
        {
          key0: "Espoo",
          key1: "All Others",
          val: 15890067411595.979
        },
        {
          key0: "Leland",
          key1: "black",
          val: 15844713423109.092
        },
        {
          key0: "Messaad",
          key1: "black",
          val: 15825146472674.453
        },
        {
          key0: "Tandil",
          key1: "white",
          val: 15794927518696.205
        },
        {
          key0: "Robertsonpet",
          key1: "white",
          val: 15662519108844.205
        },
        {
          key0: "Espoo",
          key1: "green",
          val: 15595895219370.84
        },
        {
          key0: "Ksar Chellala",
          key1: "yellow",
          val: 15558530975720.607
        },
        {
          key0: "Palafrugell",
          key1: "green",
          val: 15557091877371.867
        },
        {
          key0: "Losser",
          key1: "black",
          val: 15396348314484.127
        },
        {
          key0: "Caravaca",
          key1: "yellow",
          val: 15347682566455.764
        },
        {
          key0: "Artsyz",
          key1: "gray",
          val: 15149205456985.027
        },
        {
          key0: "Milagro",
          key1: "white",
          val: 14915385600594.193
        },
        {
          key0: "Idenao",
          key1: "black",
          val: 14837453073615.303
        },
        {
          key0: "Edremit",
          key1: "green",
          val: 14769077078806.078
        },
        {
          key0: "Santa Gertrudes",
          key1: "All Others",
          val: 14393913264635.174
        },
        {
          key0: "Saint-Omer",
          key1: "gray",
          val: 14312529808358.846
        },
        {
          key0: "Hendala",
          key1: "gray",
          val: 14297605163871.316
        },
        {
          key0: "Hungund",
          key1: "green",
          val: 14280728547683.25
        },
        {
          key0: "Odessa",
          key1: "All Others",
          val: 14227889789318.066
        },
        {
          key0: "Bobigny",
          key1: "gray",
          val: 14216070860923.695
        },
        {
          key0: "Valletta",
          key1: "black",
          val: 14100183148439.295
        },
        {
          key0: "Biu",
          key1: "white",
          val: 13991648147085.57
        },
        {
          key0: "Edremit",
          key1: "gray",
          val: 13933706279099.348
        },
        {
          key0: "Elamanchili",
          key1: "yellow",
          val: 13925285245100.045
        },
        {
          key0: "Paracho de Verduzco",
          key1: "All Others",
          val: 13787653082000.967
        },
        {
          key0: "Las Gabias",
          key1: "black",
          val: 13778706699109.727
        },
        {
          key0: "Larkana",
          key1: "green",
          val: 13755674641473.035
        },
        {
          key0: "Montecchio Maggiore-Alte Ceccato",
          key1: "white",
          val: 13670051996845.895
        },
        {
          key0: "Narva",
          key1: "All Others",
          val: 13639787134565.781
        },
        {
          key0: "Randudongkal",
          key1: "All Others",
          val: 13552290826508.617
        },
        {
          key0: "Temse",
          key1: "All Others",
          val: 13547537098905.352
        },
        {
          key0: "Montecchio Maggiore-Alte Ceccato",
          key1: "green",
          val: 13532078646156.77
        },
        {
          key0: "Hendala",
          key1: "black",
          val: 13502328227749.525
        },
        {
          key0: "Kidodi",
          key1: "black",
          val: 13491426195423.543
        },
        {
          key0: "Robertsonpet",
          key1: "All Others",
          val: 13378626765741.688
        },
        {
          key0: "Croix-des-Bouquets",
          key1: "white",
          val: 13304153114576.666
        },
        {
          key0: "Gaziantep",
          key1: "gray",
          val: 13294480480096.871
        },
        {
          key0: "Reus",
          key1: "All Others",
          val: 12987634227680.79
        },
        {
          key0: "Randudongkal",
          key1: "green",
          val: 12876904501223.885
        },
        {
          key0: "Petrozavodsk",
          key1: "green",
          val: 12846946955083.072
        },
        {
          key0: "Great Wyrley",
          key1: "yellow",
          val: 12818944302723.781
        },
        {
          key0: "Randudongkal",
          key1: "yellow",
          val: 12700797450898.354
        },
        {
          key0: "Mvomero",
          key1: "All Others",
          val: 12647920490487.316
        },
        {
          key0: "Teghra",
          key1: "yellow",
          val: 12591248144679.184
        },
        {
          key0: "Bibiani",
          key1: "All Others",
          val: 12536957867626.336
        },
        {
          key0: "Palafrugell",
          key1: "black",
          val: 12529559699479.674
        },
        {
          key0: "Carindale",
          key1: "gray",
          val: 12322806837164.025
        },
        {
          key0: "Kantharalak",
          key1: "All Others",
          val: 12310559326291.732
        },
        {
          key0: "Minas de Marcona",
          key1: "All Others",
          val: 12279153866492.516
        },
        {
          key0: "Paoy Paet",
          key1: "white",
          val: 11993072601977.512
        },
        {
          key0: "Huntley",
          key1: "All Others",
          val: 11988971736681.969
        },
        {
          key0: "Schleswig",
          key1: "All Others",
          val: 11894785181213.69
        },
        {
          key0: "Soure",
          key1: "black",
          val: 11868844482697.293
        },
        {
          key0: "Nowra",
          key1: "yellow",
          val: 11821773469270.205
        },
        {
          key0: "Bordj Zemoura",
          key1: "All Others",
          val: 11819262371000.533
        },
        {
          key0: "Durazno",
          key1: "green",
          val: 11742147253817.242
        },
        {
          key0: "Biu",
          key1: "green",
          val: 11675543710616.979
        },
        {
          key0: "Huntley",
          key1: "white",
          val: 11492166681131.855
        },
        {
          key0: "Franceville",
          key1: "All Others",
          val: 11381885352288.584
        },
        {
          key0: "Larkana",
          key1: "All Others",
          val: 11233987468037.418
        },
        {
          key0: "Les Olives",
          key1: "All Others",
          val: 11145808925221.916
        },
        {
          key0: "Smolyan",
          key1: "All Others",
          val: 11074341501885.863
        },
        {
          key0: "Maspalomas",
          key1: "white",
          val: 11066669869459.027
        },
        {
          key0: "Bushey",
          key1: "yellow",
          val: 11050058357662.701
        },
        {
          key0: "Gainsborough",
          key1: "white",
          val: 11040064599687.94
        },
        {
          key0: "Barbil",
          key1: "yellow",
          val: 11027437619215.64
        },
        {
          key0: "Myawadi",
          key1: "green",
          val: 10967426226287.428
        },
        {
          key0: "Myawadi",
          key1: "All Others",
          val: 10924512003410.455
        },
        {
          key0: "Chamba",
          key1: "green",
          val: 10883257939282.816
        },
        {
          key0: "Onex",
          key1: "All Others",
          val: 10847794164465.703
        },
        {
          key0: "West Des Moines",
          key1: "white",
          val: 10844541847392.934
        },
        {
          key0: "Bang Ban",
          key1: "black",
          val: 10769590746312.904
        },
        {
          key0: "Schleswig",
          key1: "yellow",
          val: 10721855786198.387
        },
        {
          key0: "Manaoag",
          key1: "All Others",
          val: 10704515171518.16
        },
        {
          key0: "Las Gabias",
          key1: "gray",
          val: 10677617410728.652
        },
        {
          key0: "Hungund",
          key1: "All Others",
          val: 10655184222699.064
        },
        {
          key0: "San Juan",
          key1: "All Others",
          val: 10541167106840.889
        },
        {
          key0: "Kalavoor",
          key1: "All Others",
          val: 10490013583094.232
        },
        {
          key0: "Nayoro",
          key1: "All Others",
          val: 10478802585757.768
        },
        {
          key0: "Larkana",
          key1: "white",
          val: 10454762527820.965
        },
        {
          key0: "Bobigny",
          key1: "white",
          val: 10391223695370.086
        },
        {
          key0: "Redding",
          key1: "All Others",
          val: 10309351076126.588
        },
        {
          key0: "Reus",
          key1: "yellow",
          val: 10274326667038.582
        },
        {
          key0: "Elamanchili",
          key1: "gray",
          val: 10175334711118.756
        },
        {
          key0: "Minas de Marcona",
          key1: "yellow",
          val: 10141138728532.555
        },
        {
          key0: "Mesagne",
          key1: "All Others",
          val: 10138266199921.217
        },
        {
          key0: "Kireyevsk",
          key1: "All Others",
          val: 10054160858796.225
        },
        {
          key0: "Minas de Marcona",
          key1: "gray",
          val: 10052406635169.492
        },
        {
          key0: "Yeysk",
          key1: "All Others",
          val: 9929044025356.059
        },
        {
          key0: "Landshut",
          key1: "gray",
          val: 9889283830392.324
        },
        {
          key0: "Sasayama",
          key1: "gray",
          val: 9878639749426.146
        },
        {
          key0: "Andijon",
          key1: "black",
          val: 9871660053957.154
        },
        {
          key0: "Kidodi",
          key1: "All Others",
          val: 9809126857741.375
        },
        {
          key0: "Gainsborough",
          key1: "All Others",
          val: 9445162011810.11
        },
        {
          key0: "Larkana",
          key1: "black",
          val: 9426248886214.568
        },
        {
          key0: "Temse",
          key1: "green",
          val: 9415247434516.385
        },
        {
          key0: "Zvenihorodka",
          key1: "white",
          val: 9383109098765.291
        },
        {
          key0: "Ariccia",
          key1: "All Others",
          val: 9306746214737.781
        },
        {
          key0: "Yamada",
          key1: "All Others",
          val: 9272033134304.164
        },
        {
          key0: "Redding",
          key1: "white",
          val: 9239960092862.9
        },
        {
          key0: "Sasayama",
          key1: "All Others",
          val: 9224041964329.125
        },
        {
          key0: "Tyler",
          key1: "All Others",
          val: 9036008794069.025
        },
        {
          key0: "Narva",
          key1: "gray",
          val: 8986989572487.785
        },
        {
          key0: "Chamba",
          key1: "All Others",
          val: 8976090622234.725
        },
        {
          key0: "Aykhal",
          key1: "black",
          val: 8862642271690.574
        },
        {
          key0: "Chamba",
          key1: "black",
          val: 8809447616277.44
        },
        {
          key0: "Bobigny",
          key1: "All Others",
          val: 8747328610983.6455
        },
        {
          key0: "Carindale",
          key1: "white",
          val: 8731495141531.875
        },
        {
          key0: "Paracho de Verduzco",
          key1: "yellow",
          val: 8649974252961.699
        },
        {
          key0: "Odessa",
          key1: "black",
          val: 8601766911493.194
        },
        {
          key0: "Chharra",
          key1: "white",
          val: 8587052990626.545
        },
        {
          key0: "Great Wyrley",
          key1: "All Others",
          val: 8547773430433.211
        },
        {
          key0: "Chiguayante",
          key1: "All Others",
          val: 8537709165771.008
        },
        {
          key0: "Yablonovskiy",
          key1: "All Others",
          val: 8505005403864.61
        },
        {
          key0: "Shepetivka",
          key1: "white",
          val: 8359098527286.148
        },
        {
          key0: "Tandil",
          key1: "All Others",
          val: 8352134111038.751
        },
        {
          key0: "Franceville",
          key1: "black",
          val: 8333951426442.37
        },
        {
          key0: "Bushey",
          key1: "white",
          val: 8325736278212.7705
        },
        {
          key0: "Chharra",
          key1: "yellow",
          val: 8315231166737.89
        },
        {
          key0: "Jaruco",
          key1: "yellow",
          val: 8259756912993.893
        },
        {
          key0: "Gaziantep",
          key1: "All Others",
          val: 8246566902225.145
        },
        {
          key0: "Santa Gertrudes",
          key1: "yellow",
          val: 8224669225673.818
        },
        {
          key0: "Losser",
          key1: "yellow",
          val: 8211950163342.846
        },
        {
          key0: "Soledade",
          key1: "All Others",
          val: 8206197396859.85
        },
        {
          key0: "Leland",
          key1: "All Others",
          val: 8039945388185.941
        },
        {
          key0: "Elamanchili",
          key1: "black",
          val: 8013112384248.48
        },
        {
          key0: "Jhol",
          key1: "All Others",
          val: 7909498556634.989
        },
        {
          key0: "Hendala",
          key1: "All Others",
          val: 7876907597780.325
        },
        {
          key0: "Gainsborough",
          key1: "black",
          val: 7856647570397.937
        },
        {
          key0: "Reus",
          key1: "black",
          val: 7752887355098.363
        },
        {
          key0: "Bushey",
          key1: "green",
          val: 7715105712379.383
        },
        {
          key0: "Thenia",
          key1: "black",
          val: 7686974603312.243
        },
        {
          key0: "Caravaca",
          key1: "All Others",
          val: 7655217460741.162
        },
        {
          key0: "Narva",
          key1: "green",
          val: 7635816161155.274
        },
        {
          key0: "Ksar Chellala",
          key1: "All Others",
          val: 7632870902929.562
        },
        {
          key0: "Thenia",
          key1: "gray",
          val: 7475020520218.236
        },
        {
          key0: "Chharra",
          key1: "All Others",
          val: 7469819792559.582
        },
        {
          key0: "Soledade",
          key1: "gray",
          val: 7348525450243.149
        },
        {
          key0: "Tupelo",
          key1: "All Others",
          val: 7333957712925.878
        },
        {
          key0: "Sillanwali",
          key1: "All Others",
          val: 7315501127919.682
        },
        {
          key0: "Ilesa",
          key1: "yellow",
          val: 7298321780408.578
        },
        {
          key0: "Carindale",
          key1: "All Others",
          val: 7145006434063.837
        },
        {
          key0: "West Des Moines",
          key1: "green",
          val: 7138763518292.075
        },
        {
          key0: "Elamanchili",
          key1: "All Others",
          val: 7118963669174.368
        },
        {
          key0: "Thetford",
          key1: "All Others",
          val: 7116872822897.816
        },
        {
          key0: "Kireyevsk",
          key1: "green",
          val: 7106797127172.604
        },
        {
          key0: "Bang Ban",
          key1: "All Others",
          val: 7101944834331.214
        },
        {
          key0: "Hungund",
          key1: "black",
          val: 7028064411800.85
        },
        {
          key0: "Robertsonpet",
          key1: "black",
          val: 6966395296145.8125
        },
        {
          key0: "Saint-Omer",
          key1: "white",
          val: 6959642580978.068
        },
        {
          key0: "Andijon",
          key1: "white",
          val: 6948225199565.004
        },
        {
          key0: "Sasayama",
          key1: "black",
          val: 6943430237702.367
        },
        {
          key0: "Bibiani",
          key1: "black",
          val: 6925468415783.242
        },
        {
          key0: "Bibiani",
          key1: "white",
          val: 6902206604205.407
        },
        {
          key0: "Mudanya",
          key1: "black",
          val: 6789443738582.1455
        },
        {
          key0: "Barbil",
          key1: "All Others",
          val: 6732666953611.982
        },
        {
          key0: "Las Gabias",
          key1: "green",
          val: 6727721944815.758
        },
        {
          key0: "Zvenihorodka",
          key1: "All Others",
          val: 6624318745366.723
        },
        {
          key0: "Losser",
          key1: "gray",
          val: 6532991017955.483
        },
        {
          key0: "Kalavoor",
          key1: "black",
          val: 6507263310668.336
        },
        {
          key0: "Isfahan",
          key1: "All Others",
          val: 6418954576727.22
        },
        {
          key0: "Shepetivka",
          key1: "black",
          val: 6389043830284.689
        },
        {
          key0: "Valletta",
          key1: "All Others",
          val: 6267536354464.5205
        },
        {
          key0: "Segundo Ensanche",
          key1: "All Others",
          val: 6215254641884.506
        },
        {
          key0: "Edremit",
          key1: "All Others",
          val: 6199051395739.688
        },
        {
          key0: "Jaruco",
          key1: "All Others",
          val: 6127280260414.956
        },
        {
          key0: "Tupelo",
          key1: "white",
          val: 6095902403062.087
        },
        {
          key0: "Kidodi",
          key1: "yellow",
          val: 6071995416681.462
        },
        {
          key0: "Espoo",
          key1: "gray",
          val: 5939575203042.963
        },
        {
          key0: "Yamada",
          key1: "black",
          val: 5927983042949.146
        },
        {
          key0: "Randudongkal",
          key1: "white",
          val: 5910938418729.449
        },
        {
          key0: "Kireyevsk",
          key1: "gray",
          val: 5884136331496.301
        },
        {
          key0: "Montecchio Maggiore-Alte Ceccato",
          key1: "All Others",
          val: 5878430910664.246
        },
        {
          key0: "Thetford",
          key1: "green",
          val: 5803431762667.3
        },
        {
          key0: "Recife",
          key1: "green",
          val: 5796393791360.656
        },
        {
          key0: "Tandil",
          key1: "green",
          val: 5731659284207.325
        },
        {
          key0: "Smolyan",
          key1: "yellow",
          val: 5705568405696.654
        },
        {
          key0: "Mesagne",
          key1: "white",
          val: 5607989982230.482
        },
        {
          key0: "Idenao",
          key1: "All Others",
          val: 5546768220367.682
        },
        {
          key0: "Leland",
          key1: "white",
          val: 5541877051400.327
        },
        {
          key0: "Durazno",
          key1: "All Others",
          val: 5525834686340.413
        },
        {
          key0: "Chamba",
          key1: "gray",
          val: 5257058438977.549
        },
        {
          key0: "Chiguayante",
          key1: "white",
          val: 5234743892158.424
        },
        {
          key0: "Milagro",
          key1: "yellow",
          val: 5188400811220.53
        },
        {
          key0: "Tupelo",
          key1: "gray",
          val: 5131836144613.677
        },
        {
          key0: "Talavera de la Reina",
          key1: "All Others",
          val: 5060598947878.438
        },
        {
          key0: "Huntley",
          key1: "yellow",
          val: 4905845414615.784
        },
        {
          key0: "Artsyz",
          key1: "All Others",
          val: 4752192279317.487
        },
        {
          key0: "Bushey",
          key1: "All Others",
          val: 4750212287510.687
        },
        {
          key0: "Milagro",
          key1: "All Others",
          val: 4722780505078.091
        },
        {
          key0: "Kantharalak",
          key1: "yellow",
          val: 4719787147835.195
        },
        {
          key0: "Valletta",
          key1: "green",
          val: 4609389215619.592
        },
        {
          key0: "Saint-Omer",
          key1: "All Others",
          val: 4590889524833.099
        },
        {
          key0: "Kireyevsk",
          key1: "black",
          val: 4554446379819.721
        },
        {
          key0: "Mudanya",
          key1: "All Others",
          val: 4431816226115.129
        },
        {
          key0: "Biu",
          key1: "All Others",
          val: 4338516889693.647
        },
        {
          key0: "Losser",
          key1: "All Others",
          val: 4311645376885.087
        },
        {
          key0: "West Des Moines",
          key1: "All Others",
          val: 4265211250383.468
        },
        {
          key0: "Damnoen Saduak",
          key1: "All Others",
          val: 4203030706900.404
        },
        {
          key0: "Schleswig",
          key1: "white",
          val: 4130789265233.2524
        },
        {
          key0: "Ksar Chellala",
          key1: "gray",
          val: 4110585305285.661
        },
        {
          key0: "Shepetivka",
          key1: "All Others",
          val: 4027377677679.879
        },
        {
          key0: "Las Gabias",
          key1: "All Others",
          val: 3985985448708.4165
        },
        {
          key0: "Petrozavodsk",
          key1: "gray",
          val: 3886186599522.5537
        },
        {
          key0: "Hendala",
          key1: "white",
          val: 3881181221819.6875
        },
        {
          key0: "Losser",
          key1: "white",
          val: 3880036304938.1743
        },
        {
          key0: "Bang Ban",
          key1: "gray",
          val: 3854510579861.6343
        },
        {
          key0: "Leland",
          key1: "gray",
          val: 3806609819432.673
        },
        {
          key0: "Valletta",
          key1: "white",
          val: 3776402539124.5703
        },
        {
          key0: "Messaad",
          key1: "All Others",
          val: 3707512895914.5894
        },
        {
          key0: "Paoy Paet",
          key1: "All Others",
          val: 3706486394083.988
        },
        {
          key0: "Losheim",
          key1: "All Others",
          val: 3626078445566.79
        },
        {
          key0: "Olupona",
          key1: "All Others",
          val: 3591801200272.379
        },
        {
          key0: "Aykhal",
          key1: "All Others",
          val: 3460077849996.972
        },
        {
          key0: "Soure",
          key1: "white",
          val: 3447177865594.4116
        },
        {
          key0: "Petrozavodsk",
          key1: "All Others",
          val: 3436491720931.9023
        },
        {
          key0: "Soledade",
          key1: "green",
          val: 3420142669983.8267
        },
        {
          key0: "Hendala",
          key1: "green",
          val: 3383634056046.321
        },
        {
          key0: "Thenia",
          key1: "All Others",
          val: 3343819118099.077
        },
        {
          key0: "Teghra",
          key1: "gray",
          val: 3324150779239.936
        },
        {
          key0: "Croix-des-Bouquets",
          key1: "All Others",
          val: 3308562304381.675
        },
        {
          key0: "Sangla Hill",
          key1: "All Others",
          val: 3276923273775.169
        },
        {
          key0: "Onex",
          key1: "black",
          val: 3104666143253.458
        },
        {
          key0: "Andijon",
          key1: "All Others",
          val: 3001676190348.0225
        },
        {
          key0: "Landshut",
          key1: "All Others",
          val: 2998915830428.4272
        },
        {
          key0: "Bushey",
          key1: "black",
          val: 2812509132569.193
        },
        {
          key0: "Biu",
          key1: "gray",
          val: 2811046110024.207
        },
        {
          key0: "Leland",
          key1: "yellow",
          val: 2667259928686.7114
        },
        {
          key0: "Tupelo",
          key1: "black",
          val: 2513876037909.2104
        },
        {
          key0: "Jhol",
          key1: "white",
          val: 2399502514031.127
        },
        {
          key0: "Recife",
          key1: "All Others",
          val: 2393766698114.2085
        },
        {
          key0: "New Kingston",
          key1: "All Others",
          val: 2391574816918.6196
        },
        {
          key0: "Shepetivka",
          key1: "gray",
          val: 2352732020686.083
        },
        {
          key0: "Redding",
          key1: "gray",
          val: 2337674806180.507
        },
        {
          key0: "Reus",
          key1: "green",
          val: 2284728440313.7285
        },
        {
          key0: "Carindale",
          key1: "black",
          val: 2248471398919.3843
        },
        {
          key0: "Beni Douala",
          key1: "All Others",
          val: 2192046345413.788
        },
        {
          key0: "Maspalomas",
          key1: "All Others",
          val: 2161653536561.8337
        },
        {
          key0: "Olupona",
          key1: "gray",
          val: 2006355509491.158
        },
        {
          key0: "Isfahan",
          key1: "black",
          val: 1952279275435.6448
        },
        {
          key0: "Palafrugell",
          key1: "All Others",
          val: 1925933897241.4104
        },
        {
          key0: "San Juan",
          key1: "yellow",
          val: 1849282555346.6365
        },
        {
          key0: "Nowra",
          key1: "All Others",
          val: 1833244052483.9246
        },
        {
          key0: "Sangla Hill",
          key1: "black",
          val: 1754556080269.584
        },
        {
          key0: "Gainsborough",
          key1: "yellow",
          val: 1610651035102.0989
        },
        {
          key0: "Jaruco",
          key1: "green",
          val: 1224642898700.264
        },
        {
          key0: "Milagro",
          key1: "black",
          val: 1187825648769.1697
        },
        {
          key0: "Tyler",
          key1: "gray",
          val: 1180599719364.6345
        },
        {
          key0: "San Juan",
          key1: "green",
          val: 1146869567205.6953
        },
        {
          key0: "Smolyan",
          key1: "white",
          val: 1121297029293.346
        },
        {
          key0: "Kantharalak",
          key1: "white",
          val: 1119073919438.769
        },
        {
          key0: "Edremit",
          key1: "white",
          val: 1097022887443.0365
        },
        {
          key0: "Zvenihorodka",
          key1: "green",
          val: 1093936590569.9105
        },
        {
          key0: "Great Wyrley",
          key1: "green",
          val: 1090452210883.9674
        },
        {
          key0: "Houthalen",
          key1: "All Others",
          val: 1037163604206.836
        },
        {
          key0: "Yablonovskiy",
          key1: "gray",
          val: 862047187906.7896
        },
        {
          key0: "Damnoen Saduak",
          key1: "white",
          val: 825488905900.0435
        },
        {
          key0: "Teghra",
          key1: "All Others",
          val: 520150312966.85077
        },
        {
          key0: "Isfahan",
          key1: "gray",
          val: 121914574983.34929
        },
        {
          key0: "Mvomero",
          key1: "green",
          val: -140388984252.1934
        },
        {
          key0: "Espoo",
          key1: "black",
          val: -198982563964.9786
        },
        {
          key0: "Elamanchili",
          key1: "white",
          val: -215856642717.0112
        },
        {
          key0: "Idenao",
          key1: "gray",
          val: -258634056732.69504
        },
        {
          key0: "Redding",
          key1: "black",
          val: -371840698540.73126
        },
        {
          key0: "Odessa",
          key1: "white",
          val: -445100699859.4197
        },
        {
          key0: "Carindale",
          key1: "yellow",
          val: -559401256768.1855
        },
        {
          key0: "Messaad",
          key1: "white",
          val: -568190793612.0256
        },
        {
          key0: "Gaziantep",
          key1: "black",
          val: -604460311037.9609
        },
        {
          key0: "Landshut",
          key1: "black",
          val: -684997010595.3
        },
        {
          key0: "Minas de Marcona",
          key1: "black",
          val: -721184730767.4358
        },
        {
          key0: "Thetford",
          key1: "yellow",
          val: -763637706341.744
        },
        {
          key0: "Nayoro",
          key1: "yellow",
          val: -790807558260.9032
        },
        {
          key0: "Thetford",
          key1: "gray",
          val: -1034942078227.6324
        },
        {
          key0: "Soure",
          key1: "All Others",
          val: -1124602586550.4307
        },
        {
          key0: "Olupona",
          key1: "yellow",
          val: -1244541884918.9705
        },
        {
          key0: "Onex",
          key1: "white",
          val: -1347826917082.7437
        },
        {
          key0: "Franceville",
          key1: "gray",
          val: -1413258860757.8638
        },
        {
          key0: "Yablonovskiy",
          key1: "black",
          val: -1423113684321.4934
        },
        {
          key0: "Bordj Zemoura",
          key1: "gray",
          val: -1435378356085.0059
        },
        {
          key0: "Valletta",
          key1: "gray",
          val: -1582517122280.7083
        },
        {
          key0: "Saint-Omer",
          key1: "green",
          val: -1610294945811.5288
        },
        {
          key0: "Artsyz",
          key1: "white",
          val: -1646077261669.4216
        },
        {
          key0: "Redding",
          key1: "green",
          val: -1675720024031.0466
        },
        {
          key0: "Manaoag",
          key1: "white",
          val: -1963099827323.708
        },
        {
          key0: "Bibiani",
          key1: "green",
          val: -2065133761217.1326
        },
        {
          key0: "Redding",
          key1: "yellow",
          val: -2195046383864.6575
        },
        {
          key0: "Manaoag",
          key1: "green",
          val: -2278192592997.142
        },
        {
          key0: "Gaziantep",
          key1: "yellow",
          val: -2330411379076.64
        },
        {
          key0: "Chamba",
          key1: "yellow",
          val: -2356069898398.6123
        },
        {
          key0: "Robertsonpet",
          key1: "gray",
          val: -2535951294362.9985
        },
        {
          key0: "Ilesa",
          key1: "gray",
          val: -2769928108550.62
        },
        {
          key0: "Elamanchili",
          key1: "green",
          val: -2934074093266.2705
        },
        {
          key0: "Tupelo",
          key1: "green",
          val: -3140661546576.09
        },
        {
          key0: "Onex",
          key1: "green",
          val: -3141766556711.9297
        },
        {
          key0: "Temse",
          key1: "gray",
          val: -3187358241164.7856
        },
        {
          key0: "Houthalen",
          key1: "gray",
          val: -3198077821219.2393
        },
        {
          key0: "Mvomero",
          key1: "black",
          val: -3464293830965.9453
        },
        {
          key0: "Milagro",
          key1: "gray",
          val: -3834660648875.419
        },
        {
          key0: "Huntley",
          key1: "green",
          val: -4030708578267.422
        },
        {
          key0: "Mudanya",
          key1: "white",
          val: -4044626307011.4385
        },
        {
          key0: "Damnoen Saduak",
          key1: "gray",
          val: -4066042024146.0522
        },
        {
          key0: "Kireyevsk",
          key1: "yellow",
          val: -4096276868445.0747
        },
        {
          key0: "Nayoro",
          key1: "black",
          val: -4186174702592.617
        },
        {
          key0: "Chharra",
          key1: "green",
          val: -4215349210158.2876
        },
        {
          key0: "Mvomero",
          key1: "white",
          val: -4540999453152.245
        },
        {
          key0: "Smolyan",
          key1: "green",
          val: -4601259059838.502
        },
        {
          key0: "Mudanya",
          key1: "gray",
          val: -4617181430057.569
        },
        {
          key0: "Kalavoor",
          key1: "white",
          val: -4740870952651.477
        },
        {
          key0: "Odessa",
          key1: "green",
          val: -4789246885008.147
        },
        {
          key0: "Gainsborough",
          key1: "gray",
          val: -4804533900462.313
        },
        {
          key0: "Les Olives",
          key1: "gray",
          val: -5162097530623.148
        },
        {
          key0: "Durazno",
          key1: "white",
          val: -5355385352174.715
        },
        {
          key0: "San Juan",
          key1: "gray",
          val: -5518367319091.825
        },
        {
          key0: "Gaziantep",
          key1: "green",
          val: -5636020900249.639
        },
        {
          key0: "Jaruco",
          key1: "black",
          val: -5802037742516.074
        },
        {
          key0: "Santa Gertrudes",
          key1: "green",
          val: -5903123209835.742
        },
        {
          key0: "Kalavoor",
          key1: "gray",
          val: -6132481998774.833
        },
        {
          key0: "Nayoro",
          key1: "white",
          val: -6421098914823.208
        },
        {
          key0: "Yeysk",
          key1: "white",
          val: -6481230632048.088
        },
        {
          key0: "Maspalomas",
          key1: "yellow",
          val: -6521927899958.603
        },
        {
          key0: "Myawadi",
          key1: "black",
          val: -6569780209095.112
        },
        {
          key0: "Tandil",
          key1: "gray",
          val: -6652679890758.761
        },
        {
          key0: "Temse",
          key1: "white",
          val: -6711013803850.973
        },
        {
          key0: "Isfahan",
          key1: "yellow",
          val: -6972982136608.788
        },
        {
          key0: "West Des Moines",
          key1: "yellow",
          val: -7182628490587.189
        },
        {
          key0: "Kantharalak",
          key1: "black",
          val: -7518825232439.354
        },
        {
          key0: "Nayoro",
          key1: "green",
          val: -7589692107693.029
        },
        {
          key0: "Yamada",
          key1: "green",
          val: -7835473068604.593
        },
        {
          key0: "Schleswig",
          key1: "black",
          val: -8042320648898.048
        },
        {
          key0: "Bang Ban",
          key1: "yellow",
          val: -8101389505533.438
        },
        {
          key0: "Chamba",
          key1: "white",
          val: -8250171673039.788
        },
        {
          key0: "Bordj Zemoura",
          key1: "white",
          val: -8395177621079.058
        },
        {
          key0: "Segundo Ensanche",
          key1: "gray",
          val: -8505235142559.467
        },
        {
          key0: "Franceville",
          key1: "yellow",
          val: -8507140081597.613
        },
        {
          key0: "Randudongkal",
          key1: "black",
          val: -8775497951869.759
        },
        {
          key0: "Bobigny",
          key1: "black",
          val: -8871236686454.35
        },
        {
          key0: "Santa Gertrudes",
          key1: "gray",
          val: -9331291154896.87
        },
        {
          key0: "Narva",
          key1: "white",
          val: -9640440585439.578
        },
        {
          key0: "Barbil",
          key1: "white",
          val: -9815126839431.168
        },
        {
          key0: "Paoy Paet",
          key1: "green",
          val: -9838622893458.145
        },
        {
          key0: "Thenia",
          key1: "yellow",
          val: -9928798317957.762
        },
        {
          key0: "Las Gabias",
          key1: "white",
          val: -10135078418522.672
        },
        {
          key0: "Les Olives",
          key1: "green",
          val: -10317960364542.145
        },
        {
          key0: "Sillanwali",
          key1: "green",
          val: -10695919880813.283
        },
        {
          key0: "Messaad",
          key1: "green",
          val: -11098714854211.53
        },
        {
          key0: "Paoy Paet",
          key1: "black",
          val: -11388834581922.143
        },
        {
          key0: "Sangla Hill",
          key1: "white",
          val: -11667214780730.488
        },
        {
          key0: "Croix-des-Bouquets",
          key1: "gray",
          val: -11710917148339.992
        },
        {
          key0: "Odessa",
          key1: "gray",
          val: -12002762861425.72
        },
        {
          key0: "Ilesa",
          key1: "black",
          val: -12079114201074.564
        },
        {
          key0: "Recife",
          key1: "yellow",
          val: -12210173612624.078
        },
        {
          key0: "Chiguayante",
          key1: "gray",
          val: -12398417929953.746
        },
        {
          key0: "Manaoag",
          key1: "gray",
          val: -13010219127013.13
        },
        {
          key0: "Thetford",
          key1: "white",
          val: -14032140651521.635
        },
        {
          key0: "Larkana",
          key1: "gray",
          val: -14213286347479.227
        },
        {
          key0: "New Kingston",
          key1: "white",
          val: -14819381046934.87
        },
        {
          key0: "Randudongkal",
          key1: "gray",
          val: -15057871541523.312
        },
        {
          key0: "Odessa",
          key1: "yellow",
          val: -15317786458490.33
        },
        {
          key0: "Beni Douala",
          key1: "yellow",
          val: -15363613446146.11
        },
        {
          key0: "Bang Ban",
          key1: "white",
          val: -15479451464268.723
        },
        {
          key0: "Caravaca",
          key1: "green",
          val: -15520262618023.541
        },
        {
          key0: "Segundo Ensanche",
          key1: "black",
          val: -15631420005617.777
        },
        {
          key0: "Larkana",
          key1: "yellow",
          val: -15739883353875.385
        },
        {
          key0: "Soledade",
          key1: "black",
          val: -15785100457721.877
        },
        {
          key0: "Mesagne",
          key1: "black",
          val: -16021903615811.914
        },
        {
          key0: "Chiguayante",
          key1: "yellow",
          val: -16123751707679.754
        },
        {
          key0: "Kireyevsk",
          key1: "white",
          val: -16128204140175.414
        },
        {
          key0: "Segundo Ensanche",
          key1: "white",
          val: -16138600007276.184
        },
        {
          key0: "Kantharalak",
          key1: "gray",
          val: -16285135107718.04
        },
        {
          key0: "Temse",
          key1: "black",
          val: -16605785013868.576
        },
        {
          key0: "Reus",
          key1: "gray",
          val: -16617716829259.389
        },
        {
          key0: "Ariccia",
          key1: "green",
          val: -16754693149269.83
        },
        {
          key0: "Kalavoor",
          key1: "yellow",
          val: -17028802714427.398
        },
        {
          key0: "Kidodi",
          key1: "white",
          val: -17141479706636.55
        },
        {
          key0: "Minas de Marcona",
          key1: "green",
          val: -17143584331240.523
        },
        {
          key0: "Zvenihorodka",
          key1: "black",
          val: -17490302210880.031
        },
        {
          key0: "Tyler",
          key1: "yellow",
          val: -17630978774777.12
        },
        {
          key0: "Jhol",
          key1: "black",
          val: -17936856623392.023
        },
        {
          key0: "Yeysk",
          key1: "gray",
          val: -18466378485363.87
        },
        {
          key0: "Bordj Zemoura",
          key1: "green",
          val: -18547913046776.6
        },
        {
          key0: "Beni Douala",
          key1: "green",
          val: -18567778888582.953
        },
        {
          key0: "Losheim",
          key1: "white",
          val: -18593832465225.793
        },
        {
          key0: "Sillanwali",
          key1: "gray",
          val: -18643578820046.363
        },
        {
          key0: "Onex",
          key1: "gray",
          val: -19043249590521.22
        },
        {
          key0: "Les Olives",
          key1: "black",
          val: -19251761110793.438
        },
        {
          key0: "Ksar Chellala",
          key1: "black",
          val: -19385155753717.445
        },
        {
          key0: "Bordj Zemoura",
          key1: "yellow",
          val: -19845888092210.72
        },
        {
          key0: "Huntley",
          key1: "black",
          val: -19918212639860.32
        },
        {
          key0: "Narva",
          key1: "black",
          val: -20262000302175.066
        },
        {
          key0: "Franceville",
          key1: "white",
          val: -20415997381977.723
        },
        {
          key0: "Barbil",
          key1: "gray",
          val: -20627836005774.81
        },
        {
          key0: "Ariccia",
          key1: "gray",
          val: -21284333309042.4
        },
        {
          key0: "Caravaca",
          key1: "white",
          val: -21347442522918.727
        },
        {
          key0: "Paracho de Verduzco",
          key1: "gray",
          val: -22097121826671.555
        },
        {
          key0: "Ariccia",
          key1: "yellow",
          val: -22344896279871.83
        },
        {
          key0: "Smolyan",
          key1: "black",
          val: -22918961916512.777
        },
        {
          key0: "Maspalomas",
          key1: "black",
          val: -23733373280575.08
        },
        {
          key0: "Paracho de Verduzco",
          key1: "white",
          val: -23756044606092.9
        },
        {
          key0: "Yablonovskiy",
          key1: "white",
          val: -24072495046528.254
        },
        {
          key0: "Edremit",
          key1: "yellow",
          val: -26216962065176.633
        },
        {
          key0: "Aykhal",
          key1: "yellow",
          val: -26289704089742.504
        },
        {
          key0: "Great Wyrley",
          key1: "white",
          val: -26938760224933.91
        },
        {
          key0: "Espoo",
          key1: "white",
          val: -30374307927482.465
        },
        {
          key0: "Minas de Marcona",
          key1: "white",
          val: -31601054597702.67
        },
        {
          key0: "San Juan",
          key1: "black",
          val: -32222815383967.418
        },
        {
          key0: "Bobigny",
          key1: "yellow",
          val: -32247916995757.55
        },
        {
          key0: "Artsyz",
          key1: "green",
          val: -32683519186829.516
        },
        {
          key0: "Robertsonpet",
          key1: "yellow",
          val: -34124498569912.617
        },
        {
          key0: "Sasayama",
          key1: "yellow",
          val: -36390073716969.7
        },
        {
          key0: "Myawadi",
          key1: "white",
          val: -37485573362695.55
        },
        {
          key0: "Santa Gertrudes",
          key1: "white",
          val: -39139752960164.84
        },
        {
          key0: "Tyler",
          key1: "green",
          val: -41304205675608.555
        },
        {
          key0: "Yeysk",
          key1: "black",
          val: -43788886419908.83
        }
      ]
    },
    "5": {
      dataSource: null,
      autoSize: true,
      areFiltersInverse: false,
      cap: 12,
      renderArea: false,
      color: {
        "0": {
          type: "custom",
          key: "blue",
          val: ["#27aeef"],
          column: "Measures",
          customKey: "key1",
          isCustom: true,
          customDomain: ["# Records"],
          customRange: ["#27aeef"],
          lineStyles: ["solid"],
          defaultOtherDomain: "other",
          defaultOtherRange: "#27aeef"
        },
        "1": {
          type: "custom",
          key: "blue",
          val: ["#27aeef"],
          column: "Measures",
          customKey: "key1",
          isCustom: true,
          customDomain: ["col_big_1"],
          customRange: ["#ea5545"],
          lineStyles: ["solid"],
          defaultOtherDomain: "other",
          defaultOtherRange: "#27aeef"
        },
        customDomain: [],
        isCustom: false,
        defaultOtherDomain: "other",
        defaultOtherRange: "#27aeef"
      },
      colorDomain: null,
      dataSelections: [
        {
          layerId: "-MnM9qCDZFY_Q8USEOkH",
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
      selectedLayerId: "-MnM9qCDZFY_Q8USEOkH",
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
          percentageDistributionEnabled: false
        },
        sizeMeasureSecondaryAxis: {
          cumulativeDistributionEnabled: false,
          percentageDistributionEnabled: false
        }
      },
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
          name: "X Axis",
          table: "flights",
          type: "SMALLINT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "actualelapsedtime",
          value: "actualelapsedtime",
          custom: false,
          axisLabel: null,
          extract: false,
          loading: false,
          timeBin: null,
          min_val: -719,
          max_val: 1883,
          currentLowValue: -719,
          currentHighValue: 1879,
          cardinality: 1078,
          isBinned: true,
          isBinnable: true,
          autobin: true,
          maxBinSize: 250,
          numOfBins: 12,
          multiSourceIndex: 0
        },
        {
          inactive: false,
          name: "Color",
          isRequired: false,
          isError: false,
          showOther: true,
          multiSourceIndex: 0
        },
        {
          isError: false,
          isRequired: false,
          inactive: false,
          name: "X Axis",
          multiSourceIndex: 1,
          table: "data_types_basic3",
          type: "DECIMAL",
          precision: 8,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "col_decimal_1",
          value: "col_decimal_1",
          custom: false,
          axisLabel: null,
          extract: false,
          loading: false,
          timeBin: null,
          isBinned: true,
          min_val: -1808.46,
          max_val: 8499.61,
          currentLowValue: -1808.46,
          currentHighValue: 8499.61,
          cardinality: 65,
          isBinnable: true,
          autobin: true,
          maxBinSize: 250,
          numOfBins: 12
        },
        {
          inactive: false,
          name: "Color",
          isError: false,
          isRequired: false,
          multiSourceIndex: 1,
          table: "data_types_basic3",
          type: "STR",
          precision: 0,
          is_array: false,
          is_dict: true,
          name_is_ambiguous: false,
          label: "state_name",
          value: "state_name",
          custom: false,
          axisLabel: null,
          max_val: null,
          min_val: null,
          maxBinSize: null,
          currentHighValue: null,
          currentLowValue: null,
          autobin: false,
          numOfBins: null,
          isBinned: false,
          isBinnable: false
        }
      ],
      elasticX: true,
      elasticY: true,
      filters: [],
      geoJson: null,
      loading: false,
      measures: [
        {
          inactive: false,
          name: "series_1",
          isRequired: true,
          isError: false,
          label: "# Records",
          value: "*",
          type: "SMALLINT",
          custom: false,
          axisLabel: null,
          categories: null,
          multiSourceIndex: 0,
          colorType: "quantitative",
          aggType: "Count",
          originIndex: 0,
          yAxisOrientation: "left",
          minMax: null
        },
        {
          name: "y axis",
          yAxisOrientation: "left",
          isRequired: false,
          isError: false,
          multiSourceIndex: 0
        },
        {
          inactive: false,
          name: "series_1",
          isError: false,
          isRequired: true,
          multiSourceIndex: 1,
          table: "data_types_basic3",
          type: "BIGINT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "col_big_1",
          value: "col_big_1",
          custom: false,
          axisLabel: null,
          categories: null,
          colorType: "quantitative",
          aggType: "Max",
          originIndex: 2,
          yAxisOrientation: "right",
          minMax: null
        },
        {
          name: "y axis",
          yAxisOrientation: "left",
          multiSourceIndex: 1,
          isRequired: false,
          isError: false
        }
      ],
      rangeChartEnabled: false,
      rangeFilter: [],
      savedColors: {
        "0": {
          custom_Measures: {
            type: "custom",
            key: "blue",
            val: ["#27aeef"],
            column: "Measures",
            customKey: "key1",
            isCustom: true,
            customDomain: ["# Records"],
            customRange: ["#27aeef"],
            lineStyles: ["solid"],
            defaultOtherDomain: "other",
            defaultOtherRange: "#27aeef"
          }
        },
        "1": {
          custom_Measures: {
            type: "custom",
            key: "blue",
            val: ["#27aeef"],
            column: "Measures",
            customKey: "key1",
            isCustom: true,
            customDomain: ["col_big_1"],
            customRange: ["#ea5545"],
            lineStyles: ["solid"],
            defaultOtherDomain: "other",
            defaultOtherRange: "#27aeef"
          }
        }
      },
      sortColumn: null,
      ticks: 3,
      title: "",
      type: "line2",
      showOther: true,
      rasterShowOther: true,
      showNullDimensions: false,
      markTypes: ["line", null, "line"],
      multiSources: {
        "0": {
          table: "flights",
          index: 0
        },
        "1": {
          table: "data_types_basic3",
          index: 1
        }
      },
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
      hasError: false,
      data: {
        "0": [
          {
            key0: [-719, -502.5],
            val: 13
          },
          {
            key0: [-502.5, -286],
            val: 6
          },
          {
            key0: [-286, -69.5],
            val: 28
          },
          {
            key0: [-69.5, 147],
            val: 86032344
          },
          {
            key0: [147, 363.5],
            val: 30332003
          },
          {
            key0: [363.5, 580],
            val: 530801
          },
          {
            key0: [580, 796.5],
            val: 1107
          },
          {
            key0: [796.5, 1013],
            val: 16
          },
          {
            key0: [1013, 1229.5],
            val: 6
          },
          {
            key0: [1229.5, 1446],
            val: 11
          },
          {
            key0: [1446, 1662.5],
            val: 300
          },
          {
            key0: [1662.5, 1879],
            val: 61
          }
        ],
        "1": []
      },
      isNotDc: true,
      yAxisLabel: null,
      y2AxisLabel: null,
      isLoadingData: false,
      filterString: {
        "0":
          '("flights"."dest_lon" is not null\n          AND "flights"."dest_lat" is not null\n          AND "flights"."dest_lon" >= -130.8471148 AND "flights"."dest_lon" <= 130.8471148 AND "flights"."dest_lat" >= -10.61153081 AND "flights"."dest_lat" <= 47.288459007)',
        "1":
          '(ST_XMax("data_types_basic3"."col_linestring_1") >= -179.99999\n          AND ST_XMin("data_types_basic3"."col_linestring_1") <= -78.978603118\n          AND ST_YMax("data_types_basic3"."col_linestring_1") >= 29.959010147\n          AND ST_YMin("data_types_basic3"."col_linestring_1") <= 41.145540277 AND ST_XMax("data_types_basic3"."geom_linestring") >= -179.99999\n          AND ST_XMin("data_types_basic3"."geom_linestring") <= -78.978603118\n          AND ST_YMax("data_types_basic3"."geom_linestring") >= 29.959010147\n          AND ST_YMin("data_types_basic3"."geom_linestring") <= 41.145540277) AND ST_XMax("data_types_basic3"."geom_linestring") >= -141.29174099\n          AND ST_XMin("data_types_basic3"."geom_linestring") <= -93.394168266\n          AND ST_YMax("data_types_basic3"."geom_linestring") >= 34.758530315\n          AND ST_YMin("data_types_basic3"."geom_linestring") <= 39.301704892'
      },
      percentageViewEnabled: false,
      restrictedDimensionType: "Numeric",
      basemap: {
        label: "Current Immerse Theme",
        value: "current"
      }
    },
    "6": {
      dataSource: "bad_faker_geo",
      autoSize: true,
      areFiltersInverse: false,
      cap: 12,
      renderArea: false,
      color: null,
      colorDomain: null,
      dataSelections: [
        {
          layerId: "-MnMA8D2QLHyPcvOUoJi",
          table: {
            name: "data_types_basic3"
          },
          dimensions: {
            xAxis: [
              {
                type: "column",
                table: "data_types_basic3",
                column: {
                  table: "data_types_basic3",
                  column: "col_ts9_1",
                  label: "col_ts9_1",
                  type: "TIMESTAMP",
                  precision: 9,
                  is_array: false,
                  is_dict: false,
                  name_is_ambiguous: false,
                  value: "col_ts9_1",
                  filterType: "TIMESTAMP"
                }
              }
            ],
            color: null
          },
          measures: {
            size: [
              {
                type: "column_aggregate",
                table: "data_types_basic3",
                column: {
                  table: "data_types_basic3",
                  column: "col_integer_2",
                  label: "col_integer_2",
                  type: "INT",
                  precision: 0,
                  is_array: false,
                  is_dict: false,
                  name_is_ambiguous: false,
                  value: "col_integer_2",
                  filterType: "INT"
                },
                aggregate: "Avg",
                markSettings: {
                  markType: "bar",
                  lineStyle: "solid",
                  axis: "primary",
                  markColor: "#27aeef"
                }
              }
            ],
            color: {
              type: "column_aggregate",
              table: "data_types_basic3",
              column: {
                table: "data_types_basic3",
                column: "col_big_1",
                label: "col_big_1",
                type: "BIGINT",
                precision: 0,
                is_array: false,
                is_dict: false,
                name_is_ambiguous: false,
                value: "col_big_1",
                filterType: "BIGINT"
              },
              aggregate: "Avg",
              markSettings: {
                markType: "bar",
                lineStyle: "solid",
                axis: "primary",
                markColor: "#27aeef"
              }
            }
          }
        },
        {
          layerId: "-MnMACsSQJ3kknGnFrBs",
          table: {
            name: "data_types_basic3"
          },
          dimensions: {
            xAxis: [
              {
                type: "column",
                table: "data_types_basic3",
                column: {
                  table: "data_types_basic3",
                  column: "col_double_2",
                  label: "col_double_2",
                  type: "DOUBLE",
                  precision: 0,
                  is_array: false,
                  is_dict: false,
                  name_is_ambiguous: false,
                  value: "col_double_2",
                  filterType: "DOUBLE"
                }
              }
            ],
            color: null
          },
          measures: {
            size: [
              {
                type: "column_aggregate",
                table: "data_types_basic3",
                column: {
                  table: "data_types_basic3",
                  column: "lon",
                  label: "lon",
                  type: "FLOAT",
                  precision: 0,
                  is_array: false,
                  is_dict: false,
                  name_is_ambiguous: false,
                  value: "lon",
                  filterType: "FLOAT"
                },
                aggregate: "Stddev",
                markSettings: {
                  markType: "bar",
                  lineStyle: "solid",
                  axis: "primary",
                  markColor: "#27aeef"
                }
              }
            ],
            color: null
          }
        }
      ],
      selectedLayerId: "-MnMACsSQJ3kknGnFrBs",
      vegaSortColumn: {
        col: {
          name: "dimension0"
        },
        index: 0,
        order: "asc"
      },
      presentation: {
        orientation: "column",
        baseDimensionAxis: {
          groupingMode: "grouped",
          lineAreaEnabled: false
        },
        sizeMeasurePrimaryAxis: {
          cumulativeDistributionEnabled: false,
          percentageDistributionEnabled: false
        },
        sizeMeasureSecondaryAxis: {
          cumulativeDistributionEnabled: false,
          percentageDistributionEnabled: false
        }
      },
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
      ticks: 3,
      title: "",
      type: "vega-combo",
      showOther: true,
      rasterShowOther: true,
      showNullDimensions: true,
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
      isNotDc: true,
      data: {
        focus: [
          {
            "13": {
              minmaxQuery: null,
              groupByDimensionQuery: null,
              groupByDimension: null,
              tableQuery:
                'SELECT AVG(col_integer_2) AS measure0, AVG(col_big_1) AS measureColor, col_ts9_1 AS dimension0 FROM data_types_basic3 WHERE ((ST_XMax("data_types_basic3"."col_linestring_1") >= -179.99999 AND ST_XMin("data_types_basic3"."col_linestring_1") <= -78.978603118 AND ST_YMax("data_types_basic3"."col_linestring_1") >= 29.959010147 AND ST_YMin("data_types_basic3"."col_linestring_1") <= 41.145540277 AND ST_XMax("data_types_basic3"."geom_linestring") >= -179.99999 AND ST_XMin("data_types_basic3"."geom_linestring") <= -78.978603118 AND ST_YMax("data_types_basic3"."geom_linestring") >= 29.959010147 AND ST_YMin("data_types_basic3"."geom_linestring") <= 41.145540277) AND ST_XMax("data_types_basic3"."geom_linestring") >= -141.29174099 AND ST_XMin("data_types_basic3"."geom_linestring") <= -93.394168266 AND ST_YMax("data_types_basic3"."geom_linestring") >= 34.758530315 AND ST_YMin("data_types_basic3"."geom_linestring") <= 39.301704892) GROUP BY dimension0 ORDER BY dimension0 asc NULLS LAST LIMIT 500',
              table: []
            }
          },
          {
            "14": {
              minmaxQuery: null,
              groupByDimensionQuery: null,
              groupByDimension: null,
              tableQuery:
                'SELECT STDDEV(lon) AS measure0, col_double_2 AS dimension0 FROM data_types_basic3 WHERE ((ST_XMax("data_types_basic3"."col_linestring_1") >= -179.99999 AND ST_XMin("data_types_basic3"."col_linestring_1") <= -78.978603118 AND ST_YMax("data_types_basic3"."col_linestring_1") >= 29.959010147 AND ST_YMin("data_types_basic3"."col_linestring_1") <= 41.145540277 AND ST_XMax("data_types_basic3"."geom_linestring") >= -179.99999 AND ST_XMin("data_types_basic3"."geom_linestring") <= -78.978603118 AND ST_YMax("data_types_basic3"."geom_linestring") >= 29.959010147 AND ST_YMin("data_types_basic3"."geom_linestring") <= 41.145540277) AND ST_XMax("data_types_basic3"."geom_linestring") >= -141.29174099 AND ST_XMin("data_types_basic3"."geom_linestring") <= -93.394168266 AND ST_YMax("data_types_basic3"."geom_linestring") >= 34.758530315 AND ST_YMin("data_types_basic3"."geom_linestring") <= 39.301704892) GROUP BY dimension0 ORDER BY dimension0 asc NULLS LAST LIMIT 500',
              table: []
            }
          }
        ]
      },
      basemap: {
        label: "Current Immerse Theme",
        value: "current"
      }
    },
    "7": {
      dataSource: "flights",
      autoSize: true,
      areFiltersInverse: false,
      cap: 10000000,
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
      dataSelections: [
        {
          layerId: "-Mn740O_56WuCIgg6n6E",
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
      selectedLayerId: "-Mn740O_56WuCIgg6n6E",
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
          percentageDistributionEnabled: false
        },
        sizeMeasureSecondaryAxis: {
          cumulativeDistributionEnabled: false,
          percentageDistributionEnabled: false
        }
      },
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
          inactive: false,
          name: null,
          isBinned: false,
          isBinnable: false,
          isRequired: false,
          isError: false
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
      ticks: 3,
      title: "",
      type: "pointmap",
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
      hoverSelectedColumns: [
        {
          inactive: false,
          name: "color",
          isRequired: false,
          isError: false,
          table: "flights",
          column: "abcdef_del",
          label: "abcdef_del",
          type: "SMALLINT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          value: "abcdef_del",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          minMax: [-1437, 2598],
          initMinMax: [-1437, 2598],
          hideOther: true,
          colorType: "quantitative",
          format: "custom-imperial"
        }
      ],
      active: true,
      hasError: false,
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
      layers: [
        {
          measures: [
            {
              isRequired: false,
              isError: false,
              inactive: false,
              name: "x",
              table: "flights",
              column: "dest_lon",
              label: "dest_lon",
              type: "FLOAT",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              value: "dest_lon",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              minMax: [-176.64602661132812, 145.6213836669922],
              initMinMax: [-176.64602661132812, 145.6213836669922],
              hideOther: true
            },
            {
              inactive: false,
              name: "y",
              isRequired: false,
              isError: false,
              table: "flights",
              column: "dest_lat",
              label: "dest_lat",
              type: "FLOAT",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              value: "dest_lat",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              minMax: [7.367221832275391, 71.28544616699219],
              initMinMax: [7.367221832275391, 71.28544616699219],
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
              table: "flights",
              column: "abcdef_del",
              label: "abcdef_del",
              type: "SMALLINT",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              value: "abcdef_del",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              minMax: [-1437, 2598],
              initMinMax: [-1437, 2598],
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
          dataSource: "flights",
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
              table: "flights",
              column: "abcdef_del",
              label: "abcdef_del",
              type: "SMALLINT",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              value: "abcdef_del",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              minMax: [-1437, 2598],
              initMinMax: [-1437, 2598],
              hideOther: true,
              colorType: "quantitative",
              format: "custom-imperial"
            }
          ],
          geoJoin: {},
          popupEnabled: true,
          rasterShowOther: true,
          active: true,
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
          rasterLayerId: "rasterLayerId:-Mn7RS7Ix27A4z9Knkvk"
        }
      ],
      height: 68,
      width: 276,
      mapZoomCenter: {
        zoom: -0.43136074974565775,
        center: {
          lng: 3.979039320256561e-12,
          lat: 21.07314005841937
        },
        bounds: {
          lonMin: -130.84711480005006,
          lonMax: 130.84711480005905,
          latMin: -10.611530809851956,
          latMax: 47.28845900707947
        }
      },
      measures: [
        {
          isRequired: false,
          isError: false,
          inactive: false,
          name: "x",
          table: "flights",
          column: "dest_lon",
          label: "dest_lon",
          type: "FLOAT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          value: "dest_lon",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          minMax: [-176.64602661132812, 145.6213836669922],
          initMinMax: [-176.64602661132812, 145.6213836669922],
          hideOther: true
        },
        {
          inactive: false,
          name: "y",
          isRequired: false,
          isError: false,
          table: "flights",
          column: "dest_lat",
          label: "dest_lat",
          type: "FLOAT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          value: "dest_lat",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          minMax: [7.367221832275391, 71.28544616699219],
          initMinMax: [7.367221832275391, 71.28544616699219],
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
          table: "flights",
          column: "abcdef_del",
          label: "abcdef_del",
          type: "SMALLINT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          value: "abcdef_del",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          minMax: [-1437, 2598],
          initMinMax: [-1437, 2598],
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
      basemap: {
        label: "Current Immerse Theme",
        value: "current"
      },
      dcFlag: 7893447219806961
    },
    "8": {
      dataSource: "data_types_basic3",
      autoSize: false,
      areFiltersInverse: false,
      cap: 1000000,
      renderArea: false,
      color: {
        customDomain: [false, true],
        customKey: "key0",
        customPalette: {
          red: ["#ea5545"],
          lime: ["#bdcf32"],
          purple: ["#b33dc6"],
          orange: ["#ef9b20"],
          green: ["#87bc45"],
          pink: ["#f46a9b"],
          silver: ["#ace5c7"],
          yellow: ["#ede15b"],
          purpleCool: ["#836dc5"],
          greenPastel: ["#86d87f"],
          blue: ["#27aeef"]
        },
        customRange: ["#ea5545", "#bdcf32"],
        isCustom: true,
        key: "custom",
        type: "custom",
        val: [
          "#ea5545",
          "#bdcf32",
          "#b33dc6",
          "#ef9b20",
          "#87bc45",
          "#f46a9b",
          "#ace5c7",
          "#ede15b",
          "#836dc5",
          "#86d87f",
          "#27aeef"
        ],
        column: "col_boolean_1",
        defaultOtherDomain: null,
        defaultOtherRange: null,
        hideOther: true,
        initialDomain: [false, true]
      },
      colorDomain: null,
      dataSelections: [
        {
          layerId: "-Mn747wJH0za2mhc_XNz",
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
      selectedLayerId: "-Mn747wJH0za2mhc_XNz",
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
          percentageDistributionEnabled: false
        },
        sizeMeasureSecondaryAxis: {
          cumulativeDistributionEnabled: false,
          percentageDistributionEnabled: false
        }
      },
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
          inactive: false,
          name: null,
          isRequired: false,
          isError: false
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
      ticks: 3,
      title: "",
      type: "linemap",
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
      hoverSelectedColumns: [
        {
          inactive: false,
          name: "color",
          isRequired: false,
          isError: false,
          table: "data_types_basic3",
          type: "BOOL",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "col_boolean_1",
          value: "col_boolean_1",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "# Unique",
          categories: [false, true],
          initMinMax: [false, true],
          hideOther: true,
          colorType: "ordinal",
          format: ""
        },
        {
          inactive: false,
          name: "size",
          isRequired: false,
          isError: false,
          table: "data_types_basic3",
          type: "DECIMAL",
          precision: 8,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "col_decimal_1",
          value: "col_decimal_1",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          minMax: [-1808.46, 8499.61],
          initMinMax: [-1808.46, 8499.61],
          hideOther: true,
          format: "custom-imperial"
        }
      ],
      active: true,
      hasError: false,
      layers: [
        {
          measures: [
            {
              isRequired: false,
              isError: false,
              inactive: false,
              name: "geo",
              table: "data_types_basic3",
              type: "LINESTRING",
              precision: 23,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "geom_linestring",
              value: "geom_linestring",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              categories: [
                -155.116338941788,
                -107.301426943066,
                19.8688197694108,
                48.99856178509
              ]
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
              isError: false
            }
          ],
          dimensions: [
            {
              inactive: false,
              name: null,
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
          dataSource: "data_types_basic3",
          type: "linemap",
          densityAccumulatorEnabled: true,
          autoSize: true,
          cap: 1000000,
          hoverSelectedColumns: [],
          geoJoin: {},
          popupEnabled: true,
          rasterShowOther: true,
          active: true,
          rasterLayerId: "rasterLayerId:-Mn7RS7Ix27A4z9Knkvl",
          activeZoomLevel: true
        },
        {
          rasterLayerId: "rasterLayerId:-MnMG2vBKQyPmkpDSX1t",
          measures: [
            {
              isError: false,
              name: "geo",
              isRequired: false,
              inactive: false,
              table: "data_types_basic3",
              type: "LINESTRING",
              precision: 23,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "col_linestring_1",
              value: "col_linestring_1",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              categories: [19, 63, -159, -69]
            },
            {
              inactive: false,
              name: "size",
              isRequired: false,
              isError: false,
              table: "data_types_basic3",
              type: "DECIMAL",
              precision: 8,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "col_decimal_1",
              value: "col_decimal_1",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              minMax: [-1808.46, 8499.61],
              initMinMax: [-1808.46, 8499.61],
              hideOther: true
            },
            {
              inactive: false,
              name: "color",
              isRequired: false,
              isError: false,
              table: "data_types_basic3",
              type: "BOOL",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "col_boolean_1",
              value: "col_boolean_1",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "# Unique",
              categories: [false, true],
              initMinMax: [false, true],
              hideOther: true,
              colorType: "ordinal"
            }
          ],
          dimensions: [
            {
              inactive: false,
              name: null,
              isRequired: false,
              isError: false
            }
          ],
          color: {
            customDomain: [false, true],
            customKey: "key0",
            customPalette: {
              red: ["#ea5545"],
              lime: ["#bdcf32"],
              purple: ["#b33dc6"],
              orange: ["#ef9b20"],
              green: ["#87bc45"],
              pink: ["#f46a9b"],
              silver: ["#ace5c7"],
              yellow: ["#ede15b"],
              purpleCool: ["#836dc5"],
              greenPastel: ["#86d87f"],
              blue: ["#27aeef"]
            },
            customRange: ["#ea5545", "#bdcf32"],
            isCustom: true,
            key: "custom",
            type: "custom",
            val: [
              "#ea5545",
              "#bdcf32",
              "#b33dc6",
              "#ef9b20",
              "#87bc45",
              "#f46a9b",
              "#ace5c7",
              "#ede15b",
              "#836dc5",
              "#86d87f",
              "#27aeef"
            ],
            column: "col_boolean_1",
            defaultOtherDomain: null,
            defaultOtherRange: null,
            hideOther: true,
            initialDomain: [false, true]
          },
          pixelSize: 10,
          mark: "hex",
          dataSource: "data_types_basic3",
          type: "linemap",
          densityAccumulatorEnabled: true,
          autoSize: false,
          sizeRange: [1, 3],
          cap: 1000000,
          hoverSelectedColumns: [
            {
              inactive: false,
              name: "color",
              isRequired: false,
              isError: false,
              table: "data_types_basic3",
              type: "BOOL",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "col_boolean_1",
              value: "col_boolean_1",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "# Unique",
              categories: [false, true],
              initMinMax: [false, true],
              hideOther: true,
              colorType: "ordinal",
              format: ""
            },
            {
              inactive: false,
              name: "size",
              isRequired: false,
              isError: false,
              table: "data_types_basic3",
              type: "DECIMAL",
              precision: 8,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "col_decimal_1",
              value: "col_decimal_1",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              minMax: [-1808.46, 8499.61],
              initMinMax: [-1808.46, 8499.61],
              hideOther: true,
              format: "custom-imperial"
            }
          ],
          geoJoin: {},
          borderWidth: 0,
          popupEnabled: true,
          rasterShowOther: true,
          active: true,
          activeZoomLevel: true
        }
      ],
      height: 68,
      width: 498,
      mapZoomCenter: {
        zoom: 1.793338085423588,
        center: {
          lng: -129.48929655894324,
          lat: 35.74840529367191
        },
        bounds: {
          lonMin: -179.99999000000005,
          lonMax: -78.9786031178872,
          latMin: 29.95901014704546,
          latMax: 41.14554027737947
        }
      },
      basemap: {
        label: "Current Immerse Theme",
        value: "current"
      },
      dcFlag: 5372297175456603,
      pixelSize: 10,
      currentLayer: "master",
      mark: "hex",
      borderWidth: 0,
      sizeRange: [1, 3],
      legendLocked: false,
      measures: [
        {
          isError: false,
          name: "geo",
          isRequired: false,
          inactive: false,
          table: "data_types_basic3",
          type: "LINESTRING",
          precision: 23,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "col_linestring_1",
          value: "col_linestring_1",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          categories: [19, 63, -159, -69]
        },
        {
          inactive: false,
          name: "size",
          isRequired: false,
          isError: false,
          table: "data_types_basic3",
          type: "DECIMAL",
          precision: 8,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "col_decimal_1",
          value: "col_decimal_1",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          minMax: [-1808.46, 8499.61],
          initMinMax: [-1808.46, 8499.61],
          hideOther: true
        },
        {
          inactive: false,
          name: "color",
          isRequired: false,
          isError: false,
          table: "data_types_basic3",
          type: "BOOL",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "col_boolean_1",
          value: "col_boolean_1",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "# Unique",
          categories: [false, true],
          initMinMax: [false, true],
          hideOther: true,
          colorType: "ordinal"
        }
      ]
    },
    "9": {
      dataSource: "data_types_basic3",
      autoSize: true,
      areFiltersInverse: false,
      cap: 1000000,
      renderArea: false,
      color: {
        customDomain: [],
        customKey: "key0",
        customPalette: {
          red: ["#ea5545"],
          lime: ["#bdcf32"],
          purple: ["#b33dc6"],
          orange: ["#ef9b20"],
          green: ["#87bc45"],
          pink: ["#f46a9b"],
          silver: ["#ace5c7"],
          yellow: ["#ede15b"],
          purpleCool: ["#836dc5"],
          greenPastel: ["#86d87f"],
          blue: ["#27aeef"]
        },
        customRange: [],
        isCustom: true,
        key: "custom",
        type: "custom",
        val: [
          "#ea5545",
          "#bdcf32",
          "#b33dc6",
          "#ef9b20",
          "#87bc45",
          "#f46a9b",
          "#ace5c7",
          "#ede15b",
          "#836dc5",
          "#86d87f",
          "#27aeef"
        ],
        column: "col_boolean_1",
        defaultOtherDomain: null,
        defaultOtherRange: null,
        hideOther: false
      },
      colorDomain: null,
      dataSelections: [
        {
          layerId: "-Mn74LjN_qHmAH4prqM0",
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
      selectedLayerId: "-Mn74LjN_qHmAH4prqM0",
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
          percentageDistributionEnabled: false
        },
        sizeMeasureSecondaryAxis: {
          cumulativeDistributionEnabled: false,
          percentageDistributionEnabled: false
        }
      },
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
          inactive: false,
          name: null,
          isRequired: false,
          isError: false,
          table: "data_types_basic3",
          type: "BIGINT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "col_big_1",
          value: "col_big_1",
          custom: false,
          axisLabel: null,
          extract: false,
          loading: false,
          timeBin: null,
          min_val: 4970968925,
          max_val: 98166529849,
          currentLowValue: 4970968925,
          currentHighValue: 98166529849,
          cardinality: 58,
          isBinned: true,
          isBinnable: true,
          autobin: true,
          maxBinSize: 250,
          numOfBins: 12
        },
        {
          isRequired: false,
          isError: false
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
      ticks: 3,
      title: "",
      type: "linemap",
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
      hoverSelectedColumns: [
        {
          inactive: false,
          name: null,
          isRequired: false,
          isError: false,
          table: "data_types_basic3",
          type: "BIGINT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "col_big_1",
          value: "col_big_1",
          custom: false,
          axisLabel: null,
          extract: false,
          loading: false,
          timeBin: null,
          min_val: 4970968925,
          max_val: 98166529849,
          currentLowValue: 4970968925,
          currentHighValue: 98166529849,
          cardinality: 58,
          isBinned: true,
          isBinnable: true,
          autobin: true,
          maxBinSize: 250,
          numOfBins: 12,
          format: "custom-imperial"
        },
        {
          inactive: false,
          name: "color",
          isRequired: false,
          isError: false,
          table: "data_types_basic3",
          type: "BOOL",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "col_boolean_1",
          value: "col_boolean_1",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "# Unique",
          colorType: "ordinal",
          format: ""
        }
      ],
      active: true,
      hasError: false,
      layers: [
        {
          measures: [
            {
              isRequired: false,
              isError: false,
              inactive: false,
              name: "geo",
              table: "data_types_basic3",
              type: "LINESTRING",
              precision: 23,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "geom_linestring",
              value: "geom_linestring",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              categories: [
                -155.116338941788,
                -107.301426943066,
                19.8688197694108,
                48.99856178509
              ]
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
              table: "data_types_basic3",
              type: "BOOL",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "col_boolean_1",
              value: "col_boolean_1",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "# Unique",
              colorType: "ordinal"
            }
          ],
          dimensions: [
            {
              inactive: false,
              name: null,
              isRequired: false,
              isError: false,
              table: "data_types_basic3",
              type: "BIGINT",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "col_big_1",
              value: "col_big_1",
              custom: false,
              axisLabel: null,
              extract: false,
              loading: false,
              timeBin: null,
              min_val: 4970968925,
              max_val: 98166529849,
              currentLowValue: 4970968925,
              currentHighValue: 98166529849,
              cardinality: 58,
              isBinned: true,
              isBinnable: true,
              autobin: true,
              maxBinSize: 250,
              numOfBins: 12
            },
            {
              isRequired: false,
              isError: false
            }
          ],
          color: {
            customDomain: [],
            customKey: "key0",
            customPalette: {
              red: ["#ea5545"],
              lime: ["#bdcf32"],
              purple: ["#b33dc6"],
              orange: ["#ef9b20"],
              green: ["#87bc45"],
              pink: ["#f46a9b"],
              silver: ["#ace5c7"],
              yellow: ["#ede15b"],
              purpleCool: ["#836dc5"],
              greenPastel: ["#86d87f"],
              blue: ["#27aeef"]
            },
            customRange: [],
            isCustom: true,
            key: "custom",
            type: "custom",
            val: [
              "#ea5545",
              "#bdcf32",
              "#b33dc6",
              "#ef9b20",
              "#87bc45",
              "#f46a9b",
              "#ace5c7",
              "#ede15b",
              "#836dc5",
              "#86d87f",
              "#27aeef"
            ],
            column: "col_boolean_1",
            defaultOtherDomain: null,
            defaultOtherRange: null
          },
          dataSource: "data_types_basic3",
          type: "linemap",
          densityAccumulatorEnabled: true,
          autoSize: true,
          cap: 1000000,
          hoverSelectedColumns: [
            {
              inactive: false,
              name: null,
              isRequired: false,
              isError: false,
              table: "data_types_basic3",
              type: "BIGINT",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "col_big_1",
              value: "col_big_1",
              custom: false,
              axisLabel: null,
              extract: false,
              loading: false,
              timeBin: null,
              min_val: 4970968925,
              max_val: 98166529849,
              currentLowValue: 4970968925,
              currentHighValue: 98166529849,
              cardinality: 58,
              isBinned: true,
              isBinnable: true,
              autobin: true,
              maxBinSize: 250,
              numOfBins: 12,
              format: "custom-imperial"
            },
            {
              inactive: false,
              name: "color",
              isRequired: false,
              isError: false,
              table: "data_types_basic3",
              type: "BOOL",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "col_boolean_1",
              value: "col_boolean_1",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "# Unique",
              colorType: "ordinal",
              format: ""
            }
          ],
          geoJoin: {},
          popupEnabled: true,
          rasterShowOther: true,
          active: true,
          rasterLayerId: "rasterLayerId:-Mn7RS7Ix27A4z9Knkvm"
        }
      ],
      height: 68,
      width: 572,
      mapZoomCenter: {
        zoom: 3.0698437909763907,
        center: {
          lng: -117.34295462823752,
          lat: 37.06411747772563
        },
        bounds: {
          lonMin: -141.29174099031502,
          lonMax: -93.39416826615921,
          latMin: 34.75853031470369,
          latMax: 39.30170489195217
        }
      },
      basemap: {
        label: "Current Immerse Theme",
        value: "current"
      },
      measures: [
        {
          isRequired: false,
          isError: false,
          inactive: false,
          name: "geo",
          table: "data_types_basic3",
          type: "LINESTRING",
          precision: 23,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "geom_linestring",
          value: "geom_linestring",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          categories: [
            -155.116338941788,
            -107.301426943066,
            19.8688197694108,
            48.99856178509
          ]
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
          table: "data_types_basic3",
          type: "BOOL",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "col_boolean_1",
          value: "col_boolean_1",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "# Unique",
          colorType: "ordinal"
        }
      ],
      legendLocked: false,
      dcFlag: 4207689672582779
    }
  }
}
