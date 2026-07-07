// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { adjust, compose, lensPath, over, set, view, zipWith } from "ramda"

import {
  CLEAR_COLUMN_NAME_LIST,
  CONFIRM_CREATE_NEW_TABLE_ERROR,
  CONFIRM_GET_IMPORT_PREVIEW_DATA_ERROR,
  CONFIRM_IMPORT_TABLE_ERROR,
  CREATE_NEW_TABLE_ERROR,
  CREATE_NEW_TABLE_REQUEST,
  CREATE_NEW_TABLE_SUCCESS,
  GET_DATA_CATALOG_ERROR,
  GET_DATA_CATALOG_REQUEST,
  GET_DATA_CATALOG_SUCCESS,
  LOAD_DATA_CATALOG_FILE_ERROR,
  LOAD_DATA_CATALOG_FILE_REQUEST,
  LOAD_DATA_CATALOG_FILE_SUCCESS,
  GET_IMPORT_PREVIEW_DATA_ERROR,
  GET_IMPORT_PREVIEW_DATA_REQUEST,
  GET_IMPORT_PREVIEW_DATA_SUCCESS,
  IMPORT_TABLE_COMPLETE,
  IMPORT_TABLE_ERROR,
  IMPORT_TABLE_REQUEST,
  IMPORT_TABLE_SUCCESS,
  REMOVE_IMPORT_FILES_ERROR,
  REMOVE_IMPORT_FILES_REQUEST,
  REMOVE_IMPORT_FILES_SUCCESS,
  RESET_IMPORTER,
  UPDATE_COLUMN_NAME,
  UPDATE_COLUMN_TYPE,
  UPDATE_IMPORTER_SETTING,
  UPDATE_TABLE_NAME,
  GET_IMPORT_STATUS_SUCCESS,
  UPDATE_IMPORT_START_TIME,
  UPDATE_IMPORT_END_TIME,
  CLEAR_IMPORT_STATUS,
  ADD_ESTIMATED_END_TIME,
  SUBMIT_LOCAL_FILE_CONNECTOR,
  SUBMIT_SERVER_FILE_CONNECTOR,
  SUBMIT_DATA_CATALOG_CONNECTOR,
  SUBMIT_S3_CONNECTOR,
  TOGGLE_IMPORT_SETTINGS_MODAL,
  SET_FSI_CONNECT_REFRESH_INFO,
  SET_IMPORT_SETTINGS,
  SUBMIT_ODBC_CONNECTOR,
  ACCEPT_IMPORT_ERROR,
  UPDATE_TABLE_COMMENT,
  UPDATE_COLUMN_COMMENT
} from "constants/action-types"

import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"
import createReducer from "utils/redux/create-reducer"
import { mapIdx } from "utils/ramda-helpers"
import RESERVED_COLUMN_NAME_SET from "constants/reserved-column-names"
import s3UrlParser from "components/table-importer/s3-url-parser"
import {
  DataCatalog,
  DataCatalogItem
} from "components/table-importer/data-catalog/types"
import {
  TCopyParams,
  TDatumType,
  TDetectResult,
  TImportHeaderRow,
  TSourceType,
  TTableRefreshInfo
} from "@heavyai/connector/dist/browser-connector"
import {
  DONT_CALL_IMPORT_EXTS,
  RESERVED_RASTER_COLUMN_NAMES
} from "constants/import-file-types"
import {
  ConnectorType,
  ODBCDriverName
} from "../components/data-manager/constants"
import {
  PostgreSqlFieldKey,
  RedshiftFieldKey,
  SnowflakeFieldKey
} from "../components/data-manager/field-types"

const columnHeaderLens = lensPath(["data", "row_set", "row_desc"])
const createIsValidPropertyFromReservedKeywordStatus = (header) =>
  set(lensPath(["is_not_valid"]), null, header)
const createCleanColNamePropertyFromColName = (header) =>
  set(
    lensPath(["clean_col_name"]),
    view(lensPath(["col_name"]), header),
    header
  )
const mapOverColumnNames = (fn) =>
  over(
    lensPath(["row_set", "row_desc"]),
    mapIdx((header, id) => fn(header, id))
  )
