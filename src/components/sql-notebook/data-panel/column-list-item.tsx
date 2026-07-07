// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { ListItemWithActions } from "./list-item-with-actions"
import { ColumnMetadata } from "constants/prop-types"
import { IItemAction } from "./row-action"
import { TableRowDescription } from "vega/charts/types"

// We mash together column metadata and table row details
export type ColumnBrowserRow = ColumnMetadata & TableRowDescription
interface IColumnListItem {
  row: ColumnBrowserRow
  rowActions: Array<IItemAction<ColumnBrowserRow>>
}

/**
 * Thin wrapper around the generic to provide attribute to display, pass correct props
 */
export const ColumnListItem = ({ row, rowActions }: IColumnListItem) => {
  return (
    <ListItemWithActions<ColumnBrowserRow, "name", "comment">
      titleAttribute="name"
      descriptionAttribute="comment"
      item={row}
      actions={rowActions}
    />
  )
}
