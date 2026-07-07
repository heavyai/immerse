// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"
import { MenuItem } from "@rmwc/menu"
import { EmptyState } from "components/empty-state/empty-state"
import { PaletteMapping } from "../types"
import { PaletteMappingSelectorItem } from "./palette-mapping-selector-item"
import { CollapsibleList } from "../components/collapsible-list"
import "./collapsible-palette-mapping-list.scss"

export const CollapsiblePaletteMappingList = ({
  paletteMappings,
  title,
  onSelect,
  initCollapsed = false,
  showSourceAndCol
}: {
  paletteMappings: PaletteMapping[]
  title: string
  onSelect: (pm: PaletteMapping) => void
  initCollapsed?: boolean
  showSourceAndCol?: boolean
}) => {
  return (
    <div className="collapsible-palette-mapping-list">
      {paletteMappings.length ? (
        <CollapsibleList
          title={title}
          onSelect={onSelect}
          initCollapsed={initCollapsed}
          content={paletteMappings.map((pm: PaletteMapping) => {
            return (
              <MenuItem
                key={pm.id}
                onClick={() => onSelect(pm)}
                className={cx({
                  "collapsible-palette-mapping-list__menu-item--expanded": showSourceAndCol
                })}
              >
                <PaletteMappingSelectorItem
                  mapping={pm}
                  showSourceAndCol={showSourceAndCol}
                />
              </MenuItem>
            )
          })}
        />
      ) : (
        <EmptyState description="No Palette Mappings available that match datasource and column" />
      )}
    </div>
  )
}
