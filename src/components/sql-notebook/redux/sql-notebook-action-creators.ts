// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnyAction } from "redux"
import { ThunkDispatch } from "redux-thunk"
import {
  SQL_NOTEBOOK_ADD_CELL,
  SQL_NOTEBOOK_EXECUTE_ERROR,
  SQL_NOTEBOOK_EXECUTE_REQUEST,
  SQL_NOTEBOOK_EXECUTE_SUCCESS,
  SQL_NOTEBOOK_IQ_REQUEST,
  SQL_NOTEBOOK_IQ_SUCCESS,
  SQL_NOTEBOOK_SET_SOURCES,
  SQL_NOTEBOOK_SET_CELL_TYPE,
  SQL_NOTEBOOK_ADD_INPUT_ANALYSIS_CELL,
  SQL_NOTEBOOK_IQ_ERROR,
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
  SQL_NOTEBOOK_GET_GUIDANCE_SNIPPETS_REQUEST,
  SQL_NOTEBOOK_GET_GUIDANCE_SNIPPETS_SUCCESS,
  SQL_NOTEBOOK_GET_GUIDANCE_SNIPPETS_ERROR,
  SQL_NOTEBOOK_DELETE_GUIDANCE_SNIPPETS,
  SQL_NOTEBOOK_UPDATE_GUIDANCE_SNIPPET,
  SQL_NOTEBOOK_UNDO_DELETED_GUIDANCE_SNIPPETS,
  SQL_NOTEBOOK_CLEAR_DELETED_GUIDANCE_SNIPPETS,
  SQL_NOTEBOOK_GUIDANCE_SET_LOADING,
  SQL_NOTEBOOK_OPEN_GUIDANCE_MODAL,
  SQL_NOTEBOOK_CLOSE_GUIDANCE_MODAL
} from "./action-types"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import {
  CellType,
  ResultData,
  ResultDataField,
  ResultTabKey,
  GuidanceSnippet
} from "components/sql-notebook/types"
import { tableToFields, tableToJson } from "utils/arrow"
import { AppState } from "vega/charts/types"
import {
  formatSQL,
  isJson,
  limitQuery,
  notifySqlNotebookError
} from "components/sql-notebook/utils"
import { generateIQAutoQuery, generateIQQuery } from "services/iq"
import { QUERY_LIMIT } from "components/sql-notebook/constants"
import { isGeo, isLineGeo, isPolyGeo, isStringType } from "constants/data-types"
import { getTables } from "../../../actions/tables-reference-action-creators"
import { addKeepResultsHint } from "components/sql-notebook/visualization/utils"
import {
  filterColumns,
  getAST,
  sqlify
} from "components/sql-notebook/visualization/vega-map/ast-helpers"
import {
  deleteSnippets,
  insertSnippets,
  listSnippets,
  updateSnippet
} from "services/iq-guidance-snippets"

export function sqlNotebookExecuteRequest(
  isVega: boolean,
  query: string,
  cellIndex?: number,
  editing?: true
) {
  return {
    type: SQL_NOTEBOOK_EXECUTE_REQUEST,
    isVega,
    cellIndex,
    query,
    editing
  }
}

export function sqlNotebookExecuteSuccess(
  isVega: boolean,
  query: string,
  results,
  cellIndex
) {
  return {
    type: SQL_NOTEBOOK_EXECUTE_SUCCESS,
    isVega,
    results,
    query,
    cellIndex
  }
}

export function sqlNotebookExecuteError(
  isVega: boolean,
  query: string,
  error: string,
  cellIndex: number
) {
  return {
    type: SQL_NOTEBOOK_EXECUTE_ERROR,
    isVega,
    error,
    query,
    cellIndex
  }
}

export const filterLineAndPolygonFields = async (
  query: string,
  connector: any
) => {
  const fields = await connector.validateQuery(query)
  const geoFields = fields.filter(
    (f: ResultDataField) => isPolyGeo(f.type) || isLineGeo(f.type)
  )
  if (geoFields.length) {
    const geoFieldNames = geoFields.map((f: ResultDataField) => f.name)
    const queryAST = getAST(query)
    const filteredColumns = filterColumns(queryAST, geoFieldNames)
    // Only remove the columns if we end up with > 0 columns to project
    if (filteredColumns.length) {
      queryAST.columns = filteredColumns
      return {
        filteredQuery: sqlify(queryAST),
        filteredFields: geoFields
      }
    }
  }
  return { filteredQuery: query, filteredFields: [] }
}

