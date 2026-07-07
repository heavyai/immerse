// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { produce } from "immer"
import * as presentationConstants from "vega/constants/presentation-settings-action-types"
import { ChartsState } from "vega/charts/types"
import { SCALE_TYPES } from "constants/scale-types"

export default {
  [presentationConstants.SET_ORIENTATION]: produce(
    (state: ChartsState, { chartId, orientation }) => {
      state[chartId].presentation.orientation = orientation
    }
  ),

  [presentationConstants.SET_GROUPING_MODE]: produce(
    (state: ChartsState, { chartId, groupingMode }) => {
      state[chartId].presentation.baseDimensionAxis.groupingMode = groupingMode
    }
  ),

  [presentationConstants.TOGGLE_LINE_AREA_ENABLED]: produce(
    (state: ChartsState, { chartId, lineAreaEnabled }) => {
      const current =
        state[chartId].presentation.baseDimensionAxis.lineAreaEnabled
      state[chartId].presentation.baseDimensionAxis.lineAreaEnabled =
        lineAreaEnabled ?? !current
    }
  ),

  [presentationConstants.SET_BASE_DIMENSION_TITLE]: produce(
    (state: ChartsState, { chartId, title }) => {
      state[chartId].presentation.baseDimensionAxis.title = title
    }
  ),

  [presentationConstants.SET_PRIMARY_MEASURE_TITLE]: produce(
    (state: ChartsState, { chartId, title }) => {
      state[chartId].presentation.sizeMeasurePrimaryAxis.title = title
    }
  ),

  [presentationConstants.SET_SECONDARY_MEASURE_TITLE]: produce(
    (state: ChartsState, { chartId, title }) => {
      state[chartId].presentation.sizeMeasureSecondaryAxis.title = title
    }
  ),

  [presentationConstants.SET_PRIMARY_CUMULATIVE_DISTRIBUTION_ENABLED]: produce(
    (state: ChartsState, { chartId, cumulativeDistributionEnabled }) => {
      state[
        chartId
      ].presentation.sizeMeasurePrimaryAxis.cumulativeDistributionEnabled = cumulativeDistributionEnabled
    }
  ),

  [presentationConstants.SET_PRIMARY_PERCENTAGE_DISTRIBUTION_ENABLED]: produce(
    (state: ChartsState, { chartId, percentageDistributionEnabled }) => {
      state[
        chartId
      ].presentation.sizeMeasurePrimaryAxis.percentageDistributionEnabled = percentageDistributionEnabled
    }
  ),

  [presentationConstants.SET_SECONDARY_CUMULATIVE_DISTRIBUTION_ENABLED]: produce(
    (state: ChartsState, { chartId, cumulativeDistributionEnabled }) => {
      state[
        chartId
      ].presentation.sizeMeasureSecondaryAxis.cumulativeDistributionEnabled = cumulativeDistributionEnabled
    }
  ),

  [presentationConstants.SET_SECONDARY_PERCENTAGE_DISTRIBUTION_ENABLED]: produce(
    (state: ChartsState, { chartId, percentageDistributionEnabled }) => {
      state[
        chartId
      ].presentation.sizeMeasureSecondaryAxis.percentageDistributionEnabled = percentageDistributionEnabled
    }
  ),

  [presentationConstants.SET_PRIMARY_MEASURE_FORMAT]: produce(
    (state: ChartsState, { chartId, primaryMeasureFormat }) => {
      state[
        chartId
      ].presentation.sizeMeasurePrimaryAxis.format = primaryMeasureFormat
    }
  ),

  [presentationConstants.CLEAR_PRIMARY_MEASURE_FORMAT]: produce(
    (state: ChartsState, { chartId }) => {
      state[chartId].presentation.sizeMeasurePrimaryAxis.format = null
    }
  ),

  [presentationConstants.SET_SECONDARY_MEASURE_FORMAT]: produce(
    (state: ChartsState, { chartId, secondaryMeasureFormat }) => {
      state[
        chartId
      ].presentation.sizeMeasureSecondaryAxis.format = secondaryMeasureFormat
    }
  ),

  [presentationConstants.CLEAR_SECONDARY_MEASURE_FORMAT]: produce(
    (state: ChartsState, { chartId }) => {
      state[chartId].presentation.sizeMeasureSecondaryAxis.format = null
    }
  ),

  [presentationConstants.SET_MANUAL_PRIMARY_MEASURE_DOMAIN_MIN]: produce(
    (state: ChartsState, { chartId, min }) => {
      state[chartId].presentation.sizeMeasurePrimaryAxis.manualDomainMin = min
    }
  ),

  [presentationConstants.CLEAR_MANUAL_PRIMARY_MEASURE_DOMAIN_MIN]: produce(
    (state: ChartsState, { chartId }) => {
      state[chartId].presentation.sizeMeasurePrimaryAxis.manualDomainMin = null
    }
  ),

  [presentationConstants.SET_MANUAL_PRIMARY_MEASURE_DOMAIN_MAX]: produce(
    (state: ChartsState, { chartId, max }) => {
      state[chartId].presentation.sizeMeasurePrimaryAxis.manualDomainMax = max
    }
  ),

  [presentationConstants.CLEAR_MANUAL_PRIMARY_MEASURE_DOMAIN_MAX]: produce(
    (state: ChartsState, { chartId }) => {
      state[chartId].presentation.sizeMeasurePrimaryAxis.manualDomainMax = null
    }
  ),

  [presentationConstants.SET_MANUAL_SECONDARY_MEASURE_DOMAIN_MIN]: produce(
    (state: ChartsState, { chartId, min }) => {
      state[chartId].presentation.sizeMeasureSecondaryAxis.manualDomainMin = min
    }
  ),

  [presentationConstants.CLEAR_MANUAL_SECONDARY_MEASURE_DOMAIN_MIN]: produce(
    (state: ChartsState, { chartId }) => {
      state[
        chartId
      ].presentation.sizeMeasureSecondaryAxis.manualDomainMin = null
    }
  ),

  [presentationConstants.SET_MANUAL_SECONDARY_MEASURE_DOMAIN_MAX]: produce(
    (state: ChartsState, { chartId, max }) => {
      state[chartId].presentation.sizeMeasureSecondaryAxis.manualDomainMax = max
    }
  ),

  [presentationConstants.CLEAR_MANUAL_SECONDARY_MEASURE_DOMAIN_MAX]: produce(
    (state: ChartsState, { chartId }) => {
      state[
        chartId
      ].presentation.sizeMeasureSecondaryAxis.manualDomainMax = null
    }
  ),

  [presentationConstants.SET_SCALE_TYPE]: produce(
    (state: ChartsState, { chartId, scaleType }) => {
      state[chartId].presentation.sizeMeasurePrimaryAxis.scaleType = scaleType
    }
  ),

  [presentationConstants.CLEAR_SCALE_TYPE]: produce(
    (state: ChartsState, { chartId }) => {
      state[chartId].presentation.sizeMeasurePrimaryAxis.scaleType =
        SCALE_TYPES.LINEAR
    }
  )
}