const updateColumnHeaderProperty = (propertyPath, columnId, newProperty) =>
  over(
    columnHeaderLens,
    adjust(set(lensPath(propertyPath), newProperty), columnId)
  )
const mapOverColumnNamesAndCreateIsValidStatus = mapOverColumnNames(
  createIsValidPropertyFromReservedKeywordStatus
)
const mapOverColumnNamesAndCreateCleanColName = mapOverColumnNames(
  createCleanColNamePropertyFromColName
)

const maybeReplaceFirstChar = (colName = "", col) =>
  colName.replace(/^[^A-Za-z]/g, `c${col + 1}_${colName.substr(0, 1)}`)
const maybeReplaceEmptyColumnName = (colName, col) => colName || `c${col + 1}`
const maybeReplaceForeignChars = (colName = "") =>
  colName.replace(/[^a-zA-Z0-9_]/g, "_")

const isReservedKeyword = (colName) =>
  RESERVED_COLUMN_NAME_SET.has(colName.toUpperCase())
const maybeReplaceReservedWords = (colName, col) => {
  if (isReservedKeyword(colName)) {
    return `c${col + 1}_${colName}`
  } else {
    return colName
  }
}

const maybeReplaceIfDuplicateEntry = (
  colName: string,
  duplicateMap: Record<string, number>
) => {
  const mapKey = colName.toLowerCase()
  if (mapKey in duplicateMap) {
    duplicateMap[mapKey] += 1
    return `${colName}_${duplicateMap[mapKey]}`
  }
  duplicateMap[mapKey] = 0
  return colName
}

const checkForDuplication = (headers) =>
  headers.length !== new Set(headers).size

const cleanColumnHeader = (header, col, duplicateMap) => {
  header = maybeReplaceFirstChar(header, col)
  header = maybeReplaceEmptyColumnName(header, col)
  header = maybeReplaceForeignChars(header)
  header = maybeReplaceIfDuplicateEntry(header, duplicateMap)
  header = maybeReplaceReservedWords(header, col)
  return header
}

// This is used for both table and column names
export const checkForNameValidity = (name, allCleanHeaders) => {
  if (name !== maybeReplaceFirstChar(name)) {
    return "First character has to be a letter"
  } else if (name !== maybeReplaceReservedWords(name)) {
    return "Cannot use a SQL reserved word"
  } else if (name !== maybeReplaceForeignChars(name)) {
    return "Can only use alphanumeric characters, and '_' in name"
  } else if (!name) {
    return "Cannot be an empty name"
  } else if (allCleanHeaders && checkForDuplication(allCleanHeaders)) {
    return "Cannot have a duplicate name in entry"
  }
  return null
}

const checkForRasterColumnNameUpdateValidity = (name, allCleanHeaders) => {
  if (RESERVED_RASTER_COLUMN_NAMES.has(name)) {
    return "Cannot use reserved column name for raster data"
  }

  return checkForNameValidity(name, allCleanHeaders)
}

const cleanColumnNames = (importData) => {
  const duplicateMap: Record<string, number> = {}
  importData.row_set.changed_columns = []

  importData.row_set.row_desc.forEach((header, i) => {
    importData.row_set.row_desc[i].clean_col_name = cleanColumnHeader(
      header.clean_col_name,
      i,
      duplicateMap
    )
    if (header.clean_col_name !== header.col_name) {
      importData.row_set.changed_columns.push(i)
    }
  })

  return importData
}

/**
 * Examines the column names in the current table data, and the column names of updated table data
 * from the backend (e.g., if the user updates the import settings), and ensures any user-modified
 * column names are retained in the new table data.
 */
