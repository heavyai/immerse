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
  useLegacyChartingCrossFilterId
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

export const PointmapCrossFilterReplay = ({ chartId, chartAddonId }) => {
  const crossfilterId = useLegacyChartingCrossFilterId(chartId)

  const filter = useLegacyFilters({
    chartId,
    name: crossfilterId,
    useGeneratedInternalId: false
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
        camera
      />
    </div>
  )
}

if (getFeatureFlag(ENABLE_CROSSFILTER_REPLAY)) {
  registerChartAddon({
    type: "POINTMAP_ADDON_CROSSFILTER_REPLAY",
    label: "CrossFilter Replay",
    component: PointmapCrossFilterReplay,
    icon: <CrossFilterReplayIcon />
  })
}
