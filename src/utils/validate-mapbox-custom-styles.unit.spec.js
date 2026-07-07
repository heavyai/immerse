// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"

import validateMapboxCustomStyles from "./validate-mapbox-custom-styles"

describe("Mapbox Custom Basemap Styles Validation", () => {
  it("It should return an empty array for no mapboxCustomStyles", () => {
    const emptyConfig = {}
    expect(validateMapboxCustomStyles(emptyConfig)).to.deep.equal([])
  })

  it("It should return an empty array for incorrect mapboxCustomStyles", () => {
    const configs = [{}, {}, {}]

    configs[0].mapboxCustomStyles = [
      {
        wrong: "",
        keys: 0
      }
    ]

    configs[1].mapboxCustomStyles = {
      label: "some layer",
      value: {}
    }

    configs.forEach(config => {
      expect(validateMapboxCustomStyles(config)).to.deep.equal([])
    })
  })

  it("It should return the mapboxCustomStyles property if configured correctly", () => {
    const config = {
      mapboxCustomStyles: [
        {
          label: "my custom basemap",
          value: "fake/path/to/style-spec.json"
        },
        {
          label: "my other custom style",
          value: {
            version: 8,
            sources: {},
            layers: []
          }
        }
      ]
    }

    expect(validateMapboxCustomStyles(config)).to.deep.equal(
      config.mapboxCustomStyles
    )
  })
})
