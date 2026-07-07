// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import ChartSettingsBasemapDropdownParent from "components/chart-settings-basemap-dropdown/chart-settings-basemap-dropdown-parent"

type Props = {
  chartId: string
}

const DeckGLBaseSettings: FC<Props> = ({ chartId }) => {
  return (
    <div className="chart-editor-section map-themes">
      <div className="chart-editor-label">Map Theme</div>
      <ChartSettingsBasemapDropdownParent chartId={chartId} />
    </div>
  )
}

export default DeckGLBaseSettings
