// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import R from "ramda"
import { expect } from "chai"
import { CHARTS, namedMeasures } from "constants/charts"
import updateChartTypeReducer, {
  updateSortColumn
} from "./update-chart-type-reducer"
import {
  CUSTOM_COLORS,
  CHARTS_DEFAULT_COLORS,
  MEASURE_DEFAULT_COLORS,
  getColors
} from "services/colors"

import "charts/chart-definitions"

function createAction(chartType) {
  return {
    chartType,
    chartId: "1"
  }
}

describe("updateChartType Reducer", () => {
  describe("Color Updates", () => {
    describe("When switching from table to a valid pointmap with ordinal color", () => {
      const tableState = {
        autoSize: true,
        areFiltersInverse: false,
        cap: 12,
        renderArea: false,
        color: {
          type: "none",
          defaultOtherDomain: "Default"
        },
        colorDomain: null,
        dcFlag: 2,
        dimensions: [
          {
            isError: false,
            isRequired: false
          }
        ],
        elasticX: true,
        filters: [],
        geoJson: null,
        loading: false,
        measures: [
          {
            isError: false,
            isRequired: false,
            table: "contributions",
            type: "FLOAT",
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "lon",
            value: "lon",
            colorType: "quantitative",
            aggType: "Avg",
            custom: false,
            originIndex: 0,
            name: "col0"
          },
          {
            isError: false,
            isRequired: false,
            table: "contributions",
            type: "FLOAT",
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "lat",
            value: "lat",
            colorType: "quantitative",
            aggType: "Avg",
            custom: false,
            originIndex: 1,
            name: "col1"
          },
          {
            isError: false,
            isRequired: false,
            table: "contributions",
            type: "INT",
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "amount",
            value: "amount",
            colorType: "quantitative",
            aggType: "Avg",
            custom: false,
            originIndex: 2,
            name: "col2"
          },
          {
            isError: false,
            isRequired: false,
            table: "contributions",
            type: "STR",
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "recipient_party",
            value: "recipient_party",
            colorType: "quantitative",
            aggType: "# Unique",
            custom: false,
            originIndex: 3,
            name: "col3"
          },
          {
            isError: false,
            isRequired: false
          }
        ],
        rangeChartEnabled: true,
        rangeFilter: [],
        savedColors: {
          none: {
            type: "none",
            defaultOtherDomain: "Default"
          }
        },
        sortColumn: null,
        ticks: 3,
        title: "",
        type: "table",
        showOther: false,
        hasError: false
      }
      it("should set color to be custom", () => {
        const nextState = updateChartTypeReducer(
          { 1: tableState },
          createAction("pointmap")
        )
        expect(nextState[1].measures[3].colorType).to.eql("ordinal")
        expect(nextState[1].color).to.deep.equal({
          customDomain: [],
          customKey: "key0",
          customPalette: getColors(CUSTOM_COLORS),
          customRange: [],
          isCustom: true,
          key: "custom",
          type: "custom",
          val: R.keys(getColors(CUSTOM_COLORS)).map(
            (key) => getColors(CUSTOM_COLORS)[key][0]
          ),
          column: "recipient_party",
          defaultOtherDomain: "Default",
          defaultOtherRange: "#27aeef"
        })
      })
    })

    describe("when there is a color selector", () => {
      it("should return the current color when it is valid", () => {
        const quantitativeColor = {
          type: "quantitative",
          key: "heatScale",
          val: [],
          defaultOtherDomain: "Default"
        }

        const initialState = {
          1: {
            type: "heatmap",
            color: quantitativeColor,
            measures: [
              { value: "*", type: "SMALLINT", name: "color" },
              { value: "amount", type: "INT", name: undefined }
            ],
            dimensions: [
              { value: "contrib_date", type: "DATE", name: "X Axis" },
              { value: "recipient_party", type: "STR", name: "Y Axis" }
            ],
            savedColors: {}
          }
        }

        const nextState = updateChartTypeReducer(
          initialState,
          createAction("pie")
        )
        expect(nextState[1].color).to.eql(quantitativeColor)
      })

      it("should return savedColor type or default when current color is not valid for selector", () => {
        const initialState = {
          1: {
            type: "table",
            color: {
              type: "none"
            },
            measures: [
              { value: "*", type: "SMALLINT", name: "color" },
              { value: "amount", type: "INT", name: undefined }
            ],
            dimensions: [
              { value: "contrib_date", type: "DATE", name: "X Axis" },
              { value: "recipient_party", type: "STR", name: "Y Axis" }
            ],
            savedColors: {}
          }
        }
        const nextState = updateChartTypeReducer(
          initialState,
          createAction("pie")
        )
        expect(nextState[1].color).to.deep.equal(
          getColors(MEASURE_DEFAULT_COLORS)["quantitative"]
        )
      })
    })

    describe("when current color is an allowed type", () => {
      describe("when colorByDimension", () => {
        it("should return the saved custom color", () => {
          const savedCustom = {
            type: "custom"
          }

          const initialState = {
            1: {
              type: "line",
              color: {
                type: "solid"
              },
              colorByDimension: "recipient_party",
              measures: [{ value: "*", type: "SMALLINT", name: "color" }],
              dimensions: [
                { value: "recipient_party", type: "STR", name: "Y Axis" }
              ],
              savedColors: {
                custom_recipient_party: savedCustom
              }
            }
          }

          const nextState = updateChartTypeReducer(
            initialState,
            createAction("pie")
          )
          expect(nextState[1].color).to.eql(savedCustom)
        })
      })

      describe("when color type is saved", () => {
        it("should return the saved custom color", () => {
          const savedSolid = {
            type: "solid"
          }

          const initialState = {
            1: {
              type: "line",
              color: {
                type: "solid"
              },
              measures: [{ value: "*", type: "SMALLINT", name: "color" }],
              dimensions: [
                { value: "recipient_party", type: "STR", name: "Y Axis" }
              ],
              savedColors: {
                solid: savedSolid
              }
            }
          }

          const nextState = updateChartTypeReducer(
            initialState,
            createAction("pie")
          )
          expect(nextState[1].color).to.eql(savedSolid)
        })
      })

      describe("when there is no saved color type", () => {
        it("should return the saved custom color", () => {
          const initialState = {
            1: {
              type: "line",
              color: {
                type: "solid"
              },
              measures: [{ value: "*", type: "SMALLINT", name: "color" }],
              dimensions: [
                { value: "recipient_party", type: "STR", name: "Y Axis" }
              ],
              savedColors: {
                quantitative: {
                  type: "quantitative"
                },
                ordinal: {
                  type: "ordinal"
                }
              }
            }
          }

          const nextPieState = updateChartTypeReducer(
            initialState,
            createAction("pie")
          )
          expect(nextPieState[1].color).to.deep.equal({ type: "ordinal" })
        })
      })
    })
  })

  describe("Sort Column Updates", () => {
    describe("When sortColumn is null", () => {
      it("should preserve sortColumn as null when switching from table to number", () => {
        expect(
          updateSortColumn("number", {
            sortColumn: null,
            type: "table",
            measures: [],
            dimensions: []
          })
        ).to.eql(null)
      })
      it("should preserve sortColumn as null when switching from number to table", () => {
        expect(
          updateSortColumn("table", {
            sortColumn: null,
            type: "number",
            measures: [],
            dimensions: []
          })
        ).to.eql(null)
      })
    })

    describe("When sortColumn is of table shape type", () => {
      const tableSortColumnShape = {
        index: 1,
        col: {
          expression: "*",
          name: "col0",
          agg_mode: "Count",
          label: "# Records"
        },
        order: "desc"
      }

      const expectedCapSortColumnShape = {
        index: 1,
        col: {
          expression: "*",
          name: "val",
          agg_mode: "Count",
          label: "# Records"
        },
        order: "desc"
      }

      describe("When switching to cap chart from a non-table chart", () => {
        it("should covert the sortColumn name correctly from colX to val", () => {
          const previousType = "scatter"
          const nextType = "pie"
          expect(
            updateSortColumn(nextType, {
              sortColumn: tableSortColumnShape,
              type: previousType,
              measures: [{}, {}],
              dimensions: [{}, {}]
            })
          ).to.deep.equal(expectedCapSortColumnShape)
        })
      })

      describe("When switching from table to a non-cap chart", () => {
        it("should preserve the sortColumn", () => {
          const previousType = "table"
          const nextType = "scatter"
          expect(
            updateSortColumn(nextType, {
              sortColumn: tableSortColumnShape,
              type: previousType,
              measures: [],
              dimensions: []
            })
          ).to.eql(tableSortColumnShape)
        })
      })

      describe("when switching back to table", () => {
        it("should preserve the sortColumn", () => {
          const previousType = "number"
          const nextType = "table"
          expect(
            updateSortColumn(nextType, {
              sortColumn: tableSortColumnShape,
              type: previousType,
              measures: [],
              dimensions: []
            })
          ).to.eql(tableSortColumnShape)
        })
      })
    })

    it("should set sort column to val if coming from unsortable chart", () => {
      let measures = [
        { inactive: false, value: "*", aggType: "Count", name: "val" },
        {
          inactive: false,
          value: "actualelapsedtime",
          aggType: "Avg",
          name: "color"
        }
      ]

      let dimensions = [
        { inactive: false, value: "actualelapsedtime" },
        { inactive: false }
      ]

      let initialState = {
        [1]: {
          type: "table",
          measures,
          dimensions,
          sortColumn: null,
          savedColors: {}
        }
      }

      const nextState = updateChartTypeReducer(
        initialState,
        createAction("row")
      )
      const nextChart = nextState["1"]

      expect(nextChart.sortColumn.col.name).to.eql("val")
    })

    it("should maintain dimension sort order from coming from table chart", () => {
      let measures = [
        { inactive: false, value: "*", aggType: "Count", name: "val" },
        {
          inactive: false,
          value: "actualelapsedtime",
          aggType: "Avg",
          name: "color"
        }
      ]

      let dimensions = [
        { inactive: false, value: "actualelapsedtime" },
        { inactive: false }
      ]

      let initialState = {
        [1]: {
          type: "table",
          measures,
          dimensions,
          sortColumn: {
            col: {
              aggType: "Count",
              value: "*",
              name: "key0"
            },
            order: "asc",
            index: 0
          },
          savedColors: {}
        }
      }
      const nextState = updateChartTypeReducer(
        initialState,
        createAction("row")
      )
      const nextChart = nextState["1"]

      expect(nextChart.sortColumn.col.name).to.eql("key0")
      expect(nextChart.sortColumn.index).to.eql(0)
      expect(nextChart.sortColumn.order).to.eql("asc")
    })

    it("should maintain measure sort order converting to table chart", () => {
      let measures = [
        { inactive: false, value: "*", aggType: "Count", name: "val" },
        {
          inactive: false,
          value: "actualelapsedtime",
          aggType: "Avg",
          name: "color"
        }
      ]

      let dimensions = [
        { inactive: false, value: "actualelapsedtime" },
        { inactive: false }
      ]

      let initialState = {
        [1]: {
          type: "table",
          measures,
          dimensions,
          sortColumn: {
            col: {
              name: "col0"
            },
            order: "asc"
          },
          savedColors: {}
        }
      }
      const nextState = updateChartTypeReducer(
        initialState,
        createAction("pie")
      )
      const nextChart = nextState["1"]

      expect(nextChart.sortColumn.col.name).to.eql("col0")
      expect(nextChart.sortColumn.order).to.eql("asc")
    })

    it("should maintain # records measure sort order converting to table chart with # records column", () => {
      let measures = [
        { inactive: false, value: "*", aggType: "Count", name: "val" },
        {
          inactive: false,
          value: "actualelapsedtime",
          aggType: "Avg",
          name: "color"
        }
      ]

      let dimensions = [
        { inactive: false, value: "actualelapsedtime" },
        { inactive: false, value: "carriername" }
      ]

      let initialState = {
        [1]: {
          type: "pie",
          measures,
          dimensions,
          sortColumn: {
            col: {
              name: "val"
            },
            index: 2,
            order: "asc"
          },
          savedColors: {}
        }
      }
      const nextState = updateChartTypeReducer(
        initialState,
        createAction("table")
      )
      const nextChart = nextState["1"]

      expect(nextChart.sortColumn.col.name).to.eql("col0")
      expect(nextChart.sortColumn.index).to.eql(1)
      expect(nextChart.sortColumn.order).to.eql("asc")
    })

    it("should maintain sort order converting to across non-table charts", () => {
      let measures = [
        { inactive: false, value: "*", aggType: "Count", name: "val" },
        {
          inactive: false,
          value: "actualelapsedtime",
          aggType: "Avg",
          name: "color"
        }
      ]

      let dimensions = [
        { inactive: false, value: "actualelapsedtime" },
        { inactive: false }
      ]

      let initialState = {
        [1]: {
          type: "pie",
          measures,
          dimensions,
          sortColumn: {
            col: {
              name: "val"
            },
            order: "asc",
            index: 0
          },
          savedColors: {}
        }
      }
      const nextState = updateChartTypeReducer(
        initialState,
        createAction("row")
      )
      const nextChart = nextState["1"]

      expect(nextChart.sortColumn.col.name).to.eql("val")
      expect(nextChart.sortColumn.order).to.eql("asc")
    })

    it("should maintain sort by # records converting across non-table charts", () => {
      let measures = [
        { inactive: false, value: "*", aggType: "Count", name: "val" },
        {
          inactive: false,
          value: "actualelapsedtime",
          aggType: "Avg",
          name: "color"
        }
      ]

      let dimensions = [
        { inactive: false, value: "actualelapsedtime" },
        { inactive: false }
      ]

      let initialState = {
        [1]: {
          type: "pie",
          measures,
          dimensions,
          sortColumn: {
            col: {
              name: "countval"
            },
            order: "asc",
            index: 0
          },
          savedColors: {}
        }
      }
      const nextState = updateChartTypeReducer(
        initialState,
        createAction("row")
      )
      const nextChart = nextState["1"]

      expect(nextChart.sortColumn.col.name).to.eql("countval")
      expect(nextChart.sortColumn.order).to.eql("asc")
    })

    it.skip("should set countval as default sorting for scatter chart", () => {
      let measures = [
        { inactive: false, value: "*", aggType: "Count", name: "val" },
        {
          inactive: false,
          value: "actualelapsedtime",
          aggType: "Avg",
          name: "color"
        }
      ]

      let dimensions = [
        { inactive: false, value: "actualelapsedtime" },
        { inactive: false }
      ]

      let initialState = {
        [1]: {
          type: "pie",
          measures,
          dimensions,
          sortColumn: null,
          savedColors: {}
        }
      }
      const nextState = updateChartTypeReducer(
        initialState,
        createAction("scatter")
      )
      const nextChart = nextState["1"]

      expect(nextChart.sortColumn.col.name).to.eql("countval")
      expect(nextChart.sortColumn.order).to.eql("desc")
    })

    it("should maintain sort by # records converting back to table", () => {
      let measures = [
        { inactive: false, value: "*", aggType: "Count", name: "val" },
        {
          inactive: false,
          value: "actualelapsedtime",
          aggType: "Avg",
          name: "color"
        }
      ]

      let dimensions = [
        { inactive: false, value: "actualelapsedtime" },
        { inactive: false }
      ]

      let initialState = {
        [1]: {
          type: "pie",
          measures,
          dimensions,
          sortColumn: {
            col: {
              name: "val"
            },
            order: "asc"
          },
          savedColors: {}
        }
      }
      const tableSortNumRecords = {
        col: {
          agg_mode: "Count",
          expression: "*",
          name: "col0"
        },
        order: "asc",
        index: 1
      }
      const nextState = updateChartTypeReducer(
        initialState,
        createAction("table")
      )
      const nextChart = nextState["1"]

      expect(nextChart.sortColumn).to.deep.equal(tableSortNumRecords)
    })

    it("should set sort column to null if going to an unsortable chart", () => {
      let measures = [
        { inactive: false, value: "*", aggType: "Count", name: "val" },
        {
          inactive: false,
          value: "actualelapsedtime",
          aggType: "Avg",
          name: "color"
        }
      ]

      let dimensions = [
        { inactive: false, value: "actualelapsedtime" },
        { inactive: false }
      ]

      let initialState = {
        [1]: {
          type: "row",
          measures,
          dimensions,
          sortColumn: {
            col: {
              name: "countval"
            }
          },
          savedColors: {}
        }
      }

      const nextState = updateChartTypeReducer(
        initialState,
        createAction("table")
      )
      const nextChart = nextState["1"]

      expect(nextChart.sortColumn).to.eql(null)
    })

    it("should set sort column to null if going to an unsortable chart", () => {
      let measures = [
        { inactive: false, value: "*", aggType: "Count", name: "val" },
        {
          inactive: false,
          value: "actualelapsedtime",
          aggType: "Avg",
          name: "color"
        }
      ]

      let dimensions = [
        { inactive: false, value: "actualelapsedtime" },
        { inactive: false }
      ]

      let initialState = {
        [1]: {
          type: "row",
          measures,
          dimensions,
          sortColumn: {
            col: {
              name: "countval"
            }
          },
          savedColors: {}
        }
      }

      const nextState = updateChartTypeReducer(
        initialState,
        createAction("table")
      )
      const nextChart = nextState["1"]

      expect(nextChart.sortColumn).to.eql(null)
    })
  })

  let measures = [{}, {}, {}, {}]
  let dimensions = [{}, {}, {}, {}]

  let initialState = {
    [1]: {
      type: undefined,
      filters: [45, 80],
      measures,
      dimensions,
      savedColors: {}
    }
  }

  it("should return a new state with the updated chart type", () => {
    const type = "table"
    const nextState = updateChartTypeReducer(initialState, createAction(type))

    expect(nextState["1"].type).to.eql(type)
  })

  it("should clear the chart filters", () => {
    const nextState = updateChartTypeReducer(
      initialState,
      createAction("table")
    )
    expect(nextState["1"].filters.length).to.eql(0)
  })

  it("should not return more dimensions than the max required by the type", () => {
    const type = "histogram"
    const nextState = updateChartTypeReducer(initialState, createAction(type))
    expect(nextState["1"].dimensions.length).to.be.at.most(
      CHARTS[type].maxDimensions
    )
  })

  it("should not return more measures than the max required by the type", () => {
    const type = "histogram"
    const nextState = updateChartTypeReducer(initialState, createAction(type))

    expect(nextState["1"].measures.length).to.be.at.most(
      CHARTS[type].maxMeasures
    )
  })

  it("should add more dimensions if required by the max", () => {
    const type = "heat"
    const nextState = updateChartTypeReducer(
      initialState,
      createAction("histogram")
    )
    const finalState = updateChartTypeReducer(nextState, createAction(type))

    expect(finalState["1"].dimensions.length).to.eql(CHARTS[type].maxDimensions)
  })

  it("should add more measures if required by the max", () => {
    const type = "pointmap"
    const nextState = updateChartTypeReducer(
      initialState,
      createAction("histogram")
    )
    const finalState = updateChartTypeReducer(nextState, createAction(type))
    expect(finalState["1"].measures.length).to.eql(CHARTS[type].maxMeasures)
  })

  it("should update the measures names according to the chart type", () => {
    Object.keys(CHARTS).forEach((type) => {
      if (type === "count") {
        return
      }

      const nextState = updateChartTypeReducer(initialState, createAction(type))
      nextState["1"].measures.forEach((measure, index) => {
        expect(measure.name).to.eql(
          namedMeasures(type)[index] ? namedMeasures(type)[index].name : "col0"
        )
      })
    })

    const nextState = updateChartTypeReducer(
      initialState,
      createAction("table")
    )
    const measures = nextState["1"].measures

    expect(measures.length).to.eql(nextState["1"].measures.length)

    nextState["1"].measures.forEach((measure, index) => {
      expect(measure.name).to.eql(`col${index}`)
    })
  })

  it("should add an empty selector if the new max is infinity and if the last selector is currently not empty", () => {
    let initialState = {
      [1]: {
        type: "line",
        measures: [{ value: "arr" }],
        dimensions: [{ value: "time" }],
        savedColors: {}
      }
    }

    const nextState = updateChartTypeReducer(
      initialState,
      createAction("table")
    )

    expect(nextState["1"].measures.length).to.eql(2)
    expect(nextState["1"].measures[1].name).to.eql("col1")
    expect(nextState["1"].dimensions.length).to.eql(2)
    expect(nextState["1"].dimensions[1]).to.deep.equal({
      inactive: false,
      name: null
    })
  })

  it("should set selectors inactive when their index + 1 position is over the max required", () => {
    let measures = [
      { name: "col0", value: "arr" },
      { name: "col1", value: "arr" },
      { name: "col2", value: "arr" },
      { name: "col3" }
    ]

    let dimensions = [
      { value: "time" },
      { value: "time" },
      { value: "time" },
      {}
    ]

    let initialState = {
      [1]: {
        color: {},
        type: "table",
        measures,
        dimensions,
        savedColors: {}
      }
    }

    const nextState = updateChartTypeReducer(initialState, createAction("line"))
    const nextChart = nextState["1"]
    const nextMeasures = nextChart.measures
    const nextDimensions = nextChart.dimensions

    expect(nextMeasures.length).to.eql(3)
    expect(nextMeasures[1].inactive).to.eql(true)
    expect(nextMeasures[2].inactive).to.eql(true)
    expect(nextDimensions.length).to.eql(3)
    expect(nextDimensions[1].inactive).to.eql(false)
    expect(nextDimensions[2].inactive).to.eql(true)
  })

  it("should set selectors active again if they are under the max required", () => {
    let measures = [
      { inactive: false, value: "*", aggType: "Count", name: "val" },
      {
        inactive: false,
        value: "actualelapsedtime",
        aggType: "Avg",
        name: "color"
      },
      { inactive: true, value: "arrdelay", aggType: "Avg" }
    ]

    let dimensions = [
      { inactive: false, value: "actualelapsedtime" },
      { inactive: false }
    ]

    let initialState = {
      [1]: {
        type: "pie",
        measures,
        dimensions,
        savedColors: {}
      }
    }

    const nextState = updateChartTypeReducer(
      initialState,
      createAction("table")
    )
    const nextChart = nextState["1"]
    const nextMeasures = nextChart.measures
    const nextDimensions = nextChart.dimensions

    expect(nextMeasures.length).to.eql(4)
    expect(R.all(({ inactive }) => !inactive, nextMeasures)).to.eql(true)
  })

  describe("when handling inactive measures", () => {
    it("should set them active if in in the range of the max allowed", () => {
      const initialState = {
        "1": {
          type: "row",
          measures: [
            {
              isError: false,
              isRequired: false,
              inactive: false,
              name: "val",
              label: "# Records",
              value: "*",
              type: "SMALLINT",
              aggType: "Count",
              custom: false,
              originIndex: 0
            },
            {
              inactive: false,
              name: "color",
              isError: false,
              isRequired: false,
              type: "SMALLINT",
              label: "deptime",
              value: "deptime",
              aggType: "Avg",
              custom: false,
              originIndex: 1
            },
            {
              inactive: true,
              isError: false,
              isRequired: false,
              type: "SMALLINT",
              label: "cancelled",
              value: "cancelled",
              aggType: "Avg",
              custom: false,
              originIndex: 3
            }
          ],
          dimensions: [],
          savedColors: {}
        }
      }

      const expectedState = {
        "1": {
          measures: [
            {
              isError: false,
              isRequired: true,
              inactive: false,
              name: "x",
              label: "# Records",
              value: "*",
              type: "SMALLINT",
              aggType: "Count",
              custom: false,
              originIndex: 0
            },
            {
              inactive: false,
              name: "y",
              isError: false,
              isRequired: true,
              type: "SMALLINT",
              label: "deptime",
              value: "deptime",
              aggType: "Avg",
              custom: false,
              originIndex: 1
            },
            {
              inactive: false,
              name: "size",
              isError: false,
              isRequired: false,
              type: "SMALLINT",
              label: "cancelled",
              value: "cancelled",
              aggType: "Avg",
              custom: false,
              originIndex: 3
            },
            {
              inactive: false,
              name: "color",
              isError: false,
              isRequired: false
            }
          ],
          dimensions: [],
          savedColors: {}
        }
      }

      const nextState = updateChartTypeReducer(
        initialState,
        createAction("scatter")
      )
      expect(R.take(3, nextState[1].measures)).to.deep.equal(
        R.take(3, expectedState[1].measures)
      )
    })
  })

  it("should reset color to chart defaults", () => {
    expect(
      updateChartTypeReducer(initialState, createAction("pie"))["1"].color
    ).to.deep.equal(getColors(CHARTS_DEFAULT_COLORS)["pie"])
    expect(
      updateChartTypeReducer(initialState, createAction("pointmap"))["1"].color
    ).to.deep.equal(getColors(CHARTS_DEFAULT_COLORS)["pointmap"])
  })
})
