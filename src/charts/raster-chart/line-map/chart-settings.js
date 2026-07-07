// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import LinemapDisplaySettings from "./linemap-display-settings"

const LinemapChartSettings = (props) => (
  <LinemapDisplaySettings chartId={props.id} updateChart={props.updateChart} />
)

export default LinemapChartSettings