const mergeColumnNames = (
  currData = { row_set: { row_desc: [] } },
  newData
) => {
  // The initial local state sets `data` to an empty object, so set it to something more expanded
  const currRowDesc =
    typeof currData.row_set !== "undefined"
      ? currData.row_set.row_desc
      : { row_desc: [] }
  // By default, column names should not be marked as user-modified
  const newRowDesc = newData.row_set.row_desc.map((rowDesc) => ({
    ...rowDesc,
    col_name_modified: false
  }))

  // Note: zipWith truncates the results to the length of the shorter array. This means if the old
  // data has fewer columns than the new data, those additional columns will be missing here.
  const partialRowDesc = zipWith(
    (curr: RowDescription, updated: RowDescription): RowDescription => ({
      ...updated,
      col_name: curr.col_name_modified ? curr.col_name : updated.col_name,
      clean_col_name: curr.col_name_modified
        ? curr.clean_col_name
        : updated.clean_col_name,
      col_name_modified: Boolean(curr.col_name_modified)
    }),
    currRowDesc,
    newRowDesc
  )

  // Restore any additional columns missing due to zipWith truncating it above
  const fullRowDesc = partialRowDesc.concat(
    newRowDesc.slice(partialRowDesc.length)
  )

  return {
    ...newData,
    row_set: {
      ...newData.row_set,
      row_desc: fullRowDesc
    }
  }
}

export interface ImportSettings extends TCopyParams {
  has_header?: TImportHeaderRow
  null_str: string
  delimiter: string
  quoted: boolean
  is_replicated: boolean
  raster_point_type: number
  raster_point_transform: number
  raster_point_compute_angle: boolean
  s3_region: string
  s3_access_key: string
  s3_secret_key: string
  source_type?: TSourceType
}

const DEFAULT_IMPORTER_SETTINGS: ImportSettings = {
  null_str: "",
  delimiter: "",
  quoted: true,
  is_replicated: false, // Default is_replicated to false when on a distributed cluster
  raster_point_type: 1,
  raster_point_transform: 1,
  raster_point_compute_angle: false,
  s3_region: "",
  s3_access_key: "",
  s3_secret_key: ""
}

export interface ImportConnectorFields {
  isS3: boolean
  s3Bucket?: string
  s3Path?: string
  filesToImport: string[]
  isDataCatalogImport: boolean
  refreshInfo?: TTableRefreshInfo
  type?: ConnectorType
  [ConnectorType.PostgreSQL]?: {
    [PostgreSqlFieldKey.SERVERNAME]: string
    [PostgreSqlFieldKey.PORT]: string
    [PostgreSqlFieldKey.DATABASE]: string
    [PostgreSqlFieldKey.USERNAME]: string
    [PostgreSqlFieldKey.PASSWORD]: string
    [PostgreSqlFieldKey.SELECT_QUERY]: string
    [PostgreSqlFieldKey.ORDER_BY]: string
    driver: ODBCDriverName.PostgreSQL
  }
  [ConnectorType.PostGIS]?: {
    [PostgreSqlFieldKey.SERVERNAME]: string
    [PostgreSqlFieldKey.PORT]: string
    [PostgreSqlFieldKey.DATABASE]: string
    [PostgreSqlFieldKey.USERNAME]: string
    [PostgreSqlFieldKey.PASSWORD]: string
    [PostgreSqlFieldKey.SELECT_QUERY]: string
    [PostgreSqlFieldKey.ORDER_BY]: string
    driver: ODBCDriverName.PostGIS
  }
  [ConnectorType.Snowflake]?: {
    [SnowflakeFieldKey.SERVER]: string
    [SnowflakeFieldKey.WAREHOUSE]: string
    [SnowflakeFieldKey.ROLE]: string
    [SnowflakeFieldKey.PORT]: string
    [SnowflakeFieldKey.DATABASE]: string
    [SnowflakeFieldKey.USERNAME]: string
    [SnowflakeFieldKey.PASSWORD]: string
    [SnowflakeFieldKey.SELECT_QUERY]: string
    [SnowflakeFieldKey.ORDER_BY]: string
    driver: ODBCDriverName.Snowflake
  }
  [ConnectorType.Redshift]?: {
    [RedshiftFieldKey.DATABASE]: string
    [RedshiftFieldKey.PORT]: string
    [RedshiftFieldKey.SERVER]: string
    [RedshiftFieldKey.USERNAME]: string
    [RedshiftFieldKey.PASSWORD]: string
    [RedshiftFieldKey.SELECT_QUERY]: string
    [RedshiftFieldKey.ORDER_BY]: string
    driver: ODBCDriverName.Redshift
  }
}

const DEFAULT_IMPORTER_CONNECTOR_FIELDS: ImportConnectorFields = {
  isS3: false,
  filesToImport: [],
  isDataCatalogImport: false,
  type: undefined
}

