// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PaletteListItem, { DataValue } from "./palette-list-item"

type SourcePaletteListProps = {
  palette: any[]
  chartType: string | string[]
  dataValues?: DataValue[]
}

const SourcePaletteList = ({
  palette,
  chartType,
  dataValues
}: SourcePaletteListProps): React.ReactElement => (
  <ul className="list-unstyled">
    {palette.map(PaletteListItem(chartType, dataValues))}
  </ul>
)

export default SourcePaletteList
