// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Checkbox as RMWCCheckbox } from "@rmwc/checkbox"
import "./checkbox.scss"

export const Checkbox = ({ ...props }) => (
  <div className="sql-notebook-checkbox">
    <RMWCCheckbox {...props} />
  </div>
)
