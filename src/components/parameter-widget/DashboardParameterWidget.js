// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import ParameterWidget from "components/parameter-widget"

const DashboardParameterWidget = (props) => (
  <ParameterWidget
    {...{
      ...props,
      dashboardWidget: true
    }}
  />
)

export default DashboardParameterWidget