interface ColumnTypeInfo {
  type: number
  encoding: number
  nullable: boolean
  is_array: boolean
  precision: number
  scale: number
  comp_param: number
}

// basically extends TColumnType
export interface RowDescription {
  col_name: string
  // Indicates if the user has changed the column name. These names should be preserved, even if
  // other actions change the name (such as asking the backend to re-detect table properties).
  col_name_modified: boolean
  col_type: ColumnTypeInfo
  is_reserved_keyword: boolean
  src_name: string
  is_system: boolean
  is_physical: boolean
  is_not_valid: boolean | null
  clean_col_name?: string
}

export interface ImporterState {
  data: {
    row_set?: {
      row_desc: RowDescription[]
      rows: object[]
      columns: any[]
      is_columnar: boolean
      changed_columns: number[]
    }
    copy_params?: TCopyParams
  }
  loading: boolean
  error: boolean | string
  importComplete: boolean | null
  currentFileUploading: boolean | null
  tablename: string
  settings: ImportSettings
  connector: ImportConnectorFields
  status: object
  startTime: string
  endTime: string
  estimatedEndTimes: number[]
  dataCatalog: DataCatalog
  dataCatalogFileLoad: {
    pending: boolean
    error: Error | null
  }
  showImportSettingsModal: boolean
  tableComment: string
  columnComments: string[]
}

export const initialState: ImporterState = {
  data: {},
  loading: false,
  error: false,
  status: {},
  startTime: "",
  endTime: "",
  estimatedEndTimes: [],
  importComplete: null,
  currentFileUploading: null,
  tablename: "",
  settings: DEFAULT_IMPORTER_SETTINGS,
  connector: DEFAULT_IMPORTER_CONNECTOR_FIELDS,
  dataCatalog: {
    pending: false,
    error: null,
    catalogItems: null
  },
  dataCatalogFileLoad: {
    pending: false,
    error: null
  },
  showImportSettingsModal: false,
  tableComment: "",
  columnComments: []
}

const loadingState = {
  loading: true,
  error: false
}

const errorState = (error) => ({
  error: getErrorMessageFromBackendError(error),
  loading: false
})

const successState = {
  error: false,
  loading: false
}

const extractDefaultTableName = (path = "") => {
  const fileNameAndExtension = path.split("/").pop() || ""
  const fileName = fileNameAndExtension.split(".")[0]
  return fileName.replace(/[-]/g, "_").replace(/[^a-zA-Z0-9_$]/g, "")
}

export function setRequestState(state: ImporterState) {
  return {
    ...state,
    ...loadingState
  }
}

export function setSuccessState(state: ImporterState) {
  return Object.assign({}, state, successState)
}

export function setErrorState(state: ImporterState, { error }) {
  return Object.assign({}, state, errorState(error))
}

export function setConfirmErrorState(state: ImporterState) {
  return Object.assign(
    {},
    {
      ...initialState,
      dataCatalog: state.dataCatalog
    }
  )
}

const lockReservedRasterColumnNames = (rowDescription) =>
  rowDescription.map((rowDesc) => ({
    ...rowDesc,
    // Locked column names cannot be edited.
    col_name_locked: RESERVED_RASTER_COLUMN_NAMES.has(rowDesc.clean_col_name)
  }))

const lockReservedGeoColumns = (rowDescription) =>
  rowDescription.map((rowDesc) => ({
    ...rowDesc,
    // Locked column names cannot be edited.
    col_type_locked: [
      TDatumType.POINT,
      TDatumType.POLYGON,
      TDatumType.MULTIPOLYGON,
      TDatumType.LINESTRING,
      TDatumType.MULTILINESTRING
    ].includes(rowDesc.col_type.type),
    col_name_locked: rowDesc.clean_col_name !== "geom"
  }))