const stubFields = (
  result: ResultData,
  fields: Array<ResultDataField>,
  stubFieldValue = "[Not shown]"
) => {
  const stubbedResult = {
    ...result
  }
  // Add back the geo fields, but set to dummy value
  stubbedResult.fields = [...result.fields, ...fields]
  stubbedResult.results = result.results.map((r: any) => {
    fields
      .map((ff) => ff.name)
      .forEach((fieldName: string) => {
        r[fieldName] = stubFieldValue
      })
    return r
  })
  return stubbedResult
}

export const runFilteredQuery = async (connector: any, query: string) => {
  let result = {}
  if (query.trim().split(/\s+/)[0].toLowerCase() === "select") {
    // Remove polygon and line geometries from query
    const { filteredQuery, filteredFields } = await filterLineAndPolygonFields(
      query,
      connector
    )
    const hintedQuery = addKeepResultsHint(filteredQuery)
    result = await connector.queryAsync(hintedQuery, {
      returnTiming: true,
      limit: QUERY_LIMIT
    })
    if (filteredFields) {
      result = stubFields(result, filteredFields)
    }
  } else {
    result = await connector.queryAsync(query, {
      returnTiming: true,
      limit: QUERY_LIMIT
    })
  }
  return result
}

export function sqlNotebookExecute(
  query: string,
  cellIndex: number,
  fastforward = false
) {
  return async function sqlNotebookExecuteThunk(
    dispatch: ThunkDispatch<AppState, any, AnyAction>,
    _getState: never,
    services
  ) {
    const connector = services.get("DbCon")

    const trimmedQuery = query.trim()
    const isVega = isJson(trimmedQuery)

    let limitedQuery = trimmedQuery
    if (!isVega) {
      limitedQuery = limitQuery(trimmedQuery)
    }

    const table = trimmedQuery.match(/from\s+([^\s;]+)/i)?.[1]

    dispatch(sqlNotebookExecuteRequest(isVega, query, cellIndex))

    try {
      let result = null

      if (isVega) {
        result = await connector.renderVegaAsync(1, limitedQuery)
      } else if (
        getFeatureFlag(available_feature_flags.USE_ARROW_IN_SQL_MANAGER)
      ) {
        const data = await connector.queryDFAsync(limitedQuery, {
          returnTiming: true,
          limit: QUERY_LIMIT
        })

        result = {
          ...data,
          results: tableToJson(data.results),
          fields: tableToFields(data.results),
          table,
          query: trimmedQuery
        }
      } else {
        result = await runFilteredQuery(connector, limitedQuery)
        result.table = table
        result.query = trimmedQuery
      }

      await dispatch(
        sqlNotebookExecuteSuccess(isVega, trimmedQuery, result, cellIndex)
      )

      if (fastforward) {
        dispatch(autoSelectIQResult(cellIndex))
      }

      if (!isVega && trimmedQuery.match(/^\s*(create|drop|restore)/i)) {
        // If user creates, drops, or restores a table, refresh the tables browser list
        dispatch(getTables())
      }
    } catch (error) {
      dispatch(sqlNotebookExecuteError(isVega, trimmedQuery, error, cellIndex))
    }
  }
}

/**
 * Copies the passed in query to a new cell at the index provided
 * Note: This is unused RN but keeping around for future implementation
 *
 * @param query - Query to create new cell with
 * @param cellIndex - Cell index to create new cell at
 * @returns
 */
