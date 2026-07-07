// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import LoadingWidget from "components/app-overlay/loading-widget"
import React from "react"

import "./loader-with-height.scss"
import { STAT_ROW_HEIGHT } from "./utils"

export const LoaderWithHeight = ({ height = STAT_ROW_HEIGHT }) => {
  return (
    <section style={{ minHeight: height }} className="loader-with-height">
      <LoadingWidget />
    </section>
  )
}
