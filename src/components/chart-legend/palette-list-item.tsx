// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import MarkStyleIcon from "./mark-style-icon"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

type PaletteItem = {
  id: string
  key: string
  style: string
  value: string
}

export type DataValue = {
  dataPointId: string
  value: any
}

const PaletteListItem = (
  chartType: string[] | string,
  dataValues?: DataValue[]
) => (
  {
    key: paletteItemLabel,
    style,
    value,
    id: paletteItemDataPointId
  }: PaletteItem,
  key: number
): React.ReactElement | boolean => {
  const dataValue =
    dataValues &&
    dataValues.find((d) => d.dataPointId === paletteItemDataPointId)
  const renderItem =
    (dataValues && dataValues.length && dataValue) || !dataValues
  return (
    renderItem && (
      <li {...{ key }}>
        <MarkStyleIcon
          {...{
            style,
            value,
            chartType: Array.isArray(chartType) ? chartType[key] : chartType
          }}
        />
        {
          <span className="paletteLabelItem">
            {paletteItemLabel &&
              process(paletteItemLabel, { useDisplayName: true })}
          </span>
        }
        {dataValue && (
          <span className="data-point-value ml-1">{`${dataValue.value}`}</span>
        )}
      </li>
    )
  )
}

export default PaletteListItem
