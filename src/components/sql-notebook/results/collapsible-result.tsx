// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { IconFolderEllipses } from "components/svg-icons/icon-folder-ellipses"
import React, { forwardRef, useImperativeHandle, useState } from "react"

import { Icon } from "@rmwc/icon"
import classNames from "classnames"

import "./collapsible-result.scss"

type CollapsibleResultProps = {
  title?: String
  children: Array<JSX.Element> | JSX.Element
  initExpanded: boolean
}

export type CollapsibleResultRef = {
  collapse: () => void
  expand: () => void
}
export const CollapsibleResult = forwardRef(
  (
    {
      title = "Query Results",
      initExpanded = false,
      children
    }: CollapsibleResultProps,
    ref: React.ForwardedRef<CollapsibleResultRef>
  ) => {
    const [collapsed, setCollapsed] = useState(!initExpanded)
    const [hasOpened, setHasOpened] = useState(!collapsed)

    useImperativeHandle(ref, () => {
      return {
        collapse: () => {
          setCollapsed(true)
        },
        expand: () => {
          setHasOpened(true)
          setCollapsed(false)
        }
      }
    })
    return (
      <div className="collapsible-result">
        <div
          className="result-header"
          onClick={() => {
            // It has officially been opened
            if (!hasOpened && collapsed) {
              setHasOpened(true)
            }

            setCollapsed(!collapsed)
          }}
        >
          <div className="header-section">
            <IconFolderEllipses />
            <span className="header-title">{title}</span>
          </div>
          <div className="header-section">
            <Icon
              className={classNames("header-indicator", { collapsed })}
              icon={"expand_more"}
            />
          </div>
        </div>
        <div className={classNames("collapsible-container", { collapsed })}>
          <div className={classNames("collapsible", { collapsed })}>
            {hasOpened ? children : null}
          </div>
        </div>
      </div>
    )
  }
)
