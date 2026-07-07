// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnyAction } from "redux"
import { produce } from "immer"
import {
  SQL_NOTEBOOK_IQ_SUCCESS,
  SQL_NOTEBOOK_IQ_REQUEST,
  SQL_NOTEBOOK_ADD_CELL,
  SQL_NOTEBOOK_EXECUTE_REQUEST,
  SQL_NOTEBOOK_EXECUTE_SUCCESS,
  SQL_NOTEBOOK_EXECUTE_ERROR,
  SQL_NOTEBOOK_IQ_ERROR,
  SQL_NOTEBOOK_SET_SOURCES,
  SQL_NOTEBOOK_SET_CELL_TYPE,
  SQL_NOTEBOOK_ADD_INPUT_ANALYSIS_CELL,
  SQL_NOTEBOOK_SET_LOADING,
  SQL_NOTEBOOK_SET_DEFAULT_SOURCES,
  SQL_NOTEBOOK_SET_INPUT,
  SQL_NOTEBOOK_SET_ACTIVE_TAB,
  SQL_NOTEBOOK_SET_HIDE_ANALYSIS,
  SQL_NOTEBOOK_SET_FASTFORWARD,
  SQL_NOTEBOOK_SET_FASTFORWARD_DEFAULT,
  SQL_NOTEBOOK_SET_IQ_ENABLED,
  SQL_NOTEBOOK_IQ_GENERATED_SQL_ERROR,
  SQL_NOTEBOOK_ADD_GUIDANCE_SNIPPETS,
  SQL_NOTEBOOK_DELETE_GUIDANCE_SNIPPETS,
  SQL_NOTEBOOK_UPDATE_GUIDANCE_SNIPPET,
  SQL_NOTEBOOK_UNDO_DELETED_GUIDANCE_SNIPPETS,
  SQL_NOTEBOOK_CLEAR_DELETED_GUIDANCE_SNIPPETS,
  SQL_NOTEBOOK_GET_GUIDANCE_SNIPPETS_REQUEST,
  SQL_NOTEBOOK_GET_GUIDANCE_SNIPPETS_SUCCESS,
  SQL_NOTEBOOK_GET_GUIDANCE_SNIPPETS_ERROR,
  SQL_NOTEBOOK_GUIDANCE_SET_LOADING,
  SQL_NOTEBOOK_OPEN_GUIDANCE_MODAL,
  SQL_NOTEBOOK_CLOSE_GUIDANCE_MODAL
} from "./action-types"
import {
  CellType,
  GuidanceSnippet,
  NotebookCell,
  ResultTabKey
} from "components/sql-notebook/types"
import { sqlAutodetected } from "components/sql-notebook/utils"
import {
  available_feature_flags,
  getFeatureFlag
} from "../../control-panel/featureflags"
import { SqlNotebookState } from "vega/charts/types"

export const initialSqlNotebookState: SqlNotebookState = {
  loading: true,
  cells: [],
  defaultAnalysisSources: [],
  fastforwardDefault: Boolean(
    getFeatureFlag(available_feature_flags.IQ_FASTFORWARD)
  ),
  guidanceSnippets: {
    loading: false,
    snippets: null
  },
  deletedGuidanceSnippets: {}
}

const createCell = (cellProperties: Partial<NotebookCell>): NotebookCell => {
  return {
    type: CellType.INPUT_ANALYSIS,
    sources: [],
    autodetectSql: true,
    input: "",
    ...cellProperties
  } as NotebookCell
}

function addCell(
  state: SqlNotebookState,
  cellIndex?: number,
  cell?: Partial<NotebookCell> | null
) {
  const cellToAdd = cell
    ? createCell(cell)
    : createCell({
        type: state.iqEnabled ? CellType.INPUT_ANALYSIS : CellType.INPUT_SQL,
        sources: state.defaultAnalysisSources,
        autodetectSql: true,
        input: ""
      })
  if (cellIndex === undefined) {
    state.cells.push(cellToAdd)
  } else {
    state.cells.splice(cellIndex, 0, cellToAdd)
  }
}

const addDefaultCell = (state: SqlNotebookState) => {
  addCell(state)
}

