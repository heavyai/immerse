// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as presentationConstants from "vega/constants/presentation-settings-action-types"
import {
  VegaComboPresentationSettings,
  BaseDimensionAxisSettings
} from "vega/constants/presentation-settings-types"
import { ScaleType } from "constants/scale-types"

export const setOrientation = (
  chartId: string,
  orientation: VegaComboPresentationSettings["orientation"]
) => ({
  type: presentationConstants.SET_ORIENTATION,
  chartId,
  orientation
})

export const setGroupingMode = (
  chartId: string,
  groupingMode: BaseDimensionAxisSettings["groupingMode"]
) => ({
  type: presentationConstants.SET_GROUPING_MODE,
  chartId,
  groupingMode
})

/*
 * If lineAreaEnabled is unspecified, the mode will toggle. Otherwise, it will be
 * set explicitly to whatever value is provided for lineAreaEnabled
 */
export const toggleLineAreaEnabled = (
  chartId: string,
  lineAreaEnabled?: boolean
) => ({
  type: presentationConstants.TOGGLE_LINE_AREA_ENABLED,
  chartId,
  lineAreaEnabled
})

export const setBaseDimensionTitle = (chartId: string, title: string) => ({
  type: presentationConstants.SET_BASE_DIMENSION_TITLE,
  chartId,
  title
})

export const setPrimaryMeasureTitle = (chartId: string, title: string) => ({
  type: presentationConstants.SET_PRIMARY_MEASURE_TITLE,
  chartId,
  title
})

export const setSecondaryMeasureTitle = (chartId: string, title: string) => ({
  type: presentationConstants.SET_SECONDARY_MEASURE_TITLE,
  chartId,
  title
})

export const setPrimaryCumulativeDistributionEnabled = (
  chartId: string,
  cumulativeDistributionEnabled: boolean
) => ({
  type: presentationConstants.SET_PRIMARY_CUMULATIVE_DISTRIBUTION_ENABLED,
  chartId,
  cumulativeDistributionEnabled
})

export const setPrimaryPercentageDistributionEnabled = (
  chartId: string,
  percentageDistributionEnabled: boolean
) => ({
  type: presentationConstants.SET_PRIMARY_PERCENTAGE_DISTRIBUTION_ENABLED,
  chartId,
  percentageDistributionEnabled
})

export const setSecondaryCumulativeDistributionEnabled = (
  chartId: string,
  cumulativeDistributionEnabled: boolean
) => ({
  type: presentationConstants.SET_SECONDARY_CUMULATIVE_DISTRIBUTION_ENABLED,
  chartId,
  cumulativeDistributionEnabled
})

export const setSecondaryPercentageDistributionEnabled = (
  chartId: string,
  percentageDistributionEnabled: boolean
) => ({
  type: presentationConstants.SET_SECONDARY_PERCENTAGE_DISTRIBUTION_ENABLED,
  chartId,
  percentageDistributionEnabled
})

export const setPrimaryMeasureFormat = (
  chartId: string,
  primaryMeasureFormat: string
) => ({
  type: presentationConstants.SET_PRIMARY_MEASURE_FORMAT,
  chartId,
  primaryMeasureFormat
})

export const clearPrimaryMeasureFormat = (chartId: string) => ({
  type: presentationConstants.CLEAR_PRIMARY_MEASURE_FORMAT,
  chartId
})

export const setSecondaryMeasureFormat = (
  chartId: string,
  secondaryMeasureFormat: string
) => ({
  type: presentationConstants.SET_SECONDARY_MEASURE_FORMAT,
  chartId,
  secondaryMeasureFormat
})

export const clearSecondaryMeasureFormat = (chartId: string) => ({
  type: presentationConstants.CLEAR_SECONDARY_MEASURE_FORMAT,
  chartId
})

export const setManualPrimaryMeasureDomainMin = (
  chartId: string,
  min: number
) => ({
  type: presentationConstants.SET_MANUAL_PRIMARY_MEASURE_DOMAIN_MIN,
  chartId,
  min
})

export const clearManualPrimaryMeasureDomainMin = (chartId: string) => ({
  type: presentationConstants.CLEAR_MANUAL_PRIMARY_MEASURE_DOMAIN_MIN,
  chartId
})

export const setManualPrimaryMeasureDomainMax = (
  chartId: string,
  max: number
) => ({
  type: presentationConstants.SET_MANUAL_PRIMARY_MEASURE_DOMAIN_MAX,
  chartId,
  max
})

export const clearManualPrimaryMeasureDomainMax = (chartId: string) => ({
  type: presentationConstants.CLEAR_MANUAL_PRIMARY_MEASURE_DOMAIN_MAX,
  chartId
})

export const setManualSecondaryMeasureDomainMin = (
  chartId: string,
  min: number
) => ({
  type: presentationConstants.SET_MANUAL_SECONDARY_MEASURE_DOMAIN_MIN,
  chartId,
  min
})

export const clearManualSecondaryMeasureDomainMin = (chartId: string) => ({
  type: presentationConstants.CLEAR_MANUAL_SECONDARY_MEASURE_DOMAIN_MIN,
  chartId
})

export const setManualSecondaryMeasureDomainMax = (
  chartId: string,
  max: number
) => ({
  type: presentationConstants.SET_MANUAL_SECONDARY_MEASURE_DOMAIN_MAX,
  chartId,
  max
})

export const clearManualSecondaryMeasureDomainMax = (chartId: string) => ({
  type: presentationConstants.CLEAR_MANUAL_SECONDARY_MEASURE_DOMAIN_MAX,
  chartId
})

export const setScaleType = (chartId: string, scaleType: ScaleType) => ({
  type: presentationConstants.SET_SCALE_TYPE,
  chartId,
  scaleType
})

export const clearScaleType = (chartId: string) => ({
  type: presentationConstants.CLEAR_SCALE_TYPE,
  chartId
})
