// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { isGroupable } from "vega/constants/data-selection-types"

import { SQL_EDITOR_TEST_ID_SNIPPETS_HEADER } from "./constants"

function BrowserSnippet({ label, onClickIcon }) {
  return (
    <div className="insert-action-row" onClick={onClickIcon}>
      <Icon
        className="insert-action-row__icon"
        icon="input"
        title="Copy To SQL Input Box"
        style={{
          transform: "scaleX(-1)"
        }}
      />

      <span className="insert-action-row__value">{label}</span>
    </div>
  )
}

const BrowserSnippetPane = ({
  selectedRow = {},
  insertAtCursor,
  setSelectedRow
}) => {
  const { value, table } = selectedRow
  const isColumn = table !== undefined && value !== undefined
  const isGroupableColumn = isColumn && isGroupable(selectedRow)

  const sample10RowsTable = () => {
    insertAtCursor(`SELECT * FROM ${value} LIMIT 10\n`)
  }

  const countRowsTable = () => {
    insertAtCursor(`SELECT COUNT(*) FROM ${value}\n`)
  }

  const showCreateTable = () => {
    insertAtCursor(`SHOW CREATE TABLE ${value}\n`)
  }

  const sample100RowsColumn = () => {
    insertAtCursor(`SELECT ${value} FROM ${table} LIMIT 100\n`)
  }

  const sampleTop20Column = () => {
    insertAtCursor(
      `SELECT ${value}, COUNT(*) FROM ${table} GROUP BY ${value} ORDER BY COUNT(*) DESC LIMIT 20\n`
    )
  }

  const countDistinctColumn = () => {
    insertAtCursor(`SELECT APPROX_COUNT_DISTINCT(${value}) FROM ${table}\n`)
  }

  const onClickBack = () => {
    if (isColumn) {
      setSelectedRow({ value: table })
    }
  }

  const tableSnippets = () => (
    <>
      {getFeatureFlag(available_feature_flags.NO_SELECT_STAR) ? undefined : (
        <BrowserSnippet
          label="Sample 10 Rows"
          onClickIcon={sample10RowsTable}
        />
      )}
      <BrowserSnippet label="Count table rows" onClickIcon={countRowsTable} />
      <BrowserSnippet label="Show table schema" onClickIcon={showCreateTable} />
    </>
  )

  const columnSnippets = () => (
    <>
      <BrowserSnippet
        label="Sample 100 Values"
        onClickIcon={sample100RowsColumn}
      />
      {isGroupableColumn && (
        <>
          <BrowserSnippet
            label="Sample Top 20 Values"
            onClickIcon={sampleTop20Column}
          />
          <BrowserSnippet
            label="Count Distinct Values"
            onClickIcon={countDistinctColumn}
          />{" "}
        </>
      )}
    </>
  )

  return (
    <div className="sql-editor__browser-snippet-pane">
      <div
        className="sql-editor__browser-snippet-pane-header"
        data-testid={SQL_EDITOR_TEST_ID_SNIPPETS_HEADER}
      >
        <div className="back-container" onClick={onClickBack}>
          {isColumn && (
            <Icon icon="keyboard_arrow_left" title="Table snippets" />
          )}
        </div>

        <Tooltip
          content={isColumn ? `${table}.${value}` : value}
          enterDelay={500}
        >
          <span>{`Query snippets for ${value}`}</span>
        </Tooltip>
      </div>
      {isColumn ? columnSnippets() : tableSnippets()}
    </div>
  )
}

BrowserSnippetPane.propTypes = {}

export default BrowserSnippetPane
