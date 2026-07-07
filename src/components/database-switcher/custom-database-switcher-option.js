// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import IconOpenNewTab from "../svg-icons/icon-open-new-tab"
import React from "react"
import { routeToDashboardsList } from "../../utils/routerPath"

export const CustomDatabaseSwitcherOption = (
  dispatchExchangeSession,
  wrapChange = (f) => f()
) => ({ data: { label, value: dbName }, innerProps }) => (
  <div
    {...{
      className: "database-switcher-option",
      ...innerProps,
      onClick: () => {
        if (typeof innerProps.onClick === "function") {
          innerProps.onClick()
        }
        return wrapChange(() => dispatchExchangeSession(dbName))
      }
    }}
  >
    <span className="database-switcher-option-label">{label}</span>
    <a
      {...{
        href: routeToDashboardsList(dbName),
        target: "_blank",
        onClick: (e) => e.stopPropagation(),
        className: "database-switcher-option-icon"
      }}
    >
      <IconOpenNewTab />
    </a>
  </div>
)
