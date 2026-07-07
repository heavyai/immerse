// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch } from "react-redux"
import { EditableValue } from "components/editable-value/editable-value"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"
import { hasInvalidParameter } from "utils/has-invalid-parameter"
import { PaletteMapping } from "../types"
import { setPaletteMappingName } from "../palette-mapping-thunks"
import "./palette-mapping-selector-item.scss"

// "Custom" mapping source/cols are either:
// 1. undefined, indicating non-parameterized custom SQL (local to a specific chart)
//    or a mapping that has been imported from any source/col that cannot be accessed
// 2. a parameter that cannot be accessed by this dashboard
const isCustomMappingSourceOrCol = (val?: string) =>
  !val || hasInvalidParameter(val)

export const PaletteMappingSelectorItem = ({
  mapping,
  showSourceAndCol,
  editable = false
}: {
  mapping: PaletteMapping
  showSourceAndCol?: boolean
  editable?: boolean
}) => {
  const dispatch = useDispatch()

  // If source is a join, display join name
  const joinSource = useJoinFromParameter(mapping.dataSource)
  const dataSourceLabel = joinSource ? joinSource.name : mapping.dataSource

  const hasCustomSource = isCustomMappingSourceOrCol(mapping.dataSource)
  const hasCustomColumn = isCustomMappingSourceOrCol(mapping.column)

  const sourceColumnLabel =
    hasCustomSource && hasCustomColumn
      ? "Custom"
      : `${hasCustomSource ? "Custom" : dataSourceLabel} • ${
          hasCustomColumn ? "Custom" : mapping.column
        }`

  return (
    <div className="palette-mapping-selector__palette-mapping-item">
      <div className="palette-mapping-item__labels">
        {mapping.name && editable ? (
          <EditableValue
            savedValue={mapping.name}
            submitValue={(name) => {
              if (name?.length) {
                dispatch(setPaletteMappingName(mapping.id, name))
                return Promise.resolve({ ok: true })
              } else {
                // Don't set the name, just set it back to what it was
                return Promise.resolve({ ok: true })
              }
            }}
            setError={() => {}}
          />
        ) : (
          <div className="palette-mapping-item__name" title={mapping.name}>
            {mapping.name}
          </div>
        )}

        {(!mapping.name || showSourceAndCol) && (
          <div
            className="palette-mapping-item__source-col"
            title={sourceColumnLabel}
          >
            {sourceColumnLabel}
          </div>
        )}
      </div>
      <div className="palette-mapping-item__palette">
        {mapping.mapping.customRange.map((rangeColor: string, idx: number) => {
          return (
            <div
              key={idx}
              style={{
                backgroundColor: rangeColor
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
