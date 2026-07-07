// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { PaletteMapping } from "../types"

// Splits palette mappings into priorityMappings (matching given data source and col) and otherMappings
export const groupPaletteMappings = ({
  paletteMappings,
  table,
  column,
  dataSource
}: {
  paletteMappings: PaletteMapping[]
  // Data source from selector; for join sources this will be the join table backing this column
  table?: string
  column?: string
  // Data source from layer; for join sources this will be the parameterized join value
  dataSource?: string
}) => {
  const useAllMappings = !column && !table
  // Join data sources have fully qualified columns
  const parsedColumn = column?.split(".")?.[1] || column

  // Technically (hopefully usefully), this will catch mappings that don't strictly match source/col.
  // Namely: any join sources that are identical to the current join;
  // sources that match the join table of the color selector column;
  // and non-parameterized columns that match the current value of a parameterized source/col.
  const priorityMappings = useAllMappings
    ? paletteMappings
    : paletteMappings.filter((pm: PaletteMapping) => {
        const parsedPaletteMappingColumn =
          pm.column?.split(".")?.[1] || pm.column
        return (
          process(parsedPaletteMappingColumn, { trackUsage: false }) ===
            process(parsedColumn, { trackUsage: false }) &&
          [
            process(table, { trackUsage: false }),
            process(dataSource, { trackUsage: false })
          ].includes(process(pm.dataSource, { trackUsage: false }))
        )
      })

  const otherMappings = paletteMappings.filter(
    (pm: PaletteMapping) => !priorityMappings.includes(pm)
  )

  return { priorityMappings, otherMappings }
}
