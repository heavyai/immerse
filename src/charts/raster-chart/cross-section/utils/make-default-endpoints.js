// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { EndpointDefaultOptions } from "../constants"

export function makeDefaultEndpoints(lonBounds, latBounds, defaultOption) {
  const [lonMin, lonMax] = lonBounds
  const [latMin, latMax] = latBounds

  switch (defaultOption) {
    case EndpointDefaultOptions.NORTH:
      return [
        [lonMin, latMax],
        [lonMax, latMax]
      ]
    case EndpointDefaultOptions.WEST:
      return [
        [lonMin, latMin],
        [lonMin, latMax]
      ]
    case EndpointDefaultOptions.EAST:
      return [
        [lonMax, latMin],
        [lonMax, latMax]
      ]
    case EndpointDefaultOptions.SOUTH:
    default:
      return [
        [lonMin, latMin],
        [lonMax, latMin]
      ]
  }
}