export const reducers = {
  [RESET_IMPORTER]() {
    return {
      ...initialState
    }
  },
  [ACCEPT_IMPORT_ERROR](state: ImporterState) {
    return {
      ...state,
      loading: false,
      error: false,
      status: {},
      startTime: "",
      endTime: "",
      estimatedEndTimes: [],
      currentFileUploading: null
    }
  },
  [CLEAR_COLUMN_NAME_LIST](state: ImporterState) {
    return set(lensPath(["data", "row_set", "changed_columns"]), [])(state)
  },
  [UPDATE_TABLE_NAME]: (
    state,
    { newTableName: tablename }: { newTableName: string }
  ) => ({
    ...state,
    tablename // BEWARE! Some references on this darn thing are `tableName` vs `tablename`!!
  }),
  [UPDATE_TABLE_COMMENT]: (state, { comment }: { comment: string }) => ({
    ...state,
    tableComment: comment
  }),
  [UPDATE_COLUMN_COMMENT]: (
    state,
    { columnIndex, comment }: { columnIndex: number; comment: string }
  ) => {
    const columnComments = state.columnComments.slice()
    columnComments[columnIndex] = comment
    return {
      ...state,
      columnComments
    }
  },
  [GET_DATA_CATALOG_ERROR]: (state, { error }) => ({
    ...state,
    dataCatalog: {
      pending: false,
      error,
      catalogItems: null
    }
  }),
  [GET_DATA_CATALOG_REQUEST]: (state) => ({
    ...state,
    dataCatalog: {
      pending: true,
      error: null,
      catalogItems: null
    }
  }),
  [GET_DATA_CATALOG_SUCCESS]: (state, { catalogItems }) => ({
    ...state,
    dataCatalog: {
      pending: false,
      error: null,
      catalogItems
    }
  }),
  [LOAD_DATA_CATALOG_FILE_ERROR]: (state, { error }) => ({
    ...state,
    error,
    dataCatalogFileLoad: {
      pending: false,
      error
    }
  }),
  [LOAD_DATA_CATALOG_FILE_REQUEST]: (state) => ({
    ...state,
    dataCatalogFileLoad: {
      pending: true,
      error: null
    }
  }),
  [LOAD_DATA_CATALOG_FILE_SUCCESS]: (state) => ({
    ...state,
    dataCatalogFileLoad: {
      pending: false,
      error: null
    }
  }),
  [GET_IMPORT_PREVIEW_DATA_REQUEST](state: ImporterState, { pathName }) {
    const tablename = state.tablename || extractDefaultTableName(pathName)

    return {
      ...state,
      ...loadingState,
      tablename
    }
  },
  [GET_IMPORT_PREVIEW_DATA_ERROR]: setErrorState,
  [GET_IMPORT_PREVIEW_DATA_SUCCESS](
    state: ImporterState,
    {
      importPreviewData,
      ctxTableFields
    }: { importPreviewData: TDetectResult; ctxTableFields?: object[] } // ctxTableFields is column descriptions from table being appended to
  ) {
    const settings = Object.assign(
      {},
      importPreviewData.copy_params,
      state.settings
    )
    const cleanedData = compose(
      cleanColumnNames,
      mapOverColumnNamesAndCreateCleanColName,
      mapOverColumnNamesAndCreateIsValidStatus
    )(importPreviewData)
    const { row_set: { row_desc: incomingDataRowDesc = [] } = {} } = cleanedData
    const ctxTableFieldsLength = Object.keys(ctxTableFields || {}).length
    let data = mergeColumnNames(state.data, cleanedData)
    if (state.settings?.source_type === TSourceType.RASTER_FILE) {
      data = {
        ...data,
        row_set: {
          ...data.row_set,
          row_desc: lockReservedRasterColumnNames(data.row_set.row_desc)
        }
      }
    } else if (state.settings?.source_type === TSourceType.GEO_FILE) {
      data = {
        ...data,
        row_set: {
          ...data.row_set,
          row_desc: lockReservedGeoColumns(data.row_set.row_desc)
        }
      }
    }
    const newState = {
      ...state,
      loading: false,
      error: false,
      data,
      settings
    }
    return ctxTableFields
      ? {
          ...newState,
          columnCountMismatch:
            incomingDataRowDesc.length !== ctxTableFieldsLength
        }
      : newState
  },
  [CONFIRM_GET_IMPORT_PREVIEW_DATA_ERROR]: setConfirmErrorState,
  [CREATE_NEW_TABLE_REQUEST]: setRequestState,
  [CREATE_NEW_TABLE_ERROR]: setErrorState,
  [CREATE_NEW_TABLE_SUCCESS]: setSuccessState,
  [CONFIRM_CREATE_NEW_TABLE_ERROR]: setConfirmErrorState,
  [UPDATE_IMPORT_START_TIME](state: ImporterState, { time }) {
    return Object.assign({}, state, {
      startTime: time
    })
  },
  [UPDATE_IMPORT_END_TIME](state: ImporterState, { time }) {
    return Object.assign({}, state, {
      endTime: time
    })
  },
  [CLEAR_IMPORT_STATUS](state: ImporterState) {
    return Object.assign({}, state, {
      status: {},
      startTime: "",
      endTime: "",
      estimatedEndTimes: []
    })
  },
  [GET_IMPORT_STATUS_SUCCESS](state: ImporterState, { status }) {
    return Object.assign({}, state, {
      status
    })
  },
  [ADD_ESTIMATED_END_TIME](state: ImporterState, { time }) {
    return Object.assign({}, state, {
      estimatedEndTimes: state.estimatedEndTimes.concat(time)
    })
  },
  [IMPORT_TABLE_REQUEST](state: ImporterState, { filename }) {
    return Object.assign({}, state, {
      loading: false,
      error: false,
      currentFileUploading: filename
    })
  },
  [IMPORT_TABLE_ERROR]: setErrorState,
  [IMPORT_TABLE_SUCCESS]: setSuccessState,
  [REMOVE_IMPORT_FILES_ERROR]: setErrorState,
  [REMOVE_IMPORT_FILES_REQUEST]: setRequestState,
  [REMOVE_IMPORT_FILES_SUCCESS]: setSuccessState,
  [IMPORT_TABLE_COMPLETE](state: ImporterState) {
    return Object.assign({}, state, {
      loading: false,
      error: false,
      importComplete: true,
      currentFileUploading: null
    })
  },
  [CONFIRM_IMPORT_TABLE_ERROR]: setConfirmErrorState,
  [UPDATE_COLUMN_NAME](state: ImporterState, { columnId, name }) {
    const stateAfterCleanedColName = updateColumnHeaderProperty(
      ["clean_col_name"],
      columnId,
      name
    )(state)

    const stateAfterUpdateColName = updateColumnHeaderProperty(
      ["col_name_modified"],
      columnId,
      true
    )(stateAfterCleanedColName)

    const listOfAllCleanHeaders = stateAfterUpdateColName.data.row_set.row_desc.map(
      (header) => header.clean_col_name
    )

    return updateColumnHeaderProperty(
      ["is_not_valid"],
      columnId,
      state.settings?.source_type === TSourceType.RASTER_FILE
        ? checkForRasterColumnNameUpdateValidity(name, listOfAllCleanHeaders)
        : checkForNameValidity(name, listOfAllCleanHeaders)
    )(stateAfterUpdateColName)
  },
  [UPDATE_COLUMN_TYPE](state: ImporterState, { columnId, value }) {
    // Our type info objects only set a subset of type properties, so merge them with the full type
    // info detected by the backend to preserve all the properties we didn't explicitly set.
    const newColumnType = {
      ...state.data.row_set.row_desc[columnId].detected_col_type,
      ...value
    }

    return updateColumnHeaderProperty(
      ["col_type"],
      columnId,
      newColumnType
    )(state)
  },
  [UPDATE_IMPORTER_SETTING](state: ImporterState, { setting, value }) {
    return set(lensPath(["settings", setting]), value, state)
  },
  [SUBMIT_LOCAL_FILE_CONNECTOR](
    state: ImporterState,
    {
      uploadedFilenames,
      sourceType
    }: { uploadedFilenames: string[]; sourceType: TSourceType }
  ) {
    return {
      ...state,
      data: { ...initialState.data },
      settings: {
        ...DEFAULT_IMPORTER_SETTINGS,
        source_type: sourceType
      },
      connector: {
        ...DEFAULT_IMPORTER_CONNECTOR_FIELDS,
        filesToImport: uploadedFilenames.filter(
          (name) => !DONT_CALL_IMPORT_EXTS.some((ext) => name.endsWith(ext))
        ),
        type: ConnectorType.LocalFileImport
      }
    }
  },
  [SUBMIT_SERVER_FILE_CONNECTOR](
    state: ImporterState,
    { path, sourceType }: { path: string }
  ) {
    return {
      ...state,
      data: { ...initialState.data },
      settings: {
        ...DEFAULT_IMPORTER_SETTINGS,
        source_type: sourceType
      },
      connector: {
        ...DEFAULT_IMPORTER_CONNECTOR_FIELDS,
        filesToImport: [path],
        type: ConnectorType.ServerFileImport
      }
    }
  },
  [SUBMIT_DATA_CATALOG_CONNECTOR](
    state: ImporterState,
    { item }: { item: DataCatalogItem }
  ) {
    if (item.s3URL) {
      const { Region: region, Bucket: bucket, Key: path } = s3UrlParser.fromUrl(
        item.s3URL
      )
      const s3URL = s3UrlParser.toUrl(bucket, path || "").s3

      return {
        ...state,
        data: { ...initialState.data },
        settings: {
          ...DEFAULT_IMPORTER_SETTINGS,
          s3_region: region,
          s3_access_key: item.accessKey || "",
          s3_secret_key: item.secretKey || ""
        },
        connector: {
          ...DEFAULT_IMPORTER_CONNECTOR_FIELDS,
          isS3: true,
          filesToImport: [s3URL],
          isDataCatalogImport: true,
          type: ConnectorType.DataCatalog
        },
        tablename: extractDefaultTableName(path)
      }
    } else {
      return {
        ...state,
        data: { ...initialState.data },
        connector: {
          ...DEFAULT_IMPORTER_CONNECTOR_FIELDS,
          isDataCatalogImport: true,
          filesToImport: [item.localFilename],
          type: ConnectorType.DataCatalog
        },
        tablename: extractDefaultTableName(item.localFilename)
      }
    }
  },
  [SUBMIT_S3_CONNECTOR](
    state: ImporterState,
    {
      requiresCredentials,
      accessKey,
      secretKey,
      region,
      filenames,
      bucket,
      path,
      sourceType
    }: {
      requiresCredentials: boolean
      accessKey: string
      secretKey: string
      region: string
      filenames: string[]
      bucket: string
      path: string
      sourceType: string
    }
  ) {
    const newState = {
      ...state,
      data: { ...initialState.data },
      settings: {
        ...DEFAULT_IMPORTER_SETTINGS,
        s3_region: region,
        source_type: sourceType
      },
      connector: {
        ...DEFAULT_IMPORTER_CONNECTOR_FIELDS,
        isS3: true,
        s3Bucket: bucket,
        s3Path: path,
        filesToImport: filenames,
        type: ConnectorType.S3Import
      },
      tablename: extractDefaultTableName(filenames[0])
    }
    if (requiresCredentials) {
      newState.settings.s3_secret_key = secretKey
      newState.settings.s3_access_key = accessKey
    }
    return newState
  },
  [SUBMIT_ODBC_CONNECTOR](state: ImporterState, { payload }) {
    const newState = {
      ...state,
      data: { ...initialState.data },
      settings: {
        ...DEFAULT_IMPORTER_SETTINGS
      },
      connector: {
        ...DEFAULT_IMPORTER_CONNECTOR_FIELDS,
        type: payload.connectorType,
        [payload.connectorType]: {
          ...payload
        }
      },
      tablename: ""
    }

    return newState
  },
  [TOGGLE_IMPORT_SETTINGS_MODAL](
    state: ImporterState,
    { show }: { show: boolean }
  ) {
    return {
      ...state,
      showImportSettingsModal: show
    }
  },
  [SET_FSI_CONNECT_REFRESH_INFO](
    state: ImporterState,
    { refreshInfo }: { refreshInfo?: TTableRefreshInfo }
  ) {
    return {
      ...state,
      connector: {
        ...state.connector,
        refreshInfo
      }
    }
  },
  [SET_IMPORT_SETTINGS](
    state: ImporterState,
    { copyParams }: { copyParams: TCopyParams }
  ) {
    return {
      ...state,
      settings: copyParams
    }
  }
}

export default createReducer(reducers, initialState)
