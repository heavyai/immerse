// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"

import { LeftPanelTabKey } from "../types"
import "./left-panel-tab.scss"

export const LeftPanelTab = ({
  tabKey,
  label,
  activeTabKey,
  setActiveTab
}: {
  tabKey: LeftPanelTabKey
  label: string
  activeTabKey: LeftPanelTabKey
  setActiveTab: (tab: LeftPanelTabKey) => void
}) => (
  <div
    className={cx("sql-notebook-left-panel-tab", {
      "sql-notebook-left-panel-tab--active": activeTabKey === tabKey
    })}
    onClick={() => setActiveTab(tabKey)}
  >
    {label}
  </div>
)
