// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { CircularProgress } from "@rmwc/circular-progress"

import "./palette-mapping-import-loading.scss"

export const PaletteMappingImportLoading = () => (
  <div className="palette-mapping-import-loading">
    <CircularProgress size="medium" />
  </div>
)
