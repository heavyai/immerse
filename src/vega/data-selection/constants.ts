// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const DEFAULT_SUPPORTED_FEATURES = Object.freeze({
  multiBaseDimension: true,
  groupByDimension: true,
  multiBaseMeasure: true,
  colorByMeasure: true,
  multiLayer: true
})

export type DataSelectionPanelFeatures = {
  multiBaseDimension?: boolean
  groupByDimension?: boolean
  multiBaseMeasure?: boolean
  colorByMeasure?: boolean
  multiLayer?: boolean
}
