// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {addMultiSource, deleteMultiSource, enterMultiSourceMode} from 'actions/chart-editor-multisource-action-creators'
import * as actions from 'actions/charts-action-creators'
import * as selectorActions from 'actions/selector-action-creators'
import {expect} from 'chai'
import {CHARTS} from 'constants/charts'
import {BASE_LINE2_DIMENSIONS, BASE_LINE2_MEASURES} from 'constants/charts'
import {compose} from 'ramda'
import reducer, {DateTimeRestriction, NumericRestriction, resetRangeFilter} from 'reducers/charts/charts-reducer'
import { initialChart } from "reducers/charts/helpers/initialChart"
import {restrictedDimensionTypeKey} from 'reducers/charts/remove-selector-reducer'
import { getThunkActions } from "utils/helpers"

describe('Charts Reducer', () => {
  const state = {
  '1': {
    type: 'row',
    measures: [{}],
    dimensions: [{value: 'departure', type: 'INT'}],
    height: 400,
    width: 300
  }
  }

  it('should return initial state', () => {
    expect(reducer(undefined, { chartId: '1', type: undefined })).to.deep.equal(
      {}
    )
  })

  it('should handle CREATE_CHART type', () => {
    const action = actions.createChart('1')

    const state = reducer({}, action)

    expect(state['1'].hasError).to.equal(false)
    expect(state['1'].dimensions).to.deep.equal([{ isError: false, isRequired: false }])
    expect(state['1'].measures).to.deep.equal([{ isError: false, isRequired: false }])
  })

    /*
    // updateChart now returns a thunk. This test must be updated
    it("should handle UPDATE_CHART type", async () => {
      const action = await actions.updateChart("1", {
        dimensions: [{ value: "arrival", type: "INT" }],
        measures: [{}],
        savedColors: {},
        height: 0,
        width: 100
      })

      expect(reducer(state, action)).to.deep.equal({
        "1": {
          hasError: true,
          type: "row",
          measures: [{ isRequired: true, isError: false }],
          dimensions: [
            { value: "arrival", type: "INT", isRequired: false, isError: false }
          ],
          savedColors: {},
          height: 0,
          width: 100
        }
      })
    })
    */

  it('should handle CLEAR_CHARTS type', () => {
    const action = actions.clearCharts()
    expect(reducer(state, action)).to.deep.equal({})
  })

  it('should handle a REMOVE_SELECTOR action', () => {
    const intialState = {
  ['1']: {
    type: 'table',
    measures: [{name: null, value: 'test'}, {name: null, value: 'example'}, {}],
    dimensions:
        [{name: null, value: 'test'}, {name: null, value: 'example'}, {}],
    savedColors: {}
  }
    }

    const removeMeasure = {
  type: 'REMOVE_SELECTOR', chartId: '1', selectorType: 'measures',
      selectorIndex: 1
    }

    const removeDimension = {
      type: 'REMOVE_SELECTOR',
      chartId: '1',
      selectorType: 'dimensions',
      selectorIndex: 0
    }

    expect(reducer(intialState, removeMeasure)[1].measures).to.deep.equal([
      { name: null, value: 'test', isError: false, isRequired: false },
      { isError: false, isRequired: false }
    ])

    expect(reducer(intialState, removeDimension)[1].dimensions).to.deep.equal([
      { name: null, value: 'example', isError: false, isRequired: false },
      { isError: false, isRequired: false }
    ])
  })

    // this test must be updated - clearChartFilters now returns a thunk
    /*
    describe("CLEAR_CHART_FILTERS action type reducer", () => {
      const initialState = {
        1: {
          filters: [1, 2, 3],
          rangeFilter: ["Date 1", "Date 2"],
          areFiltersInverse: true
        },
        2: { filters: ["a", "b", "c"], areFiltersInverse: true }
      }

      const nextState = reducer(initialState, actions.clearChartFilters(1))

      it("should set filters to empty array", () => {
        expect(nextState[1].filters.length).to.deep.equal(0)
      })

      it("should set rangeFilters to empty array", () => {
        expect(nextState[1].rangeFilter.length).to.deep.equal(0)
      })

      it("should set areFiltersInverse to false", () => {
        expect(nextState[1].areFiltersInverse).to.deep.equal(false)
      })
    })
    */

  describe('DISCARD_INACTIVE_SELECTORS action type reducer', () => {
    it('should remove all inactive selectors', () => {
      const initialState = {
  1: {
    type: 'table',
    dimensions: [{}, {}, {inactive: true}, {inactive: true}, {inactive: true}],
    measures: [{}, {inactive: true}]
  }
      }
      const nextState = reducer(
        initialState,
        selectorActions.discardInactiveSelectors('1')
      )
  const {measures, dimensions} = nextState[1]

  expect(dimensions.length).to.deep.equal(2)
      expect(measures.length).to.deep.equal(1)
    })

    it('should keep inactive selectors that are defaults', () => {
      const initialState = {
  1: {
    type: 'line2',
    dimensions: [{}, {inactive: true, name: 'Color'}, {inactive: true}],
    measures: [{}, {inactive: true}]
  }
      }
      const nextState = reducer(
        initialState,
        selectorActions.discardInactiveSelectors('1')
      )
    const {measures, dimensions} = nextState[1]

    // the 2nd dimension (Color) is inactive but it's a default dimension
    expect(CHARTS['line2'].dimensions.length).to.deep.equal(2)
    // so it doesn't get removed
    expect(dimensions.length).to.deep.equal(2)
    // a second measure should always be there as a placeholder
      expect(measures.length).to.deep.equal(2)
    })
  })

  describe('SET_CHART_DC_FLAG', () => {
    it('should set the chart\'s DC Flag', () => {
      const dcFlag = '2'
  const id = '1'
  const nextState =
      reducer({1: {dcFlag: null}}, actions.setChartDCFlag(id, dcFlag))
      expect(nextState[id].dcFlag).to.deep.equal(dcFlag)
    })
  })

  describe('DELETE_CHART', () => {
    it('should remove chart from the list', () => {
      const nextState = reducer(
        {
          1: { dcFlag: null }
        },
        { type: 'DELETE_CHART', chartId: '1' }
      )
      expect(nextState).to.deep.equal({})
    })
  })

  describe('CLEAR_CHART_FILTERS_FOR_ALL_CHARTS', () => {
    it('should remove all filters from charts', () => {
      const nextState = reducer(
        {
          1: { filters: [1, 3, 4], areFiltersInverse: true },
          2: { filters: [1, 3, 4], areFiltersInverse: false }
        },
        { type: 'CLEAR_CHART_FILTERS_FOR_ALL_CHARTS' }
      )
      expect(nextState).to.deep.equal({
        1: { filters: [], areFiltersInverse: false, rangeFilter: [] },
        2: { filters: [], areFiltersInverse: false, rangeFilter: [] }
      })
    })
  })

  describe('ADD_CUSTOM_COLOR_DOMAIN', () => {
    it('should add custom color domain to color property', () => {
      const domain = ['ATL', 'SFO']
      const column = 'dest'
  const defaultOtherDomain = 'other'
  const nextState = reducer(
      {1: {savedColors: {}, color: {customDomain: {}}, dimensions: {}}}, {
        type: 'ADD_CUSTOM_COLOR_DOMAIN',
        chartId: '1',
        column,
        domain,
        defaultOtherDomain
      })

      expect(nextState).to.deep.equal({
        1: {
          dimensions: {},
          savedColors: {
            custom_dest: {
              column: 'dest',
              customKey: 'key1',
              isCustom: true,
              lineStyles: ['solid', 'solid'],
              type: 'custom',
              customDomain: domain,
              customRange: ['#ea5545', '#bdcf32'],
              defaultOtherDomain: 'other',
              defaultOtherRange: '#27aeef'
            }
          },
          color: {
            column: 'dest',
            customKey: 'key1',
            isCustom: true,
            lineStyles: ['solid', 'solid'],
            type: 'custom',
            customDomain: domain,
            customRange: ['#ea5545', '#bdcf32'],
            defaultOtherDomain: 'other',
            defaultOtherRange: '#27aeef'
          }
        }
      })
    })
  })

  describe('ADD_CUSTOM_COLOR', () => {
    it('should add custom color to color property', () => {
      const domain = ['ATL', 'SFO']
      const nextState = reducer(
        {
          1: {
            savedColors: {},
            color: {
              column: 'timestamp',
              customDomain: domain,
              customRange: ['#ea5545', '#1bcfff']
            }
          }
        },
        {
          type: 'ADD_CUSTOM_COLOR',
          chartId: '1',
          value: 'JFK'
        }
      )

      expect(nextState).to.deep.equal({
        1: {
          savedColors: {
            custom_timestamp: {
              column: 'timestamp',
              customDomain: domain.concat('JFK'),
              customRange: ['#ea5545', '#1bcfff', '#ea5545'],
              domainIsDirty: true,
              hideOther: false
            }
          },
          color: {
            column: 'timestamp',
            customDomain: domain.concat('JFK'),
            customRange: ['#ea5545', '#1bcfff', '#ea5545'],
            domainIsDirty: true,
            hideOther: false
          }
        }
      })
    })
  })

  describe('REMOVE_CUSTOM_COLOR', () => {
    it('should remove custom color domain from color property', () => {
      const domain = ['ATL', 'SFO']
      const nextState = reducer(
        {
          1: {
            savedColors: {
              custom_timestamp: {
                column: 'timestamp',
                customDomain: domain.concat(''),
                customRange: ['#ea5545', '#1bcfff', '#ea5545'],
                hideOther: false
              }
            },
            color: {
              column: 'timestamp',
              customDomain: domain.concat(''),
              customRange: ['#ea5545', '#1bcfff', '#ea5545'],
              lineStyles: ['solid', 'solid', 'solid'],
              hideOther: false
            }
          }
        },
        {
          type: 'REMOVE_CUSTOM_COLOR',
          chartId: '1',
          index: 2
        }
      )
      expect(nextState).to.deep.equal({
        1: {
          savedColors: {
            custom_timestamp: {
              column: 'timestamp',
              customDomain: domain,
              customRange: ['#ea5545', '#1bcfff'],
              domainIsDirty: true,
              lineStyles: ['solid', 'solid'],
              hideOther: false
            }
          },
          color: {
            column: 'timestamp',
            customDomain: domain,
            customRange: ['#ea5545', '#1bcfff'],
            domainIsDirty: true,
            lineStyles: ['solid', 'solid'],
            hideOther: false
          }
        }
      })
    })
  })

  describe('SET_CUSTOM_COLOR', () => {
    it('should set custom color domain on color property', () => {
      const domain = ['ATL', 'SFO']
      const nextState = reducer(
        {
          1: {
            savedColors: {
              custom_timestamp: {
                column: 'timestamp',
                customDomain: domain.concat(''),
                customRange: ['#ea5545', '#1bcfff', '#ea5545']
              }
            },
            color: {
              column: 'timestamp',
              customDomain: domain.concat(''),
              customRange: ['#ea5545', '#1bcfff', '#ea5545']
            }
          }
        },
        {
          type: 'SET_CUSTOM_COLOR',
          chartId: '1',
          index: 2,
          value: 'IAD',
          key: 'customDomain'
        }
      )
      expect(nextState).to.deep.equal({
        1: {
          savedColors: {
            custom_timestamp: {
              column: 'timestamp',
              customDomain: domain.concat('IAD'),
              customRange: ['#ea5545', '#1bcfff', '#ea5545'],
              domainIsDirty: true
            }
          },
          color: {
            column: 'timestamp',
            customDomain: domain.concat('IAD'),
            customRange: ['#ea5545', '#1bcfff', '#ea5545'],
            domainIsDirty: true
          }
        }
      })
    })
  })

  describe('SET_CUSTOM_DEFAULT_OTHER_COLOR', () => {
    it('should set custom color other domain on color property', () => {
      const nextState = reducer(
        {
          1: {
            savedColors: {
              custom_timestamp: {
                column: 'timestamp',
                customDomain: ['ATL', 'SFO'],
                customRange: ['#ea5545', '#1bcfff', '#ea5545']
              }
            },
            color: {
              column: 'timestamp',
              customDomain: ['ATL', 'SFO'],
              customRange: ['#ea5545', '#1bcfff', '#ea5545']
            }
          }
        },
        {
          type: 'SET_CUSTOM_DEFAULT_OTHER_COLOR',
          chartId: '1',
          value: 'IAD',
          key: 'customDefaultOtherDomain'
        }
      )
      expect(nextState).to.deep.equal({
        1: {
          savedColors: {
            custom_timestamp: {
              column: 'timestamp',
              customDomain: ['ATL', 'SFO'],
              customRange: ['#ea5545', '#1bcfff', '#ea5545'],
              customDefaultOtherDomain: 'IAD'
            }
          },
          color: {
            column: 'timestamp',
            customDomain: ['ATL', 'SFO'],
            customRange: ['#ea5545', '#1bcfff', '#ea5545'],
            customDefaultOtherDomain: 'IAD'
          }
        }
      })
    })
  })

  describe('TOGGLE_OTHER', () => {
    it('should toggle showOther property for single source charts', () => {
      const nextState = reducer(
        {
          1: {
            showOther: false,
            color: {},
            dimensions: [
              { name: 'X Axis', multiSourceIndex: 0 },
              { name: 'Color', multiSourceIndex: 0, showOther: false },
              { name: 'X Axis', multiSourceIndex: 1 },
              { name: 'Color', multiSourceIndex: 1, showOther: false }
            ]
          }
        },
        {
          type: 'TOGGLE_OTHER',
          chartId: '1'
        }
      )
      expect(nextState[1].showOther).to.eql(true)
    })
  })

  describe('TOGGLE_OTHER_MULTI_SOURCE', () => {
    it('should toggle showOther property for multi-source charts', () => {
      const nextState = reducer(
        {
          1: {
            dimensions: [
              { name: 'X Axis', multiSourceIndex: 0 },
              { name: 'Color', multiSourceIndex: 0, showOther: false },
              { name: 'X Axis', multiSourceIndex: 1 },
              { name: 'Color', multiSourceIndex: 1, showOther: false }
            ],
            color: {
              0: {},
              1: {}
            }
          }
        },
        {
          type: 'TOGGLE_OTHER_MULTI_SOURCE',
          chartId: '1',
          multiSourceIndex: 1
        }
      )
      expect(nextState).to.deep.equal({
        1: {
          dimensions: [
            { name: 'X Axis', multiSourceIndex: 0 },
            { name: 'Color', multiSourceIndex: 0, showOther: false },
            { name: 'X Axis', multiSourceIndex: 1 },
            { name: 'Color', multiSourceIndex: 1, showOther: true }
          ],
          color: {
            0: {},
            1: {
              defaultOtherRange: '#27aeef'
            }
          }
        }
      })
    })
  })

  describe('UPDATE_MEASURE_DOMAINS', () => {
    it('should update ordinal color domain', () => {
      const action = {
  type: 'UPDATE_MEASURE_DOMAINS', chartId: '1', color: ['A', 'B', 'C']
      }

      const state = {
  1: {
    savedColors: {},
    color: {},
    measures: [{}, {}, {}, {value: '', type: 'STR'}],
    dimensions: {}
  }
      }

      expect(reducer(state, action)[1].measures[3].categories).to.deep.equal([
        'A',
        'B',
        'C'
      ])
    })

  it('should update quantitative color domain', () => {
    const action =
    {
      type: 'UPDATE_MEASURE_DOMAINS', chartId: '1', color: [1, 10]
    }

    const state =
    {
      1: {measures: [{}, {}, {}, {value: '', type: 'INT'}]}
    }

    expect(reducer(state, action)[1].measures[3].minMax)
        .to.deep.equal([1, 10])
  })

  it('should update size domain', () => {
    const action =
    {
      type: 'UPDATE_MEASURE_DOMAINS', chartId: '1', size: [1, 10]
    }

    const state =
    {
      1: {measures: [{}, {}, {value: '', type: 'INT'}]}
    }

    expect(reducer(state, action)[1].measures[2].minMax)
        .to.deep.equal([1, 10])
  })

    it('should return state when no domain to add', () => {
      const action = {
  type: 'UPDATE_MEASURE_DOMAINS', chartId: '1'
      }

      const state = {
  1: {measures: [{}, {}, {value: '', type: 'INT'}]}
      }

      expect(reducer(state, action)).to.deep.equal(state)
    })
  })

  describe('UPDATE_BIN_PARAMS', () => {
    it('should update bin params for a dimension', () => {
      const nextState = reducer(
        {
          1: { dimensions: [{}], measures: [{}], type: 'pie' }
        },
        {
          type: 'UPDATE_BIN_PARAMS',
          chartId: 1,
          minMaxValues: { min_val: 100, max_val: 400 },
          cardinality: 300,
          selectorIndex: 0,
          dimension: { type: 'BOOL' },
          chartType: 'pie'
        }
      )
      expect(nextState).to.deep.equal({
        1: {
          dimensions: [
            {
              autobin: true,
              currentHighValue: 400,
              currentLowValue: 100,
              inactive: false,
              isBinnable: true,
              isBinned: true,
              isError: false,
              isRequired: true,
              loading: false,
              maxBinSize: 250,
              max_val: 400,
              min_val: 100,
              numOfBins: 12,
              cardinality: 300
            }
          ],
          hasError: true,
          measures: [
            {
              isError: false,
              isRequired: true
            }
          ],
          type: 'pie'
        }
      })
    })
  })

  describe('SET_SELECTOR_ERROR', () => {
    it('should set selector error on dimensions', () => {
      const nextState = reducer(
        {
          1: { dimensions: [{}], measures: [{}], type: 'pie' }
        },
        {
          type: 'SET_SELECTOR_ERROR',
          chartId: 1,
          index: 0,
          selectorType: 'dimensions'
        }
      )
      expect(nextState).to.deep.equal({
        '1': {
          dimensions: [
            {
              isError: true
            }
          ],
          hasError: true,
          measures: [{}],
          type: 'pie'
        }
      })
    })
    it('should set selector error on measures', () => {
      const nextState = reducer(
        {
          1: { dimensions: [{}], measures: [{}], type: 'pie' }
        },
        {
          type: 'SET_SELECTOR_ERROR',
          chartId: 1,
          index: 0,
          selectorType: 'measures'
        }
      )
      expect(nextState).to.deep.equal({
        '1': {
          dimensions: [{}],
          hasError: true,
          measures: [{ isError: true }],
          type: 'pie'
        }
      })
    })
  })

  describe('SET_CHART_HAS_ERROR', () => {
    it('should set selector error on dimensions', () => {
      const nextState = reducer(
        {
          1: { dimensions: [{}], measures: [{}], type: 'pie' }
        },
        {
          type: 'SET_CHART_HAS_ERROR',
          chartId: 1,
          error: 'Your chart is not very handsome'
        }
      )
      expect(nextState).to.deep.equal({
        '1': {
          dimensions: [{}],
          hasError: 'Your chart is not very handsome',
          measures: [{}],
          type: 'pie'
        }
      })
    })
  })

  describe('resetRangeFilter', () => {
    it('should properly reset range filter', () => {
      expect(
        resetRangeFilter(
          { currentLowValue: 1, currentHighValue: 100 },
          [0, 100],
          [[0, 100]]
        )
      ).to.deep.equal([])

  expect(resetRangeFilter({}, [1, 100], [[0, 100]])).to.deep.equal([])

  expect(resetRangeFilter(
             {currentLowValue: 0, currentHighValue: 50}, [0, 100], [[0, 100]]))
      .to.deep.equal([])

      expect(
        resetRangeFilter(
          { currentLowValue: 0, currentHighValue: 200 },
          [0, 100],
          [[0, 100]]
        )
      ).to.deep.equal([[0, 100]])
    })
  })

  describe('ADD_MULTI_SOURCE', () => {
    const chartId = 1
    const withNumericDimension = {
  [chartId]: {
    type: 'row',
    measures: [{}],
    dimensions: [{value: 'departure', type: 'INT'}],
    dataSource: 'flights',
    height: 400,
    width: 300
  }
    }

    const withTimeDimension = {
  [chartId]: {
    type: 'row',
    measures: [{}],
    dimensions: [{value: 'departure', type: 'TIMESTAMP'}],
    dataSource: 'flights',
    height: 400,
    width: 300
  }
    }
    const withoutDimension = {
  [chartId]: {
    type: 'row',
    measures: [{}],
    dimensions: [{isError: false, isRequired: false}],
    dataSource: 'flights',
    height: 400,
    width: 300,
    [restrictedDimensionTypeKey]: null
  }
    }

    const withPercentageViewEnabled = {
  [chartId]: {
    type: 'row',
    measures: [{}],
    dimensions: [{isError: false, isRequired: false}],
    dataSource: 'flights',
    height: 400,
    width: 300,
    [restrictedDimensionTypeKey]: null,
    percentageViewEnabled: true
  }
    }
    describe('transition from single source to multisource', () => {
      it('should set a numeric dimension restriction if a numeric dimension had been selected', () => {
        const newState = reducer(
          withNumericDimension,
          enterMultiSourceMode(chartId)
        )
    const chart = newState[chartId]
        expect(chart).to.have.property(
          restrictedDimensionTypeKey,
          NumericRestriction
        )
      })

      it('should set a time dimension restriction if a numeric dimension had been selected', () => {
        const newState = reducer(
          withTimeDimension,
          enterMultiSourceMode(chartId)
        )
      const chart = newState[chartId]
        expect(chart).to.have.property(
          restrictedDimensionTypeKey,
          DateTimeRestriction
        )
      })

      it('should not set a dimension restriction if no dimension was selected', () => {
        const newState = reducer(
          withoutDimension,
          enterMultiSourceMode(chartId)
        )
      const chart = newState[chartId]
        expect(chart).to.have.property(restrictedDimensionTypeKey, null)
      })

      it('should set percentageViewEnabled to false', () => {
        const newState = reducer(
          withPercentageViewEnabled,
          enterMultiSourceMode(chartId)
        )
      const chart = newState[chartId]
        expect(chart).to.have.property('percentageViewEnabled', false)
      })
    })
  })

  describe('deleting a multidata source', () => {
    /**
     * Expected behavior of deleting multisource
     * 1. It should delete all measures associated with a given source
     * 2. It should delete all dimensions associated with a given source
     * 3. It should delete the multi source itself
     * 4. If the deleted multisource is the last multisource (ie we go back to single source), then the
     * base dimensions and measures for the line2 combo chart should be present (for now, since only combo is multi source)
     */
    let chartId = 1
  let sourceToDelete = 0  // 0 based index
  const oneSourceState = reducer(state, addMultiSource(chartId, 0))
  const deleteSourceAction = getThunkActions(deleteMultiSource(chartId, sourceToDelete))[0]
  const multiDimensionCharts =
      reducer(oneSourceState, addMultiSource(chartId, 1))
  const newState = reducer(multiDimensionCharts, deleteSourceAction)

    it('should delete all measures associated with the data source', () => {
      const measures = newState[chartId].measures
    const measuresForSource = measures.filter(
        ({multiSourceIndex}) => multiSourceIndex === sourceToDelete)

      expect(measuresForSource).to.have.lengthOf(0)
    })

    it('should delete all dimensions associated with the data source', () => {
      const dimensions = newState[chartId].dimensions
    const dimensionsForSource = dimensions.filter(
        ({multiSourceIndex}) => multiSourceIndex === sourceToDelete)

      expect(dimensionsForSource).to.have.lengthOf(0)
    })

    it('should delete the source', () => {
      const dataSources = newState[chartId].multiSources
      expect(dataSources).to.not.have.property(sourceToDelete)
    })

    it('should reset the dimensions to default if all multi-aata sources are deleted', () => {
      const noSources = compose(
        state => reducer(state, getThunkActions(deleteMultiSource(chartId, 0))[0]),
        state => reducer(state, getThunkActions(deleteMultiSource(chartId, 1))[0])
      )(multiDimensionCharts)

    const dimensions = noSources[chartId].dimensions

      expect(dimensions).to.deep.equal(BASE_LINE2_DIMENSIONS)
    })

    it('should reset the measures to default if all multi-data sources are deleted', () => {
      const noSources = compose(
        state => reducer(state, getThunkActions(deleteMultiSource(chartId, 0))[0]),
        state => reducer(state, getThunkActions(deleteMultiSource(chartId, 1))[0])
      )(multiDimensionCharts)

    const measures = noSources[chartId].measures

      expect(measures).to.deep.equal(BASE_LINE2_MEASURES)
    })

    it('should reset the restrictedDimensionType to null if all the data sources are deleted', () => {
      const noSources = compose(
        state => reducer(state, getThunkActions(deleteMultiSource(chartId, 0))[0]),
        state => reducer(state, getThunkActions(deleteMultiSource(chartId, 1))[0])
      )({
        ...multiDimensionCharts,
        [chartId]: {
          ...multiDimensionCharts[chartId],
          [restrictedDimensionTypeKey]: 'Numeric'
        }
      })

    const restrictedDimensionType =
        noSources[chartId][restrictedDimensionTypeKey]

      expect(restrictedDimensionType).to.eql(null)
    })

    it('should reset the restrictedDimensionType to null if all the data sources are deleted',() => {
      const type = 'Numeric'
    const oneSource =
        compose(state => reducer(state, getThunkActions(deleteMultiSource(chartId, 0))[0]))({
          ...multiDimensionCharts,
          [chartId]:
              {...multiDimensionCharts[chartId], restrictedDimensionType: type}
        })

    const restrictedDimensionType =
        oneSource[chartId][restrictedDimensionTypeKey]

      expect(restrictedDimensionType).to.eql(type)
    })
  })
})
