// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as fetchJsonPromiseModule from "../utils/fetch-json-promise"
import geocoder from "./geocoder"

const geojson = {
  geometry: {
    location: { lng: 10, lat: 10 },
    viewport: {
      northeast: { lng: 10, lat: 10 },
      southwest: { lng: 10, lat: 10 }
    }
  }
}

const data = {
  results: [geojson]
}
let initGeocoder

describe("Geocoder", () => {
  beforeEach(() => {
    jest
      .spyOn(fetchJsonPromiseModule, "fetchJsonPromiseCrossOrigin")
      .mockImplementation(() => {
        return Promise.resolve(data)
      })

    initGeocoder = geocoder()
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should have a location method that returns geojson", () => {
    return initGeocoder.locate("california").then((result) => {
      expect(result).toEqual({
        bounds: {
          sw: [10, 10],
          ne: [10, 10]
        }
      })
    })
  })

  it("should parse low zoom level and return geojson", () => {
    return initGeocoder.locate("california, !1").then((result) => {
      expect(result).toEqual({
        bounds: {
          sw: [10, 10],
          ne: [10, 10]
        },
        center: [10, 10],
        zoom: 1
      })
    })
  })

  it("should parse high zoom level and return geojson", () => {
    return initGeocoder.locate("california, !10").then((result) => {
      expect(result).toEqual({
        bounds: {
          sw: [10, 10],
          ne: [10, 10]
        },
        center: [10, 10],
        zoom: 10
      })
    })
  })

  it("should parse zoom level and return geojson with query in parentheses", () => {
    return initGeocoder.locate("(california, !10)").then((result) => {
      expect(result).toEqual({
        bounds: {
          sw: [10, 10],
          ne: [10, 10]
        },
        center: [10, 10],
        zoom: 10
      })
    })
  })
})
