// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactNode, useState } from "react"
import { Icon } from "@rmwc/icon"
import classNames from "classnames"

import "./collapsible-list.scss"

export const CollapsibleList = ({
  title,
  initCollapsed = false,
  content
}: {
  title: string
  initCollapsed?: boolean
  content: ReactNode
}) => {
  const [collapsed, setCollapsed] = useState(initCollapsed)
  return (
    <div className="collapsible-list">
      <header className="selectable" onClick={() => setCollapsed(!collapsed)}>
        <strong>{title}</strong>
        <Icon
          className={classNames("header-indicator", {
            collapsed
          })}
          icon={"expand_more"}
        />
      </header>
      <div
        className={classNames("collapsible-container", {
          collapsed
        })}
      >
        <div className={classNames("collapsible", { collapsed })}>
          {content}
        </div>
      </div>
    </div>
  )
}
