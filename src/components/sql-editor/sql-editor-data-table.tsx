// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useRef } from "react"
import { AutoSizer, Grid } from "react-virtualized"
import { compose, mapProps } from "recompose"
import trimTextWithEllipsis from "utils/trim-text-with-ellipsis"
import cx from "classnames"

const MIN_COL_WIDTH = 120
const MAX_COL_WIDTH = 320
const CHAR_WIDTH = 8.2
const MIN_ROW_HEIGHT = 32
const TABLE_PADDING = 24
const LINE_HEIGHT = 12

// How many rows or columns it will sample to determine a suitable
// height/width for the different cells. Pre-determined cell sizes
// are needed for virtualized grid.
const COL_SAMPLESIZE = 50
const ROW_SAMPLESIZE = 100

const parseRows = (data) =>
  data.results.map((row) =>
    data.fields.map((header) => {
      const value = row[header.name]
      if (value instanceof Date) {
        return value.toISOString()
      } else {
        return value === null || value === undefined ? "null" : value.toString()
      }
    })
  )

const getHeader = (data, showColumnTypes: boolean) =>
  data.fields.map((d) => (showColumnTypes ? [d.name, d.type] : d.name))

export const dataToArray = (props) => ({
  rows: [
    getHeader(props.data, props.showColumnTypes),
    ...parseRows(props.data)
  ],
  ...props
})

const getTrueTableHeight = (elms) => {
  const lastElm = elms[elms.length - 1]
  return lastElm.clientHeight + lastElm.offsetTop + TABLE_PADDING
}

const adjustColWidth = (index, lastIndex, style, tableWidth) => {
  if (index === lastIndex && style.left + style.width < tableWidth) {
    return Object.assign({}, style, {
      width: style.width + tableWidth - style.left
    })
  }
  return style
}

const SqlEditorDataTable = ({
  rows,
  setViewerHeight,
  viewerHeight,
  selectedColumnIndex,
  maxColWidth = MAX_COL_WIDTH,
  minColWidth = MIN_COL_WIDTH,
  minRowHeight = MIN_ROW_HEIGHT,
  maxRowHeight,
  shouldAdjustColWidth = true,
  showColumnTypes = false,
  charWidth = CHAR_WIDTH,
  lineHeight = LINE_HEIGHT
}: {
  rows: any // fixme
  setViewerHeight: () => () => number // ?? fixme
  viewerHeight: number
  selectedColumnIndex?: number
  maxColWidth?: number
  minColWidth?: number
  minRowHeight?: number
  maxRowHeight?: number
  shouldAdjustColWidth?: boolean
  showColumnTypes?: boolean
  charWidth?: number
  lineHeight?: number
}) => {
  const tableRef = useRef(null)

  const hasSingleCell = () => {
    return rows[0].length === 1 && rows.length === 2
  }

  const cellRenderer = ({ columnIndex, key, rowIndex, style, parent }) => {
    const isHeader = rowIndex === 0
    const className = cx("table-cell", {
      "table-data": Boolean(rowIndex),
      "table-header": rowIndex === 0,
      "last-row": rowIndex === rows.length - 1,
      "selected-column": columnIndex === selectedColumnIndex
    })
    const testId = `sql-editor-results-${rowIndex ? "" : "header-"}cell`
    const newStyle = shouldAdjustColWidth
      ? adjustColWidth(
          columnIndex,
          parent.props.columnCount - 1,
          style,
          Math.min(tableRef.current.clientWidth, MAX_COL_WIDTH)
        )
      : style

    const value = rows[rowIndex][columnIndex]
    if (isHeader && showColumnTypes && Array.isArray(value)) {
      const [columnName, columnType] = value
      return (
        <div
          className={className}
          key={key}
          style={newStyle}
          title={columnName}
          data-testid={testId}
        >
          <div className="table-header--name">{columnName}</div>
          <div className="table-header--type">{columnType}</div>
        </div>
      )
    } else {
      const stringValue = hasSingleCell() ? value : trimTextWithEllipsis(value)
      return (
        <div
          className={className}
          key={key}
          style={newStyle}
          title={stringValue}
          data-testid={testId}
        >
          {stringValue}
        </div>
      )
    }
  }

  const onSectionRendered = () => {
    const trueTableHeight = getTrueTableHeight(
      tableRef.current.getElementsByClassName("table-cell")
    )
    setViewerHeight(trueTableHeight)
  }

  const getColumnWidth = ({ index }) => {
    const valueMaxWidth =
      rows.slice(0, COL_SAMPLESIZE).reduce((acc, d) => {
        const col = d[index]
        if (Array.isArray(col)) {
          return Math.max(...d[index].map((x) => x.length))
        }
        return acc > d[index].length ? acc : d[index].length
      }, 0) * charWidth
    return Math.min(Math.max(valueMaxWidth, minColWidth), maxColWidth)
  }

  const getRowHeight = ({ index }) => {
    const valueMaxWidth =
      rows[index]
        .slice(0, ROW_SAMPLESIZE)
        .map((column) =>
          Array.isArray(column)
            ? column.map(trimTextWithEllipsis)
            : trimTextWithEllipsis(column)
        )
        .flat()
        .reduce((acc, d) => (acc > d.length ? acc : d.length), 0) * charWidth

    const approxNumberOfLines = Math.ceil(valueMaxWidth / maxColWidth)
    const rowHeight = Math.max(minRowHeight, approxNumberOfLines * lineHeight)
    if (maxRowHeight) {
      return Math.min(rowHeight, maxRowHeight)
    }
    return Math.max(minRowHeight, approxNumberOfLines * lineHeight)
  }

  return (
    <div
      className={cx("sql-editor-data-table", {
        "single-cell": hasSingleCell()
      })}
      ref={tableRef}
    >
      <AutoSizer disableHeight>
        {({ width }) => (
          <Grid
            cellRenderer={cellRenderer}
            className={"sql-data-table"}
            columnCount={rows[0].length}
            columnWidth={getColumnWidth}
            height={viewerHeight}
            onSectionRendered={onSectionRendered}
            rowCount={rows.length}
            rowHeight={getRowHeight}
            width={width}
            selectedColumnIndex={selectedColumnIndex}
          />
        )}
      </AutoSizer>
    </div>
  )
}

export default compose(mapProps(dataToArray))(SqlEditorDataTable)
