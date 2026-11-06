// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { MenuSurface, MenuSurfaceAnchor, Tooltip } from "@immerse/ui"
import { ColumnMetadata } from "constants/prop-types"
import { DataPreview } from "../data-preview/data-preview"
import cx from "classnames"
import { IconInfoOutline } from "components/svg-icons/icon-info-outline"

import "./data-preview-trigger.scss"

export const DataPreviewTrigger = ({
  item,
  disabled = false,
  disabledTooltip
}: {
  item: ColumnMetadata
  disabled?: boolean
  disabledTooltip?: string | null
}) => {
  const [open, setOpen] = useState(false)
  const columnName = item.name || item.value
  const trigger = (
    <button
      type="button"
      className={cx("data-preview-trigger", { disabled, "is-open": open })}
      aria-label={`Preview ${columnName}`}
      aria-haspopup={disabled ? undefined : "dialog"}
      aria-expanded={disabled ? undefined : open}
      aria-disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        if (!disabled) {
          setOpen(!open)
        }
      }}
    >
      <IconInfoOutline />
    </button>
  )

  if (disabled) {
    return (
      <Tooltip content={disabledTooltip} enterDelay={850}>
        {trigger}
      </Tooltip>
    )
  }

  return (
    <MenuSurfaceAnchor>
      <Tooltip
        asChild
        content="Column Data Preview"
        open={open ? false : undefined}
        enterDelay={850}
      >
        {trigger}
      </Tooltip>
      <MenuSurface
        open={open}
        onClose={() => setOpen(false)}
        focusOnOpen={false}
        side="right"
        sideOffset={8}
        className="data-preview-popover"
        aria-label={`${columnName} column preview`}
      >
        <DataPreview column={item} />
      </MenuSurface>
    </MenuSurfaceAnchor>
  )
}
