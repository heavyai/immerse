// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"
import cx from "classnames"
import Services from "services/immerse"
import SqlEditorDataViewer from "components/sql-editor/sql-editor-data-viewer"
import JoinColumnSelector, {
  ColumnMetadataWithSelected
} from "components/join-column-selector"
import { ColumnMetadata } from "constants/prop-types"
import IconNoSource from "components/svg-icons/icon-no-source"

const buildPreviewQuery = (
  source: string,
  column: string,
  sortColumn?: string
) => {
  const sort = sortColumn ? `ORDER BY ${sortColumn}` : ""
  return `SELECT ${column} FROM ${source} ${sort} LIMIT 3`
}

interface Props {
  source?: string
  selectedColumnValue?: string
  selectColumn: (col: ColumnMetadataWithSelected | null) => void
  label: string
  dataTypeFilter?: string
  columnOptions: ColumnMetadataWithSelected[]
}

const JoinKeyPreview = ({
  source,
  selectedColumnValue,
  selectColumn,
  label,
  dataTypeFilter,
  columnOptions
}: Props) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const setColumnPreviewData = async () => {
      if (source && selectedColumnValue) {
        try {
          setLoading(true)
          const result = await Services.get("DbCon").queryAsync(
            buildPreviewQuery(source, selectedColumnValue)
          )
          setData(result)
        } catch (e) {
          // Previews and counts aren't *strictly* necessary to complete the flow, so stagger along.
          // eslint-disable-next-line no-console
          console.error(e)
        } finally {
          setLoading(false)
        }
      }
    }

    setColumnPreviewData()
  }, [selectedColumnValue, source])

  const [columnViewerHeight, setColumnViewerHeight] = useState(140)
  const clampColumnViewerHeight = (height: number) => {
    setColumnViewerHeight(height)
  }

  const emptyState = (
    <div className="join-manager-no-source-state">
      <IconNoSource />
      <div className="join-manager-no-source-header">NO SOURCE SELECTED</div>
      <div className="join-manager-no-source-message">
        {`To see available keys select "Source ${label}"`}
      </div>
    </div>
  )

  return (
    <div className={`join-key-preview join-key-preview--${label}`}>
      <>
        <div
          className={cx("join-key-preview__column-selector", {
            "join-key-preview__column-selector--selected-column":
              selectedColumnValue && !loading
          })}
        >
          {/* such such overkill */}
          {Boolean(selectedColumnValue) && !loading && (
            <SqlEditorDataViewer
              data={{
                results: data,
                fields: columnOptions
                  .filter(
                    (col: ColumnMetadata) => col.value === selectedColumnValue
                  )
                  .map((col: ColumnMetadata) => ({ ...col, name: col.label }))
              }}
              key={`${selectedColumnValue}-${label}`}
              viewerHeight={columnViewerHeight}
              setViewerHeight={clampColumnViewerHeight}
              shouldAdjustColWidth={false}
              maxColWidth={198}
              minColWidth={198}
              lineHeight={14}
              maxRowHeight={100}
            />
          )}
          <div>
            <div className="join-key-preview__header">
              <span>{`COMMON KEY ${label}`}</span>
              {selectedColumnValue && (
                <span
                  className="join-key-preview__header__clear"
                  onClick={() => selectColumn(null)}
                >
                  Clear
                </span>
              )}
            </div>
            {source ? (
              <JoinColumnSelector
                columnMetadata={columnOptions}
                onSelectColumn={(row: ColumnMetadataWithSelected) => {
                  const { isSelected: _, ...metadata } = row
                  selectColumn(metadata)
                }}
                selectedColumnValue={selectedColumnValue}
                dataTypeFilter={dataTypeFilter}
              />
            ) : (
              emptyState
            )}
          </div>
        </div>
      </>
    </div>
  )
}

export default JoinKeyPreview
