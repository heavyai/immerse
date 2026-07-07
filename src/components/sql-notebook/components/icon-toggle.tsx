// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from "classnames"
import React from "react"
import { TooltipIfContent } from "components/tooltip-if-content/tooltip-if-content"

import "./icon-toggle.scss"

export const IconToggle = ({
  IconComponent,
  className,
  selected = false,
  onClick,
  tooltip,
  label
}: {
  IconComponent: React.FC<any>
  className?: string
  selected: boolean
  onClick: () => void
  tooltip: string
  label?: string
}) => {
  return (
    <TooltipIfContent content={tooltip} enterDelay={500}>
      <div
        className={classNames("icon-toggle", className, { selected })}
        onClick={onClick}
        role="switch"
        aria-checked={selected}
        aria-label={label}
      >
        <IconComponent />
      </div>
    </TooltipIfContent>
  )
}
