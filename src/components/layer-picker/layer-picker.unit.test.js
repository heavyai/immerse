// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"

import LayerPicker from "./layer-picker"

describe("LayerPicker Component", () => {
  function renderPicker(props) {
    return render(<LayerPicker {...props} />)
  }

  const chart = {
    dcFlag: 1,
    layers: [
      {
        type: "pointmap",
        measures: []
      }
    ],
    areFiltersInverse: false,
    autoSize: false,
    elasticX: false,
    cap: 0,
    dimensions: [],
    filters: []
  }
  const saveCurrentLayer = jest.fn()

  it("mounts can calls saveCurrentLayer", () => {
    renderPicker({
      saveCurrentLayer,
      chart,
      layers: chart.layers,
      addLayer: () => {},
      deleteLayer: () => {},
      dispatch: () => {},
      id: "0",
      showMaster: () => {},
      switchLayer: () => {}
    })
    expect(saveCurrentLayer).toHaveBeenCalled()
  })
})
