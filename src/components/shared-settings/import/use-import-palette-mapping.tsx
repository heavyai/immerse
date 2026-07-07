// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import pushid from "pushid"
import { AppState } from "vega/charts/types"
import { clearImportDashboardId } from "actions/shared-settings-import-action-creators"
import { hasInvalidParameter } from "utils/has-invalid-parameter"
import { PaletteMapping } from "../types"
import { addPaletteMapping } from "../palette-mapping-thunks"

export const useImportPaletteMapping = (
  applyMappingToChart: (m: PaletteMapping) => void
) => {
  const dispatch = useDispatch()

  const paletteMappings = useSelector(
    (state: AppState) => state.sharedSettings.mappings || []
  )

  // Mapping selected for import; set when mapping has been selected but not imported into state yet
  // Allows customizing import name
  const [importMapping, setImportMapping] = useState<
    PaletteMapping | undefined
  >()

  // ID of last imported mapping
  const [importedMappingId, setImportedMappingId] = useState("")

  // Add palette mapping to dashboard state
  const doImport = (name: string) => {
    const mappingId = pushid()
    if (importMapping) {
      const hasInvalidDataSource = hasInvalidParameter(importMapping.dataSource)
      dispatch(
        addPaletteMapping({
          mapping: importMapping.mapping,
          mappingId,
          name,
          dataSource: hasInvalidDataSource
            ? undefined
            : importMapping.dataSource,
          column:
            hasInvalidDataSource || hasInvalidParameter(importMapping.column)
              ? undefined
              : importMapping.column
        })
      )
    }

    setImportMapping(undefined)
    setImportedMappingId(mappingId)
  }

  // Apply mapping to chart once palette mapping is imported into redux
  useEffect(() => {
    if (!importedMappingId) {
      return
    }

    const mapping = paletteMappings.find((m) => m.id === importedMappingId)

    if (mapping) {
      applyMappingToChart(mapping)
      setImportedMappingId("")
      dispatch(clearImportDashboardId())
    }
  }, [applyMappingToChart, dispatch, importedMappingId, paletteMappings])

  return { doImport, importMapping, setImportMapping }
}
