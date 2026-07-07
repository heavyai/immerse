// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import cx from "classnames"
import React, { FC } from "react"
import { SimpleListItem } from "@rmwc/list"
import { List } from "react-virtualized"
import { Tooltip } from "@rmwc/tooltip"

import "./styles.scss"

// Max number of rows visible without scrolling
// We switch to a virtualized list once we hit this number.
const MAX_VISIBLE_ROWS = 6
const ROW_HEIGHT = 32

export type ListOption = {
  value: any
  label: string
}

type Props = {
  options: ListOption[]
  onSelect: (option: ListOption) => void
  width: number
  selectedIndex?: number
  maxVisibleRows?: number
  rowHeight?: number
  showTooltip?: boolean
  getOptionTooltip: (option: ListOption) => any
  getOptionLabel: (option: ListOption) => any
}

export const ResponsiveVirtualizedList: FC<Props> = ({
  options,
  onSelect,
  width,
  showTooltip,
  selectedIndex,
  maxVisibleRows = MAX_VISIBLE_ROWS,
  rowHeight = ROW_HEIGHT,
  getOptionTooltip = (option) => option.label,
  getOptionLabel = (option) => option.label
}) => {
  const useVirtualized = options.length > maxVisibleRows

  const listItem = (key, style, index) => (
    <SimpleListItem
      key={key}
      onClick={() => onSelect(options[index])}
      style={style}
      index={index}
      selected={selectedIndex === index}
    >
      <div className="option-text">{getOptionLabel(options[index])}</div>
    </SimpleListItem>
  )
  const renderListItem = ({ key, style, index }: any) =>
    showTooltip ? (
      <Tooltip content={getOptionTooltip(options[index])} align="topLeft">
        {listItem(key, style, index)}
      </Tooltip>
    ) : (
      listItem(key, style, index)
    )

  const virtualizedList = (
    <div className="virtualized-container mdc-list compact">
      <List
        rowRenderer={renderListItem}
        width={width || 164}
        height={maxVisibleRows * rowHeight}
        rowCount={options.length}
        rowHeight={rowHeight}
        scrollToIndex={selectedIndex}
      />
    </div>
  )

  return (
    <div
      className={cx("responsive-virtualized-list", {
        virtualized: useVirtualized
      })}
    >
      {useVirtualized ? (
        virtualizedList
      ) : (
        <div className="mdc-list compact" style={{ width: width || 164 }}>
          {options.map((option, i) =>
            renderListItem({ key: `${option.label}-${i}`, index: i })
          )}
        </div>
      )}
    </div>
  )
}
