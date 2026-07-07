// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Tooltip } from "@rmwc/tooltip"
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
  return (
    <Tooltip
      align={disabled ? "top" : "right"}
      activateOn={disabled ? "hover" : "click"}
      content={disabled ? disabledTooltip : <DataPreview column={item} />}
      className={cx("data-preview-tooltip", { disabled })}
      enterDelay={disabled ? 850 : 0}
    >
      <div
        className={cx("data-preview-trigger", {
          disabled
        })}
      >
        <IconInfoOutline />
      </div>
    </Tooltip>
  )
}
