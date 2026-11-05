// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Compile source against patched modular D3, avoiding the embedded old parser.
// Keep the extracted stylesheet behind ./combo-styles.css; upstream's bundle
// entry also imports SCSS and would duplicate the existing stylesheet.
export { default as Chart } from "@heavyai/d3-combo-chart/src/charts/chart"
export {
  default as Tooltip,
  formatTooltipTitle,
  formatDataPoint
} from "@heavyai/d3-combo-chart/src/charts/tooltip"
export { default as Legend } from "@heavyai/d3-combo-chart/src/charts/legend"
export { default as DataGenerator } from "@heavyai/d3-combo-chart/src/charts/data-manager"
export { default as Observer } from "@heavyai/d3-combo-chart/src/charts/observer"
export { default as Binning } from "@heavyai/d3-combo-chart/src/charts/binning"
export { default as DomainEditor } from "@heavyai/d3-combo-chart/src/charts/domain-editor"
export { default as BrushRangeEditor } from "@heavyai/d3-combo-chart/src/charts/brush-range-editor"
export { default as Label } from "@heavyai/d3-combo-chart/src/charts/label"
export { default as Brush } from "@heavyai/d3-combo-chart/src/charts/brush"
export { default as Hover } from "@heavyai/d3-combo-chart/src/charts/hover"
export * as Interactors from "@heavyai/d3-combo-chart/src/charts/interactors"
export { colors } from "@heavyai/d3-combo-chart/src/charts/helpers/colors"
export * as d3 from "@heavyai/d3-combo-chart/src/charts/helpers/d3-service"
export { default as autoFormatter } from "@heavyai/d3-combo-chart/src/charts/helpers/auto-format"
export * as Constants from "@heavyai/d3-combo-chart/src/charts/helpers/constants"
export * as _Utils from "@heavyai/d3-combo-chart/src/charts/helpers/common"
export { default as Scale } from "@heavyai/d3-combo-chart/src/charts/scale"
