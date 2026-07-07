// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { useSelector } from "react-redux"
import { TextField } from "@rmwc/textfield"
import { AppState } from "vega/charts/types"
import { EmptyState } from "components/empty-state/empty-state"
import { PaletteMapping } from "../types"
import { PaletteMappingImportLoading } from "./palette-mapping-import-loading"
import { groupPaletteMappings } from "../util/group-palette-mappings"
import { PaletteMappingImportCollapsibleList } from "./palette-mapping-import-collapsible-list"
import "./palette-mapping-import-list.scss"

export const PaletteMappingImportList = ({
  setImportMapping,
  table,
  column
}: {
  setImportMapping: (mapping: PaletteMapping) => void
  table?: string
  column?: string
}) => {
  const isLoading = useSelector(
    (state: AppState) => state.sharedSettingsImport.loading
  )
  const error = useSelector(
    (state: AppState) => state.sharedSettingsImport.error
  )
  const importMappings = useSelector(
    (state: AppState) =>
      state.sharedSettingsImport.sharedSettings.mappings || []
  )

  const [searchTerm, setSearchTerm] = useState("")

  const { priorityMappings, otherMappings } = groupPaletteMappings({
    paletteMappings: importMappings,
    table,
    column
  })

  return (
    <div className="palette-mapping-import-list">
      <TextField
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        label="Search by mapping name, source, or column"
      />
      <div className="palette-mapping-import-list__items">
        {isLoading && <PaletteMappingImportLoading />}
        {error && <div>Error loading mappings</div>}
        {!isLoading && !error && (
          <>
            {priorityMappings.length ? (
              <PaletteMappingImportCollapsibleList
                mappings={priorityMappings}
                dataSource={table}
                column={column}
                searchTerm={searchTerm}
                setImportMapping={setImportMapping}
                showSourceAndCol={!table || !column}
              />
            ) : (
              <EmptyState description="No Palette Mappings available that match datasource and column" />
            )}
            {Boolean(otherMappings.length) && (
              <PaletteMappingImportCollapsibleList
                mappings={otherMappings}
                searchTerm={searchTerm}
                setImportMapping={setImportMapping}
                title="Other Mappings"
                showSourceAndCol
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
