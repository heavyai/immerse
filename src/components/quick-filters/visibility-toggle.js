// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { EyeIcon } from "components/svg-icons/icon-eye"
import React from "react"

export const VisibilityToggle = ({ handleToggle, classNames }) => (
  <div className={classNames || "inline-icon"} onClick={handleToggle}>
    <EyeIcon />
  </div>
)
