// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import VegaChartFormatSelector, {
  numberFormatOptions
} from "vega/components/ChartFormatting/VegaChartFormatSelector"
import {
  DataTypes,
  isNumericType,
  isTimeType
} from "../../constants/data-types"
import { dateFormatOptions } from "vega/components/ChartFormatting/VegaChartDateFormatting"

type Props = {
  selected: string
  onPopupColumnFormat: (format: string) => void
  columnType: DataTypes
}
const PopupFormatterComponent: FC<Props> = ({
  selected,
  onPopupColumnFormat,
  columnType
}) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  const onPopupFormat = (val: string) => {
    onPopupColumnFormat(val)
    setMenuIsOpen(false)
  }

  const handleToggleDropdown = () => {
    setMenuIsOpen(!menuIsOpen)
  }

  let formatOptions = []
  if (isNumericType(columnType)) {
    formatOptions = numberFormatOptions
  } else if (isTimeType(columnType)) {
    formatOptions = dateFormatOptions
  }

  return (
    <div className="popup-formatter">
      <VegaChartFormatSelector
        format={selected}
        axisLabel={"Formatter"}
        onFormatValueChange={onPopupFormat}
        baseOptions={formatOptions}
        disabled={false}
        tooltip={"Popup formatter"}
        wrapperMenuIsOpen={menuIsOpen}
        toggleFormatSelector={handleToggleDropdown}
      />
    </div>
  )
}

export default PopupFormatterComponent
