// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"
import LoadingWidget from "components/app-overlay/loading-widget"

import "./results-loading-spinner.scss"

export const ResultsLoadingSpinner = ({ hasData }: { hasData: boolean }) => (
  <div
    className={cx("results-loading-spinner", {
      "results-loading-spinner--no-data": !hasData
    })}
  >
    <LoadingWidget />
  </div>
)
