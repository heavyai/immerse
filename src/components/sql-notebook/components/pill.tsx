// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Icon } from "@rmwc/icon"
import classNames from "classnames"
import React from "react"

import { TooltipIfContent } from "components/tooltip-if-content/tooltip-if-content"

import "./pill.scss"

type PillProps = {
  label: string
  onClick?: ((s: string) => void) | null
  onRemove?: ((s: string) => void) | null
  tooltip?: string | null
}
export const Pill = ({
  label,
  onClick = null,
  onRemove = null,
  tooltip = label
}: PillProps) => {
  const clickable = onClick !== null
  const removable = onRemove !== null
  return (
    <TooltipIfContent content={tooltip} enterDelay={500}>
      <div
        className={classNames("sql-notebook-pill", {
          "sql-notebook-pill--read-only": !clickable,
          "sql-notebook-pill--removable": removable
        })}
        onClick={() => onClick?.(label)}
      >
        <span className="sql-notebook-pill__label">{label}</span>
        {removable && (
          <div className="sql-notebook-pill__trailing-icon">
            <Icon
              icon="close"
              onClick={(e: any) => {
                e.stopPropagation()
                onRemove?.(label)
              }}
            />
          </div>
        )}
      </div>
    </TooltipIfContent>
  )
}
