// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { ColumnMetadata } from "constants/prop-types"
import { NumericDataPreview } from "./numeric/numeric-data-preview"
import { ROLLUP_COLUMN_TYPES, getRollupType } from "./utils"

import { CategoricalDataPreview } from "./categorical/categorical-data-preview"
import "./data-preview.scss"
import { TemporalDataPreview } from "./temporal/temporal-data-preview"
import { GeospatialDataPreview } from "./geospatial/geospatial-data-preview"

export const DataPreview = ({ column }: { column: ColumnMetadata }) => {
  const getPreview = () => {
    const rollupType = getRollupType(column.type)
    const { NUMERIC, CATEGORICAL, DATETIME, GEOSPATIAL } = ROLLUP_COLUMN_TYPES
    switch (rollupType) {
      case NUMERIC:
        return <NumericDataPreview column={column} />
      case CATEGORICAL:
        return <CategoricalDataPreview column={column} />
      case DATETIME:
        return <TemporalDataPreview column={column} />
      case GEOSPATIAL:
        return <GeospatialDataPreview column={column} />
      default:
        return <div> No Preview Available </div>
    }
  }

  return <div className="sql-notebook-data-preview">{getPreview()}</div>
}
