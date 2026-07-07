// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { isDictString, isGeo } from "constants/data-types"
import DataColumnSelector from "components/data-column-selector/data-column-selector"
import { ColumnMetadata } from "constants/prop-types"
import { Icon } from "@rmwc/icon"
import { Link } from "@material-ui/core"

import "./styles.scss"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

export type ColumnMetadataWithSelected = ColumnMetadata & {
  isSelected?: boolean
}

const JOINABLE_TYPES = new Set([
  "BIGINT",
  "INT",
  "SMALLINT",
  "TINYINT",
  "DATE",
  "TIME",
  "TIMESTAMP"
])

const GEO_JOINABLE_TYPES = new Set([
  "POINT",
  "LINESTRING",
  "MULTILINESTRING",
  "POLYGON",
  "MULTIPOLYGON"
])

const isColumnJoinable = (
  columnMetadata: ColumnMetadata,
  targetDataType?: string,
  joinableTypes = JOINABLE_TYPES
) => {
  let dataTypeMatches = true
  if (targetDataType) {
    if (isGeo(targetDataType)) {
      dataTypeMatches = isGeo(columnMetadata.type)
    } else {
      dataTypeMatches = columnMetadata.type === targetDataType
    }
  }
  return (
    dataTypeMatches &&
    (joinableTypes.has(columnMetadata.type) || isDictString(columnMetadata))
  )
}

interface Props {
  columnMetadata: ColumnMetadata[]
  dataTypeFilter?: string
  onSelectColumn: (col: ColumnMetadata) => void
  selectedColumnValue?: string
  loading?: boolean
}

const JoinColumnSelector = ({
  columnMetadata,
  dataTypeFilter,
  onSelectColumn,
  selectedColumnValue,
  loading = false
}: Props) => {
  const [showHidden, setShowHidden] = useState(false)
  const toggleShowHidden = () => setShowHidden((prevHidden) => !prevHidden)

  const geoJoinsEnabled = getFeatureFlag(
    available_feature_flags.ENABLE_GEO_JOINS
  )
  const joinableTypes = geoJoinsEnabled
    ? new Set([...JOINABLE_TYPES, ...GEO_JOINABLE_TYPES])
    : JOINABLE_TYPES
  return (
    <div className="join-column-selector">
      <div className="join-column-selector__data-table-wrapper">
        <DataColumnSelector
          data={columnMetadata
            .filter(
              (metadata) =>
                showHidden ||
                isColumnJoinable(metadata, dataTypeFilter, joinableTypes)
            )
            .map((metadata) => ({
              ...metadata,
              isSelected: metadata.value === selectedColumnValue
            }))}
          onSelectRow={onSelectColumn}
          searchFieldPlaceholder="Search columns"
          filterCategoriesLabel="Data Filter Type:"
          searchFieldLabel=""
          rowIconOptions={{
            iconRenderer: (row: ColumnMetadataWithSelected) =>
              row.isSelected ? <Icon icon="done" /> : null
          }}
          shouldDisableRowSelection={(row: ColumnMetadataWithSelected) =>
            !isColumnJoinable(row, dataTypeFilter, joinableTypes)
          }
          loading={loading}
        />
      </div>
      <div className="join-show-hidden-columns">
        <Link className="join-modal-link" onClick={toggleShowHidden}>
          <Icon icon={showHidden ? "visibility" : "visibility_off"} />
          {`${showHidden ? "Hide" : "Show"} hidden columns`}
        </Link>
      </div>
    </div>
  )
}

export default JoinColumnSelector
