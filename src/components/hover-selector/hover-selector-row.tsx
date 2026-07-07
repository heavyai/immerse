// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, ReactNode } from "react"
import Icon from "components/icon/icon"
import PopupFormatterComponent from "./popup-formatter-component"
import { PopupColumnType } from "../../constants/prop-types"
import { isNumericType, isTimeType } from "../../constants/data-types"
import cx from "classnames"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import IconDrag from "../svg-icons/icon-drag"

type Props = {
  columnOption: PopupColumnType
  selectedFormat: string
  removeColumn: (columnOption: PopupColumnType) => void
  updatePopupColumnFormat: (
    columnOption: PopupColumnType,
    format: string
  ) => void
  connectDragSource: (el: ReactNode) => ReactNode
  connectDropTarget: (el: ReactNode) => ReactNode
  isDragging: boolean
  isOver: boolean
  isGrouped: boolean
}
const HoverSelectorRow: FC<Props> = ({
  columnOption,
  selectedFormat,
  removeColumn,
  updatePopupColumnFormat,
  connectDragSource,
  connectDropTarget,
  isDragging,
  isOver,
  isGrouped
}) => {
  const handleCloseClick = () => {
    removeColumn(columnOption)
  }

  const onUpdatePopupColumnFormat = (format: string) => {
    updatePopupColumnFormat(columnOption, format)
  }

  return connectDropTarget(
    <div className={cx("hover-selector-row", { "is-over": isOver })}>
      {connectDragSource(
        <div className={cx("drag-area", { "is-dragging": isDragging })}>
          <div className="hover-selector-drag">
            <IconDrag />
          </div>
          <div className={"hover-selector-value"}>
            {process(columnOption.label, { useDisplayName: true })}
          </div>
        </div>
      )}
      {columnOption.value.length &&
      (isNumericType(columnOption.type) || isTimeType(columnOption.type)) ? (
        <PopupFormatterComponent
          onPopupColumnFormat={onUpdatePopupColumnFormat}
          selected={selectedFormat}
          columnType={columnOption.type}
        />
      ) : null}
      {removeColumn && !isGrouped && (
        <div className="hover-selector-value-close" onClick={handleCloseClick}>
          <Icon name="x" />
        </div>
      )}
    </div>
  )
}

export default HoverSelectorRow
