// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clearOverlay,
  findLargestGeotypeJoinCount,
  initializeCount,
  mapJoinKeysToResults,
  mapGeoDataToMetaDataNames,
  setUpMetaDataNames
} from "./choropleth-chart"
import proxyquire from "proxyquire"
import { noop } from "utils/helpers"

const mySpy = jest.fn()
const { maybeParseTopojson } = proxyquire("./choropleth-chart", {
  topojson: { feature: mySpy }
})

describe("Choropleth", () => {
  describe("Initialize Count", () => {
    it("should map names and set count to 0", () => {
      const jsonJoinKeys = ["name", "abbr"]
      expect(initializeCount(jsonJoinKeys)({})).toStrictEqual({
        name: 0,
        abbr: 0
      })
    })
  })

  describe("mapJoinKeysToResults", () => {
    it("map join keys and add counts to countMap object", () => {
      const results = [
        { key0: "California", val: 2226899 },
        { key0: "New York", val: 6226899 }
      ]
      const jsonJoinKeys = ["name", "abbr"]
      const names = {
        name: { california: true, "new york": true },
        abbr: { ca: true, ny: true }
      }
      const countMap = initializeCount(jsonJoinKeys)({})
      expect(
        mapJoinKeysToResults(results, jsonJoinKeys, names)(countMap)
      ).toStrictEqual({ name: 2, abbr: 0 })
    })

    it("should ignore keys that have arrays in them", () => {
      const results = [
        { key0: [1, 100], val: 2226899 },
        { key0: [1, 100], val: 6226899 }
      ]
      const jsonJoinKeys = ["name", "abbr"]
      const names = {
        name: { california: true, "new york": true },
        abbr: { ca: true, ny: true }
      }
      const countMap = initializeCount(jsonJoinKeys)({})
      expect(
        mapJoinKeysToResults(results, jsonJoinKeys, names)(countMap)
      ).toStrictEqual({ name: 0, abbr: 0 })
    })
  })

  describe("findLargestGeotypeJoinCount", () => {
    it("should return largest name, and count in an objcet", () => {
      const countMap = { name: 49, abbr: 0 }
      expect(findLargestGeotypeJoinCount(countMap)).toStrictEqual({
        geoType: "name",
        maxCount: 49
      })
    })
  })

  describe("mapGeoDataToMetaDataNames", () => {
    it("should map and set to lowercase feature.properties to metaData name", () => {
      const geo = {
        metaData: {
          features: [
            {
              properties: { abbr: "AL", name: "Alabama" }
            }
          ],
          names: {
            abbr: {},
            name: {}
          }
        }
      }
      expect(mapGeoDataToMetaDataNames(geo)).toStrictEqual({
        metaData: {
          features: [
            {
              properties: {
                abbr: "AL",
                name: "Alabama"
              }
            }
          ],
          names: {
            abbr: {
              al: true
            },
            name: {
              alabama: true
            }
          }
        }
      })
    })

    describe("maybeParseTopojson", () => {
      const chartSpec = {
        geoJsonConfig: {
          "countries.json": {
            label: "Countries",
            isTopo: true,
            topoKey: "countries",
            keys: ["name", "iso_a2", "iso_a3"]
          },
          "us-states.json": {
            label: "US State",
            isTopo: false,
            topoKey: "",
            keys: ["name", "abbr"]
          },
          "us-counties.json": {
            label: "US Counties",
            isTopo: true,
            topoKey: "counties",
            keys: ["name", "state", "county", "fips"]
          }
        }
      }

      it("should not run topojson feature if json file is geojson based", () => {
        const jsonFile = "us-states.json"
        expect(maybeParseTopojson(chartSpec, jsonFile)({})).toStrictEqual({
          metaData: {}
        })
        expect(mySpy).not.toHaveBeenCalled()
      })
    })

    describe("setUpMetaDataNames", () => {
      it("should map json join keys to ", () => {
        const jsonJoinKeys = ["name", "abbr"]
        const geo = {
          metaData: {}
        }
        expect(setUpMetaDataNames(jsonJoinKeys)(geo)).toStrictEqual({
          metaData: {
            names: {
              abbr: {},
              name: {}
            }
          }
        })
      })
    })

    describe("clearOverlay", () => {
      it("should run two functions when clearing overlay ", () => {
        const chart = { removeGeoJson: jest.fn(), legend: jest.fn() }
        const callback = jest.fn()
        clearOverlay(chart, callback)
        expect(chart.removeGeoJson).toHaveBeenCalled()
        expect(callback).toHaveBeenCalled()
        expect(chart.legend).toHaveBeenCalled()
      })
      it("removes legend if present", () => {
        const removeLegend = jest.fn()
        const chart = { removeGeoJson: noop, legend: () => ({ removeLegend }) }
        const callback = noop
        clearOverlay(chart, callback)
        expect(removeLegend).toHaveBeenCalled()
      })
    })
  })
})
