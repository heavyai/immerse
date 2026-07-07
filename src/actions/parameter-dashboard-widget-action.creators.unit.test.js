// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { addParameterToLayout } from "actions/parameter-dashboard-widget-action-creators"

const parameterDataGrid = {
  x: 0,
  y: 0,
  h: 8,
  w: 10,
  i: "parameter-container"
}

const containerUnderParameter = {
  w: 20,
  h: 5,
  x: 5,
  y: 10,
  i: "bottom-container"
}

describe("Parameter widget action creators", () => {
  it("should shift any grid container down if adding a parameter on top of it", async () => {
    const newLayout = addParameterToLayout(parameterDataGrid, [
      containerUnderParameter
    ])

    expect(newLayout).toEqual([
      {
        ...containerUnderParameter,
        y: 18
      },
      parameterDataGrid
    ])
  })

  it("should not shift a grid container down if it's to the right of the inserted parameter widget", async () => {
    const containerToRight = {
      w: 7,
      h: 11,
      x: 10,
      y: 10,
      i: "right-container"
    }

    const newLayout = addParameterToLayout(parameterDataGrid, [
      containerToRight
    ])

    expect(newLayout).toEqual([containerToRight, parameterDataGrid])
  })

  it("should shift a grid container down if it's underneath another shifted container", async () => {
    const topRightContainer = {
      w: 10,
      h: 10,
      x: 10,
      y: 0,
      i: "top-right-container"
    }

    // No overlap with where parameter widget is being added, but should be
    // pushed down by containerUnderParameter
    const bottomRight = {
      w: 10,
      h: 5,
      x: 15,
      y: 15,
      i: "bottom-right"
    }

    const newLayout = addParameterToLayout(parameterDataGrid, [
      topRightContainer,
      containerUnderParameter,
      bottomRight
    ])

    expect(newLayout).toEqual([
      topRightContainer,
      { ...containerUnderParameter, y: 18 },
      { ...bottomRight, y: 23 },
      parameterDataGrid
    ])
  })
})
