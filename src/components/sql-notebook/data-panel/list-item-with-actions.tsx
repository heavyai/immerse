// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"

import { Tooltip } from "@rmwc/tooltip"
import { IItemAction, RowAction } from "./row-action"

import "./list-item-with-actions.scss"

export type TableItem = {
  value: string
  label: string
}

export const TABLE_LIST_ITEM_HEIGHT = 40
const TOOLTIP_DELAY = 1000

// Generic type I is the item type
export const ListItemWithActions = <
  I extends object,
  T extends keyof I,
  D extends keyof I = any
>({
  item,
  titleAttribute,
  descriptionAttribute,
  actions,
  onSelect
}: {
  item: I
  titleAttribute: T
  descriptionAttribute?: D
  actions: Array<IItemAction<I>>
  onSelect?: (i: any) => void
}) => {
  return (
    <div className="list-item-with-actions__container">
      <div
        className={cx("list-item-with-actions", {
          "is-selectable": onSelect
        })}
        onClick={() => onSelect?.(item)}
      >
        <div className="list-item-with-actions__info">
          <Tooltip enterDelay={TOOLTIP_DELAY} content={item[titleAttribute]}>
            <div className="list-item-with-actions__title">
              {item[titleAttribute]}
            </div>
          </Tooltip>
          {descriptionAttribute && (
            <Tooltip
              enterDelay={TOOLTIP_DELAY}
              content={item[descriptionAttribute]}
            >
              <div className="list-item-with-actions__description">
                {item[descriptionAttribute]}
              </div>
            </Tooltip>
          )}
        </div>
        <div className="list-item-with-actions__actions">
          {actions.map((action, i) => {
            return <RowAction<I> action={action} item={item} key={i} />
          })}
        </div>
      </div>
    </div>
  )
}