export const notebookReducer = produce(
  (state = initialSqlNotebookState, action: AnyAction): void => {
    switch (action.type) {
      case SQL_NOTEBOOK_ADD_CELL: {
        const cellProperties: Partial<NotebookCell> | null = action.cellType
          ? { type: action.cellType }
          : null
        addCell(state, action.cellIndex, cellProperties)
        break
      }
      case SQL_NOTEBOOK_EXECUTE_REQUEST: {
        const {
          RESULT_ANALYSIS,
          RESULT_SQL,
          INPUT_ANALYSIS,
          INPUT_SQL
        } = CellType
        const { type, generatedSql, iqError } = state.cells[action.cellIndex]

        // If this is an NL question, the result goes in the next cell
        // if it's a SQL input the result goes in the same cell
        const resultInNextCell = type === INPUT_ANALYSIS
        const resultCellIndex = resultInNextCell
          ? action.cellIndex + 1
          : action.cellIndex

        state.cells[resultCellIndex] = {
          ...state.cells[resultCellIndex],
          type: type === RESULT_ANALYSIS ? RESULT_ANALYSIS : RESULT_SQL,
          lastRunSql: action.query,
          loading: true,
          error: false,
          isVega: action.isVega,
          // If the query has been changed, clear any iqError there may have been
          iqError: action.query !== generatedSql ? null : iqError,
          activeTab: action.isVega
            ? ResultTabKey.DETAILS
            : state.cells[resultCellIndex].activeTab
        }
        // Make sure we always have an input cell at the end
        const lastCell = state.cells[state.cells.length - 1]
        if (![INPUT_ANALYSIS, INPUT_SQL].includes(lastCell.type)) {
          addDefaultCell(state)
        }
        if (type !== RESULT_ANALYSIS) {
          state.scrollToCellIndex = action.cellIndex
        }
        break
      }
      case SQL_NOTEBOOK_EXECUTE_SUCCESS: {
        state.loading = false
        const resultCell = state.cells[action.cellIndex]
        resultCell.results = action.results
        resultCell.loading = false
        resultCell.error = false

        break
      }
      case SQL_NOTEBOOK_EXECUTE_ERROR: {
        state.loading = false
        const resultCell = state.cells[action.cellIndex]
        resultCell.error = action.error.error_msg
        resultCell.loading = false
        break
      }
      case SQL_NOTEBOOK_IQ_REQUEST:
        state.loading = true

        state.cells[action.cellIndex] = {
          ...state.cells[action.cellIndex],
          query: action.query
        }
        if (state.cells.length - 1 === action.cellIndex) {
          // Active cell request, need a new loading cell
          state.cells.push({
            type: CellType.STATUS,
            loading: true
          })
          addDefaultCell(state)
        } else {
          // Editing an analysis cell
          // Replace the following cell (result cell for this analysis question)
          // with a loading cell
          state.cells.splice(action.cellIndex + 1, 1, {
            type: CellType.STATUS,
            loading: true
          })
        }
        state.scrollToCellIndex = action.cellIndex
        break
      case SQL_NOTEBOOK_IQ_SUCCESS: {
        state.loading = false
        state.cells[action.resultCellIndex] = {
          ...state.cells[action.resultCellIndex],
          loading: false,
          generatedSql: action.sql,
          answer: action.answer,
          feedbackId: action.feedbackId,
          sqlComplexity: action.sqlComplexity,
          tables: action.tables,
          error: null,
          type: CellType.RESULT_ANALYSIS,
          input: action.sql
        }

        const usedSnippets = action.snippetIds.map((id) => {
          const snippet =
            state.guidanceSnippets.snippets?.find((s) => s.snippet_id === id) ||
            {}

          // Omit edited timestamp, we'll want to lookup the latest from snippets state.
          // Snippet content is only cached here as it will display content at the time the query was generated.
          return { id: snippet.snippet_id, snippet: snippet.snippet }
        })

        state.cells[action.queryCellIndex] = {
          ...state.cells[action.queryCellIndex],
          autoTables: action.tables,
          usedSnippets
        }
        break
      }
      case SQL_NOTEBOOK_IQ_ERROR:
        state.loading = false
        state.cells[action.cellIndex] = {
          ...state.cells[action.cellIndex],
          loading: false,
          answer: null,
          results: null,
          error: action.error || "Unknown Error",
          sql: action?.sql
        }
        break
      case SQL_NOTEBOOK_IQ_GENERATED_SQL_ERROR:
        state.loading = false

        state.cells[action.cellIndex] = {
          ...state.cells[action.cellIndex],
          loading: false,
          generatedSql: action.sql,
          tables: action.tables,
          error: null,
          iqError: action.iqError,
          type: CellType.RESULT_ANALYSIS,
          input: action.sql,
          fastforward: false
        }
        break
      case SQL_NOTEBOOK_SET_INPUT: {
        const cell = state.cells[action.cellIndex]
        const autoToggleSql =
          cell.type === CellType.INPUT_ANALYSIS &&
          cell.autodetectSql &&
          sqlAutodetected(action.text)

        state.cells[action.cellIndex] = {
          ...state.cells[action.cellIndex],
          input: action.text,
          ...(autoToggleSql
            ? {
                type: CellType.INPUT_SQL,
                autodetectedType: true
              }
            : {})
        }
        break
      }
      case SQL_NOTEBOOK_SET_SOURCES:
        state.cells[action.cellIndex] = {
          ...state.cells[action.cellIndex],
          sources: action.sources
        }
        break
      case SQL_NOTEBOOK_SET_CELL_TYPE: {
        // If SQL was previously autodetected, manually toggling out of SQL mode
        // should prevent autotoggling back to SQL input.
        const disableAutodetectSql =
          action.cellType !== CellType.INPUT_SQL &&
          state.cells[action.cellIndex].autodetectedType

        state.cells[action.cellIndex] = {
          ...state.cells[action.cellIndex],
          type: action.cellType,
          ...(disableAutodetectSql
            ? {
                autodetectSql: false,
                autodetectedType: false
              }
            : {})
        }

        break
      }
      case SQL_NOTEBOOK_SET_ACTIVE_TAB:
        state.cells[action.cellIndex] = {
          ...state.cells[action.cellIndex],
          activeTab: action.tabValue
        }
        break

      case SQL_NOTEBOOK_ADD_INPUT_ANALYSIS_CELL: {
        const lastCell = state.cells[state.cells.length - 1]
        const newCell = {
          type: action.cellType,
          input: action.input,
          sources: action.sources
        }
        if (
          [CellType.INPUT_ANALYSIS, CellType.INPUT_SQL].includes(lastCell.type)
        ) {
          // If we're editing a sql or nl input cell, then replace it
          state.cells[state.cells.length - 1] = newCell
        } else {
          // Otherwise mark the last one complete and add a new one
          state.cells.push(newCell)
          addDefaultCell(state)
        }
        break
      }
      case SQL_NOTEBOOK_SET_LOADING:
        state.loading = action.loading
        break
      case SQL_NOTEBOOK_SET_DEFAULT_SOURCES:
        state.defaultAnalysisSources = action.sources
        break
      case SQL_NOTEBOOK_SET_HIDE_ANALYSIS:
        state.cells[action.cellIndex] = {
          ...state.cells[action.cellIndex],
          hideAnalysis: action.hideAnalysis
        }
        break
      case SQL_NOTEBOOK_SET_FASTFORWARD:
        state.cells[action.cellIndex] = {
          ...state.cells[action.cellIndex],
          fastforward: action.fastforward
        }
        break
      case SQL_NOTEBOOK_SET_FASTFORWARD_DEFAULT:
        state.fastforwardDefault = action.fastforward
        break
      case SQL_NOTEBOOK_SET_IQ_ENABLED:
        state.iqEnabled = action.iqEnabled
        if (state.cells.length === 0) {
          state.cells.push({
            type: action.iqEnabled
              ? CellType.INPUT_ANALYSIS
              : CellType.INPUT_SQL,
            sources: [],
            autodetectSql: true
          })
        }
        break
      case SQL_NOTEBOOK_ADD_GUIDANCE_SNIPPETS:
        state.guidanceSnippets.snippets.push(...action.snippets)
        break
      case SQL_NOTEBOOK_GET_GUIDANCE_SNIPPETS_REQUEST:
        state.guidanceSnippets.loading = true
        break
      case SQL_NOTEBOOK_GET_GUIDANCE_SNIPPETS_SUCCESS:
        state.guidanceSnippets.snippets = action.snippets
        delete state.guidanceSnippets.getGuidanceSnippetsError
        state.guidanceSnippets.loading = false
        break
      case SQL_NOTEBOOK_GET_GUIDANCE_SNIPPETS_ERROR:
        state.guidanceSnippets.getGuidanceSnippetsError = action.error
        state.guidanceSnippets.loading = false
        break
      case SQL_NOTEBOOK_DELETE_GUIDANCE_SNIPPETS:
        state.deletedGuidanceSnippets[
          action.requestId
        ] = state.guidanceSnippets.snippets.filter((s: GuidanceSnippet) =>
          action.snippetIds.includes(s.snippet_id)
        )
        state.guidanceSnippets.snippets = state.guidanceSnippets.snippets.filter(
          (s: GuidanceSnippet) => !action.snippetIds.includes(s.snippet_id)
        )
        break
      case SQL_NOTEBOOK_UPDATE_GUIDANCE_SNIPPET: {
        const snippet = state.guidanceSnippets.snippets.find(
          (s: GuidanceSnippet) => s.snippet_id === action.snippetId
        )
        snippet.snippet = action.snippet
        snippet.updated_at = action.time
        break
      }
      case SQL_NOTEBOOK_UNDO_DELETED_GUIDANCE_SNIPPETS:
        state.guidanceSnippets.snippets = [
          ...state.guidanceSnippets.snippets,
          ...(state.deletedGuidanceSnippets[action.requestId] || [])
        ]
        delete state.deletedGuidanceSnippets[action.requestId]
        break
      case SQL_NOTEBOOK_CLEAR_DELETED_GUIDANCE_SNIPPETS:
        delete state.deletedGuidanceSnippets[action.requestId]
        break
      case SQL_NOTEBOOK_GUIDANCE_SET_LOADING:
        state.guidanceSnippets.loading = action.loading
        break
      case SQL_NOTEBOOK_OPEN_GUIDANCE_MODAL:
        state.guidanceSnippets.editingSnippetId = action.snippetId
        state.guidanceSnippets.editModalOpen = true
        break
      case SQL_NOTEBOOK_CLOSE_GUIDANCE_MODAL:
        delete state.guidanceSnippets.editingSnippet
        state.guidanceSnippets.editModalOpen = false
        break
      default:
        return state
    }

    return state
  }
)

export default notebookReducer
