// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import {
  getChartAddonOfType,
  getChartAddonTypes,
  registerChartAddon
} from "chart-addons/chart-addon-registry"

import {
  useLegacyFilters,
  useLegacySetCrossFilter,
  useLegacyChartingCrossFilterId,
  useIsUserGeneratedFilter
} from "charts/utils/hooks"

import { CrossFilterReplayIcon } from "chart-addons/crossfilter-replay/CrossFilterReplayIcon"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { ENABLE_CROSSFILTER_REPLAY } = available_feature_flags

const { CHART_ADDON_CROSSFILTER_REPLAY } = getChartAddonTypes()
const CrossFilterReplay = getChartAddonOfType(CHART_ADDON_CROSSFILTER_REPLAY)
  .component

const updateFilterAtFrame = ({ filter, frame }) => {
  return [filter[frame - 1]]
}

export const PieCrossFilterReplay = ({ chartId, chartAddonId }) => {
  const crossfilterId = useLegacyChartingCrossFilterId(chartId)
  const userGeneratedFilter = useIsUserGeneratedFilter(crossfilterId)

  const filter = useLegacyFilters({
    chartId
  })

  const setCrossFilter = useLegacySetCrossFilter(chartId, {
    forceUserGenerated: false
  })

  return (
    <div>
      <CrossFilterReplay
        chartId={chartId}
        chartAddonId={chartAddonId}
        filter={filter}
        setCrossFilter={setCrossFilter}
        updateFilterAtFrame={updateFilterAtFrame}
        defaultFrames={filter?.length}
        calculateFrames={({ filter: f }) => f.length}
        userGeneratedFilter={userGeneratedFilter}
      />
      {filter[0] !== undefined && <div>Replays over : {filter.join(", ")}</div>}
    </div>
  )
}

if (getFeatureFlag(ENABLE_CROSSFILTER_REPLAY)) {
  registerChartAddon({
    type: "PIE_CHART_ADDON_CROSSFILTER_REPLAY",
    label: "CrossFilter Replay",
    component: PieCrossFilterReplay,
    icon: <CrossFilterReplayIcon />
  })
}
