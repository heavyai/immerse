// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { TooltipIfContent } from "components/tooltip-if-content/tooltip-if-content"
import cx from "classnames"
import "./row-action.scss"

interface IActionIcon<I> {
  item: I
}
export interface IItemAction<I> {
  Icon: React.FC<IActionIcon<I>>
  onClick: (item: I) => void
  managesInteraction?: boolean
  title?: string
  isDisabled?: (item?: I) => boolean
  disabledTooltip?: string
}
export const RowAction = <T,>({
  action,
  item
}: {
  action: IItemAction<T>
  item: T
}) => {
  const {
    Icon,
    onClick,
    title,
    isDisabled,
    disabledTooltip,
    managesInteraction
  } = action
  const disabled = isDisabled?.(item) ?? false
  return (
    <TooltipIfContent
      content={
        managesInteraction ? undefined : disabled ? disabledTooltip : title
      }
      enterDelay={850}
    >
      <div
        role={managesInteraction ? undefined : "button"}
        className={cx("sql-notebook__row-action", {
          disabled
        })}
        onClick={
          managesInteraction
            ? undefined
            : (e) => {
                e.stopPropagation()
                onClick(item)
              }
        }
      >
        <Icon item={item} />
      </div>
    </TooltipIfContent>
  )
}