export function sqlNotebookCopyToNewCell(query: string, cellIndex: number) {
  return async function sqlNotebookCopyToNewCellThunk(
    dispatch: ThunkDispatch<AppState, any, AnyAction>,
    _getState: never,
    _services: never
  ) {
    dispatch(sqlNotebookAddCell(CellType.INPUT_SQL, cellIndex))
    dispatch(sqlNotebookSetInput(cellIndex, query))
    dispatch(sqlNotebookExecute(query, cellIndex))
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function readError(response: Response) {
  const contentType = response.headers.get("content-type")

  if (contentType?.includes("application/json")) {
    const errorJson = await response.json()
    // Can't re-read the body stream with text()
    // Gotta go with what we have
    return errorJson
  }

  const errorText = await response.text()
  return errorText || response.statusText
}

// "Fastforward" feature--immediately runs generated query and autoswitches result tabs
export function autoSelectIQResult(resultCellIndex: number) {
  return async (
    dispatch: ThunkDispatch<AppState, any, AnyAction>,
    getState: () => AppState
  ) => {
    const { results } = getState().sqlNotebook.cells[resultCellIndex]
    const rowsColumnsProduct = results.results.length * results.fields.length
    const multiColumn = results.fields.length > 1
    const onlyStringColumns = results.fields.every((f) => isStringType(f.type))

    // Results with rows * cols > 10 and multiple columns OR a single column if it is a point type
    // (we want a map viz in this case)
    // also exclude results with only string columns, as no chart can be rendered from solely strings
    const displayVisualization =
      (multiColumn || isGeo(results.fields[0].type)) &&
      rowsColumnsProduct >= 10 &&
      !onlyStringColumns

    // Single column with <= 10 rows
    const displayAnalysis =
      !displayVisualization && results.results.length <= 10

    if (displayVisualization) {
      dispatch(
        sqlNotebookSetActiveTab(resultCellIndex, ResultTabKey.VISUALIZATION)
      )
    } else if (displayAnalysis) {
      dispatch(sqlNotebookSetActiveTab(resultCellIndex, ResultTabKey.ANALYSIS))
    }

    // Hide the analysis tab only for results generated by fast-forward.
    // Analysis tab shouldn't disappear while user is switching tabs or manually executes SQL
    const hideAnalysis = rowsColumnsProduct > 20
    dispatch(sqlNotebookSetHideAnalysis(resultCellIndex, hideAnalysis))
  }
}

export function sqlNotebookIQRequest(
  question: string,
  tables: Set<string>,
  queryCellIndex: number
) {
  return async (
    dispatch: ThunkDispatch<AppState, any, AnyAction>,
    getState
  ) => {
    // Adds a loading analysis cell
    dispatch({
      type: SQL_NOTEBOOK_IQ_REQUEST,
      query: question,
      cellIndex: queryCellIndex
    })

    const resultCellIndex = queryCellIndex + 1

    try {
      let response = null
      if (tables.size > 0) {
        response = await generateIQQuery({
          question,
          tables: Array.from(tables)
        })
      } else {
        response = await generateIQAutoQuery({
          question,
          allowed_tables: []
        })
      }

      if (!response.ok) {
        const error = await readError(response)
        if (error?.sql) {
          dispatch(
            sqlNotebookIQGeneratedSQLError(
              resultCellIndex,
              error.error,
              formatSQL(error.sql)
            )
          )
        } else {
          dispatch(sqlNotebookIQError(resultCellIndex, error?.error || error))
        }
      } else {
        const {
          answer,
          sql,
          sql_complexity: sqlComplexity,
          feedback_id: feedbackId,
          tables: iqAutoTables,
          snippet_ids: snippetIds
        } = await response.json()

        const formattedSql = formatSQL(sql)

        // Fetch snippets so we can match up the ids for used snippets to the actual snippet content
        if (!getState().sqlNotebook.guidanceSnippets.snippets) {
          await dispatch(sqlNotebookGetGuidanceSnippets())
        }

        dispatch({
          type: SQL_NOTEBOOK_IQ_SUCCESS,
          feedbackId,
          answer,
          sql: formattedSql,
          resultCellIndex,
          queryCellIndex,
          sqlComplexity,
          tables: iqAutoTables,
          snippetIds
        })

        const shouldFastforward = getState().sqlNotebook.cells[queryCellIndex]
          .fastforward
        // Runs after success so user can theoretically see SQL while it's being executed
        if (sql && shouldFastforward) {
          dispatch(sqlNotebookExecute(formattedSql, resultCellIndex, true))
        }
      }
    } catch (err) {
      dispatch(sqlNotebookIQError(queryCellIndex + 1, "Unknown Error"))
    }
  }
}

export function sqlNotebookIQError(
  cellIndex: number,
  error: string,
  sql?: string
) {
  return {
    type: SQL_NOTEBOOK_IQ_ERROR,
    cellIndex,
    error,
    sql
  }
}

export function sqlNotebookIQGeneratedSQLError(
  cellIndex: number,
  iqError: string,
  sql?: string
) {
  return {
    type: SQL_NOTEBOOK_IQ_GENERATED_SQL_ERROR,
    cellIndex,
    iqError,
    sql
  }
}

export function sqlNotebookAddCell(
  cellType: CellType = CellType.INPUT_ANALYSIS,
  cellIndex?: number
) {
  return {
    type: SQL_NOTEBOOK_ADD_CELL,
    cellType,
    cellIndex
  }
}

export function sqlNotebookAddInputAnalysisCell(
  input: String,
  sources: String[]
) {
  return {
    type: SQL_NOTEBOOK_ADD_INPUT_ANALYSIS_CELL,
    cellType: CellType.INPUT_ANALYSIS,
    input,
    sources
  }
}

// Sync current codemirror input value to redux. `input` field is distinct from
// `sql` field as it has not necessarily been submitted.
export function sqlNotebookSetInput(cellIndex: number, text: string) {
  return {
    type: SQL_NOTEBOOK_SET_INPUT,
    cellIndex,
    text
  }
}

export function sqlNotebookSetSources(cellIndex: number, sources: string[]) {
  return {
    type: SQL_NOTEBOOK_SET_SOURCES,
    cellIndex,
    sources
  }
}

export function sqlNotebookSetCellType(cellIndex: number, cellType: string) {
  return {
    type: SQL_NOTEBOOK_SET_CELL_TYPE,
    cellIndex,
    cellType
  }
}

export function sqlNotebookSetLoading(loading: boolean) {
  return {
    type: SQL_NOTEBOOK_SET_LOADING,
    loading
  }
}

// Store sources that should autopopulate new analysis cells
export function sqlNotebookSetDefaultSources(sources: string[]) {
  return {
    type: SQL_NOTEBOOK_SET_DEFAULT_SOURCES,
    sources
  }
}

export function sqlNotebookSetActiveTab(
  cellIndex: number,
  tabValue: ResultTabKey
) {
  return {
    type: SQL_NOTEBOOK_SET_ACTIVE_TAB,
    cellIndex,
    tabValue
  }
}

export function sqlNotebookSetHideAnalysis(
  cellIndex: number,
  hideAnalysis: boolean
) {
  return {
    type: SQL_NOTEBOOK_SET_HIDE_ANALYSIS,
    cellIndex,
    hideAnalysis
  }
}

// Sets fast-forward on cell
export function sqlNotebookSetFastforward(
  fastforward: boolean,
  cellIndex: number
) {
  return {
    type: SQL_NOTEBOOK_SET_FASTFORWARD,
    fastforward,
    cellIndex
  }
}

// Sets fast-forward default value for new cells
export function sqlNotebookSetFastforwardDefault(fastforward: boolean) {
  return {
    type: SQL_NOTEBOOK_SET_FASTFORWARD_DEFAULT,
    fastforward
  }
}

export function sqlNotebookSetIQEnabled(iqEnabled: boolean) {
  return {
    type: SQL_NOTEBOOK_SET_IQ_ENABLED,
    iqEnabled
  }
}

export function sqlNotebookAddGuidanceSnippets(snippets: GuidanceSnippet[]) {
  return {
    type: SQL_NOTEBOOK_ADD_GUIDANCE_SNIPPETS,
    snippets
  }
}

export function sqlNotebookDeleteGuidanceSnippets(
  snippetIds: string[],
  requestId: string
) {
  return {
    type: SQL_NOTEBOOK_DELETE_GUIDANCE_SNIPPETS,
    snippetIds,
    requestId
  }
}

export function sqlNotebookUpdateGuidanceSnippet(
  snippetId: string,
  snippet: string,
  time: string
) {
  return {
    type: SQL_NOTEBOOK_UPDATE_GUIDANCE_SNIPPET,
    snippetId,
    snippet,
    time
  }
}

export function sqlNotebookUpdateGuidanceSnippetThunk(
  snippetId: string,
  snippet: string
) {
  return async (dispatch: ThunkDispatch<AppState, any, AnyAction>) => {
    dispatch(sqlNotebookGuidanceSetLoading(true))

    const response = await updateSnippet(snippet, snippetId)

    if (response.ok) {
      dispatch(
        sqlNotebookUpdateGuidanceSnippet(
          snippetId,
          snippet,
          new Date().toISOString()
        )
      )
    } else {
      const error = await parseGuidanceSnippetError(
        response,
        "Failed to update snippet"
      )
      dispatch(sqlNotebookGetGuidanceSnippetsError(error))
    }

    dispatch(sqlNotebookGuidanceSetLoading(false))
  }
}

export function sqlNotebookUndoDeletedGuidanceSnippets(requestId: string) {
  return {
    type: SQL_NOTEBOOK_UNDO_DELETED_GUIDANCE_SNIPPETS,
    requestId
  }
}

export function sqlNotebookClearDeletedGuidanceSnippets(requestId: string) {
  return {
    type: SQL_NOTEBOOK_CLEAR_DELETED_GUIDANCE_SNIPPETS,
    requestId
  }
}

export function sqlNotebookFinalizeDeletedGuidanceSnippets(requestId: string) {
  return async (
    dispatch: ThunkDispatch<AppState, any, AnyAction>,
    getState: () => AppState
  ) => {
    const DEFAULT_DELETE_ERROR = "Failed to delete snippet(s)"
    const { deletedGuidanceSnippets } = getState().sqlNotebook

    const res = await deleteSnippets(
      deletedGuidanceSnippets[requestId].map(({ snippet_id }) => snippet_id)
    )

    if (res.ok) {
      const { deleted } = await res.json()

      if (deleted === false) {
        notifySqlNotebookError(DEFAULT_DELETE_ERROR)
        // Just restore 'em for now; could add a retry button but doubt it would be useful
        dispatch(sqlNotebookUndoDeletedGuidanceSnippets(requestId))
      } else {
        dispatch(sqlNotebookClearDeletedGuidanceSnippets(requestId))
      }
    } else {
      const error = await parseGuidanceSnippetError(res, DEFAULT_DELETE_ERROR)
      notifySqlNotebookError(error)
      dispatch(sqlNotebookUndoDeletedGuidanceSnippets(requestId))
    }
  }
}

function sqlNotebookGetGuidanceSnippetsRequest() {
  return {
    type: SQL_NOTEBOOK_GET_GUIDANCE_SNIPPETS_REQUEST
  }
}

function sqlNotebookGetGuidanceSnippetsSuccess(snippets: GuidanceSnippet[]) {
  return {
    type: SQL_NOTEBOOK_GET_GUIDANCE_SNIPPETS_SUCCESS,
    snippets
  }
}

function sqlNotebookGetGuidanceSnippetsError(error: string) {
  notifySqlNotebookError(error)

  return {
    type: SQL_NOTEBOOK_GET_GUIDANCE_SNIPPETS_ERROR,
    error
  }
}

async function parseGuidanceSnippetError(response, defaultError: string) {
  const contentType = response.headers.get("content-type")
  if (contentType?.includes("application/json")) {
    const { error } = await response.json()
    return error || defaultError
  }

  const errorText = await response.text()
  return errorText || defaultError
}

export function sqlNotebookGetGuidanceSnippets() {
  return async (dispatch: ThunkDispatch<AppState, any, AnyAction>) => {
    dispatch(sqlNotebookGetGuidanceSnippetsRequest())

    const response = await listSnippets()

    if (response.ok) {
      const { snippets } = await response.json()
      dispatch(sqlNotebookGetGuidanceSnippetsSuccess(snippets))
    } else {
      const error = await parseGuidanceSnippetError(
        response,
        "Failed to fetch snippets"
      )
      dispatch(sqlNotebookGetGuidanceSnippetsError(error))
    }
  }
}

export function sqlNotebookInsertGuidanceSnippets(snippets: string[]) {
  return async (dispatch: ThunkDispatch<AppState, any, AnyAction>) => {
    dispatch(sqlNotebookGuidanceSetLoading(true))

    const res = await insertSnippets(snippets)

    if (res.ok) {
      const { snippet_ids } = await res.json()

      dispatch(
        sqlNotebookAddGuidanceSnippets(
          snippets.map((s, i) => ({
            snippet: s,
            // These may not exactly match the actual creation times, but should be close enough until refresh.
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            snippet_id: snippet_ids[i]
          }))
        )
      )
    } else {
      const error = await parseGuidanceSnippetError(
        res,
        "Failed to insert snippet(s)"
      )
      notifySqlNotebookError(error)
    }

    dispatch(sqlNotebookGuidanceSetLoading(false))
  }
}

export function sqlNotebookGuidanceSetLoading(loading: boolean) {
  return {
    type: SQL_NOTEBOOK_GUIDANCE_SET_LOADING,
    loading
  }
}

export function sqlNotebookOpenGuidanceModal(snippetId?: string) {
  return {
    type: SQL_NOTEBOOK_OPEN_GUIDANCE_MODAL,
    snippetId
  }
}

export function sqlNotebookCloseGuidanceModal() {
  return {
    type: SQL_NOTEBOOK_CLOSE_GUIDANCE_MODAL
  }
}
