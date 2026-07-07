// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import SourceListItem from "./source-item"
import SourcePaletteList from "./source-palette-list"

export const paletteItemsForMDSI = (palette: any[], mdsi: number) =>
  palette.filter((paletteItem) => paletteItem.multiSourceIndex === mdsi)

const paletteItemsInSourceDataValues = (paletteItems, dataValues) =>
  paletteItems.filter(
    (p) => dataValues && dataValues.map((d) => d.dataPointId).includes(p.id)
  )

interface SourceListProps {
  dataSources: any
  palette: any[]
  chartType: string | string[]
  dataSourcesValues?: [DataValue[]]
}

const SourceList = ({
  dataSources = {},
  palette = [],
  chartType = "",
  dataSourcesValues = null
}: SourceListProps) =>
  Object.keys(dataSources).map((mdsiKey) => {
    const mdsi = dataSources[mdsiKey].index
    const dataValues = dataSourcesValues && dataSourcesValues[mdsiKey]
    const paletteItems = paletteItemsForMDSI(
      palette,
      dataSources[mdsiKey].index
    )
    const renderSourceList =
      !dataSourcesValues ||
      (dataSourcesValues &&
        paletteItemsInSourceDataValues(paletteItems, dataValues).length)
    let chartTypeItems = chartType
    if (Array.isArray(chartType)) {
      if (chartType.length < paletteItems.length) {
        // shouldn't happen, but just being defensive...
        chartType = chartTypeItems = "line"
      } else {
        chartType = [...chartType]
        chartTypeItems = chartType.splice(0, paletteItems.length)
      }
    }

    return renderSourceList ? (
      <SourceListItem
        {...{
          key: mdsi,
          mdsi,
          dataSourceName: dataSources[mdsiKey].table
        }}
      >
        <SourcePaletteList
          {...{
            palette: paletteItems,
            chartType: chartTypeItems,
            dataValues
          }}
        />
      </SourceListItem>
    ) : null
  })

export default SourceList
