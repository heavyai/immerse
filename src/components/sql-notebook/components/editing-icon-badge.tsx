// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { IconEdit } from "components/svg-icons/icon-edit"

import "./editing-icon-badge.scss"

export const EditingIconBadge = () => {
  return (
    <div className="editing-icon-badge">
      <IconEdit />
    </div>
  )
}
