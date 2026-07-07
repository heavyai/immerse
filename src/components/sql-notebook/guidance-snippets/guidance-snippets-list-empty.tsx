// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { NutIcon } from "components/svg-icons/icon-nut"
import "./guidance-snippets-list-empty.scss"

export const GuidanceSnippetsListEmpty = () => (
  <div className="guidance-snippets-list-empty">
    <NutIcon />
    <h3>No guidance snippets have been added</h3>
    <p>
      Add guidance snippets to HeavyIQ to help with domain expertise and
      increase accuracy
    </p>
  </div>
)
