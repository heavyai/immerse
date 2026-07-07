// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PointmapDisplaySettings from "./pointmap-display-settings"

const PointmapChartSettings = (props) => (
  <PointmapDisplaySettings chartId={props.id} updateChart={props.updateChart} />
)

export default PointmapChartSettings
