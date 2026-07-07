// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isMultiLayer } from "../charts/raster-chart/raster-utils"
import pushid from "pushid"

export const RASTER_LAYER_ID_PREFIX = "rasterLayerId"
export const initRasterLayerIds = (layers = [], chartId, chartType) =>
  isMultiLayer(chartType)
    ? layers.map((l) => {
        const newRasterLayerId = `${RASTER_LAYER_ID_PREFIX}:${pushid()}`
        return !l.rasterLayerId
          ? {
              ...l,
              rasterLayerId: newRasterLayerId
            }
          : { ...l }
      })
    : [...layers]
