// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useId, useRef, useState } from "react"
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
  // Keep metadata stable for the lifetime of an open preview, even if the
  // table browser renders new row objects after a selection/store update.
  const [previewColumn, setPreviewColumn] = useState<ColumnMetadata | null>(
    null
  )
  const open = previewColumn !== null
  const triggerRef = useRef<HTMLButtonElement>(null)
  const previewId = useId()
  const columnName = item.name || item.value

  useEffect(() => {
    if (!open) {
      return undefined
    }
    // Capture outside presses even when application controls stop bubbling.
    const dismissOutside = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        !triggerRef.current?.contains(target) &&
        !document.getElementById(previewId)?.contains(target)
      ) {
        setPreviewColumn(null)
      }
    }
    document.addEventListener("pointerdown", dismissOutside, true)
    return () =>
      document.removeEventListener("pointerdown", dismissOutside, true)
  }, [open, previewId])
  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      className={cx("data-preview-trigger", { disabled, "is-open": open })}
      aria-label={`Preview ${columnName}`}
      aria-haspopup={disabled ? undefined : "dialog"}
      aria-expanded={disabled ? undefined : open}
      aria-disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        if (!disabled) {
          setPreviewColumn(open ? null : item)
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
      {trigger}
      <MenuSurface
        id={previewId}
        open={open}
        onClose={() => setPreviewColumn(null)}
        // Portal clicks still bubble through React's table-row ancestors.
        onClick={(event) => event.stopPropagation()}
        focusOnOpen={false}
        side="right"
        sideOffset={8}
        className="data-preview-popover"
        aria-label={`${columnName} column preview`}
      >
        {previewColumn && <DataPreview column={previewColumn} />}
      </MenuSurface>
    </MenuSurfaceAnchor>
  )
}
