// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { MenuItem } from "@rmwc/menu"
import { SecondaryButton } from "widgets/button/Button"
import { CollapsibleList } from "../components/collapsible-list"
import { PaletteMapping } from "../types"
import { PaletteMappingSelectorItem } from "../palette-mapping/palette-mapping-selector-item"
import cx from "classnames"

// Returns true if search term is found in mapping name, dataSource, or column
const mappingFieldIncludesTerm = (
  mapping: PaletteMapping,
  searchTerm: string
) => {
  if (!searchTerm) {
    return true
  }
  const searchTermLower = searchTerm.toLowerCase()
  return [mapping.name, mapping.dataSource, mapping.column].some((field) =>
    (field || "").toLowerCase().includes(searchTermLower)
  )
}

export const PaletteMappingImportCollapsibleList = ({
  dataSource,
  column,
  searchTerm,
  mappings,
  setImportMapping,
  showSourceAndCol,
  title,
  initCollapsed
}: {
  dataSource?: string
  column?: string
  searchTerm: string
  mappings: PaletteMapping[]
  setImportMapping: (mapping: PaletteMapping) => void
  showSourceAndCol?: boolean
  title?: string
  initCollapsed?: boolean
}) => {
  return (
    <CollapsibleList
      title={
        title ||
        (dataSource && column
          ? `${dataSource} • ${column}`
          : "Palette Mappings")
      }
      initCollapsed={initCollapsed}
      content={mappings
        .filter((m) => mappingFieldIncludesTerm(m, searchTerm))
        .map((m) => (
          <MenuItem
            className={cx("palette-mapping-import-list__menu-item", {
              "palette-mapping-import-list__menu-item--expanded": showSourceAndCol
            })}
            key={m.id}
            disabled
          >
            <PaletteMappingSelectorItem
              mapping={m}
              showSourceAndCol={showSourceAndCol}
            />
            <SecondaryButton
              label="Import"
              onClick={() => {
                setImportMapping(m)
              }}
            />
          </MenuItem>
        ))}
    />
  )
}
