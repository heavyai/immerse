// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import cx from "classnames"
import { Icon } from "@rmwc/icon"
import { TooltipIfContent } from "components/tooltip-if-content/tooltip-if-content"

import "./drawer.scss"

interface IDrawerProps {
  className?: string
  position: string
  drawerOpen: boolean
  tabText?: string
  tabIcon?: Element | FC<any>
  tabTooltip?: string
  children: any
  toggleDrawerCallback: (openState: boolean) => void
  selectorFunction?: (state: any) => boolean
  dispatchFunction?: any
}

const Drawer: FC<IDrawerProps> = ({
  className,
  position,
  drawerOpen = false,
  tabText,
  tabIcon,
  tabTooltip,
  children,
  toggleDrawerCallback = () => {},
  selectorFunction,
  dispatchFunction
}) => {
  const [internalOpen, setInternalOpen] = useState(drawerOpen)

  // if a redux selector is passed in, connect it to drawerOpen prop
  drawerOpen = useSelector(selectorFunction || (() => drawerOpen))

  useEffect(() => {
    setInternalOpen(drawerOpen)
  }, [drawerOpen])

  const setOpenState = (openState: boolean) => {
    setInternalOpen(openState)
    toggleDrawerCallback(openState)

    // if a dispatch function is passed in, update redux
    if (dispatchFunction) {
      dispatchFunction(openState)
    }
  }

  return (
    <div
      className={cx("drawer", className, {
        "drawer-right": position === "right",
        "drawer-left": position === "left",
        "drawer-top": position === "top",
        "drawer-bottom": position === "bottom"
      })}
    >
      {(position === "right" || position === "left") && (
        <div
          className="drawer-toggle-tab"
          onClick={() => setOpenState(!internalOpen)}
        >
          {tabText && (
            <div className="drawer-toggle-text">
              {tabText}
              <div className="close-icon">
                {internalOpen && <Icon icon="close" />}
              </div>
            </div>
          )}
          {tabIcon && (
            <div
              className={cx("drawer-toggle-icon", {
                drawer_icon__open: internalOpen
              })}
            >
              {!internalOpen ? (
                <TooltipIfContent
                  content={tabTooltip ?? undefined}
                  enterDelay={300}
                >
                  <span className="drawer-toggle-icon-container">
                    {tabIcon}
                  </span>
                </TooltipIfContent>
              ) : (
                <div className="close-icon">
                  <Icon icon="close" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div
        className={cx("drawer-content", {
          drawer__open: internalOpen
        })}
      >
        <div className="drawer-body">{children}</div>
      </div>
      {(position === "top" || position === "bottom") && (
        <div
          className="drawer-toggle-tab"
          onClick={() => setOpenState(!internalOpen)}
        >
          {tabText && (
            <div className="drawer-toggle-text">
              {tabText}
              <div className="close-icon">
                {internalOpen && <Icon icon="close" />}
              </div>
            </div>
          )}
          {tabIcon && <div className="drawer-toggle-icon">{tabIcon}</div>}
        </div>
      )}
    </div>
  )
}

export default Drawer
