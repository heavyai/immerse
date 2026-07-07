// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  TCopyParams,
  TDetectResult,
  TImportHeaderRow,
  TSourceType,
  TTableRefreshInfo
} from "@heavyai/connector/dist/browser-connector"
import { AnyAction, Dispatch } from "redux"
import moment from "moment"
import { ThunkDispatch } from "redux-thunk"
import { omit } from "lodash"
import {
  ImportConnectorFields,
  ImporterState,
  ImportSettings,
  RowDescription
} from "reducers/importer-reducer"
import {
  ACCEPT_IMPORT_ERROR,
  ADD_ESTIMATED_END_TIME,
  CLEAR_COLUMN_NAME_LIST,
  CLEAR_IMPORT_STATUS,
  CREATE_NEW_TABLE_ERROR,
  CREATE_NEW_TABLE_REQUEST,
  CREATE_NEW_TABLE_SUCCESS,
  GET_DATA_CATALOG_ERROR,
  GET_DATA_CATALOG_REQUEST,
  GET_DATA_CATALOG_SUCCESS,
  GET_IMPORT_PREVIEW_DATA_ERROR,
  GET_IMPORT_PREVIEW_DATA_REQUEST,
  GET_IMPORT_PREVIEW_DATA_SUCCESS,
  GET_IMPORT_STATUS_SUCCESS,
  IMPORT_TABLE_COMPLETE,
  IMPORT_TABLE_ERROR,
  IMPORT_TABLE_REQUEST,
  IMPORT_TABLE_SUCCESS,
  LOAD_DATA_CATALOG_FILE_ERROR,
  LOAD_DATA_CATALOG_FILE_REQUEST,
  LOAD_DATA_CATALOG_FILE_SUCCESS,
  RESET_IMPORTER,
  SET_FSI_CONNECT_REFRESH_INFO,
  SET_IMPORT_SETTINGS,
  SUBMIT_DATA_CATALOG_CONNECTOR,
  SUBMIT_LOCAL_FILE_CONNECTOR,
  SUBMIT_ODBC_CONNECTOR,
  SUBMIT_S3_CONNECTOR,
  SUBMIT_SERVER_FILE_CONNECTOR,
  TOGGLE_IMPORT_SETTINGS_MODAL,
  TRACK_S3_IMPORT,
  TRACK_SOURCE_IMPORT,
  UPDATE_COLUMN_NAME,
  UPDATE_COLUMN_TYPE,
  UPDATE_IMPORT_END_TIME,
  UPDATE_IMPORT_START_TIME,
  UPDATE_IMPORTER_SETTING,
  UPDATE_TABLE_NAME,
  UPDATE_TABLE_COMMENT,
  UPDATE_COLUMN_COMMENT
} from "constants/action-types"
import { DataCatalogItem } from "components/table-importer/data-catalog/types"
import { parseFileName } from "components/table-importer/table-importer-helpers"
import { ConnectionState } from "reducers/connection"
import {
  AwsRegion,
  ConnectorType,
  ODBC_CONNECTORS,
  RemoteConnectorConfig
} from "components/data-manager/constants"
import {
  createOdbcConnector,
  createS3Connector,
  createServerFileConnector,
  detectColumnTypes as detectColumnTypesService
} from "components/data-manager/services/data-sources.service"
import { IMPORT_FILE_TYPES_UNFORMATTED } from "constants/import-file-types"
import { filenameToSourceTypeHeuristics } from "components/data-manager/utils/source-type-heuristics"
import { hideDangerModal, showDangerModal } from "./ui-action-creators"
import { AppState } from "../vega/charts/types"
import {
  PostgreSqlFieldKey,
  RedshiftFieldKey,
  SnowflakeFieldKey
} from "../components/data-manager/field-types"
import { getMultiFileGeoFileName } from "../utils/get-multi-file-geo-file-name"
import {
  setColumnComment,
  setTableComment
} from "../components/data-manager/services/comments.service"

export const trackS3Import = (columnCount, rowCount) => ({
  type: TRACK_S3_IMPORT,
  columnCount,
  rowCount
})

export const trackSourceImport = (columnCount, rowCount) => ({
  type: TRACK_SOURCE_IMPORT,
  columnCount,
  rowCount
})

export const updateTableName = (newTableName: string) => ({
  type: UPDATE_TABLE_NAME,
  newTableName
})

// Controls table comment input state in table preview
export const updateTableComment = (comment: string) => ({
  type: UPDATE_TABLE_COMMENT,
  comment
})

// Controls column comment input state in table preview
export const updateColumnComment = (columnIndex: number, comment: string) => ({
  type: UPDATE_COLUMN_COMMENT,
  columnIndex,
  comment
})

export const toggleImportSettingsModal = (show) => ({
  type: TOGGLE_IMPORT_SETTINGS_MODAL,
  show
})

export const setImportSettings = (copyParams: TCopyParams) => ({
  type: SET_IMPORT_SETTINGS,
  copyParams
})

export const updateImportSetting = (setting: string, value: any) => ({
  type: UPDATE_IMPORTER_SETTING,
  setting,
  value
})

// creating a new table

export const createNewTableRequest = () => ({
  type: CREATE_NEW_TABLE_REQUEST
})

export const createNewTableSuccess = () => ({
  type: CREATE_NEW_TABLE_SUCCESS
})

export const createNewTableError = (error) => ({
  type: CREATE_NEW_TABLE_ERROR,
  error
})

/**
 * This is a complication of fetching our row descriptors through the webserver--connector
 * normally stores the result for the previous detectColumnTypes call and mashes it
 * together with the row descriptors that we pass to createTablesAsync. So, since we're not calling
 * detectColumnTypes via connector for ODBC, we need to do the mashing-together ourselves here.
 */
const cleanOdbcRowDescriptors = (rowDescriptor) =>
  rowDescriptor.map((rowDesc) => ({
    ...omit(rowDesc, ["is_not_valid", "clean_col_name", "col_name_modified"]),
    col_name: rowDesc.clean_col_name,
    col_type: {
      ...rowDesc.col_type,
      precision: Math.min(rowDesc.col_type.precision, 18)
    }
  }))

export const createNewTableForImporter = () => async (
  dispatch: Dispatch,
  getState: () => { importer: ImporterState },
  services: any
) => {
  dispatch(createNewTableRequest())
  const { importer } = getState()
  const { type } = importer.connector
  const isOdbc = type && ODBC_CONNECTORS.includes(type)
  try {
    await services.get("DbCon").createTableAsync(
      importer.tablename,
      isOdbc
        ? cleanOdbcRowDescriptors(importer.data.row_set?.row_desc)
        : importer.data.row_set?.row_desc, // TColumnType[]
      new TCopyParams({ is_replicated: importer.settings.is_replicated }),
      {
        useUnmodifiedRowDesc: isOdbc
      }
    )
    dispatch(createNewTableSuccess())
  } catch (error) {
    dispatch(createNewTableError(error))
  }
}

// importing

export const clearImportStatus = () => ({
  type: CLEAR_IMPORT_STATUS
})

export const importTableRequest = (filename: string) => ({
  type: IMPORT_TABLE_REQUEST,
  filename
})

export const importTableError = (error) => ({
  type: IMPORT_TABLE_ERROR,
  error
})

export const acceptImportError = () => ({
  type: ACCEPT_IMPORT_ERROR
})

export const importTableSuccess = () => ({
  type: IMPORT_TABLE_SUCCESS
})

export const importTableComplete = () => ({
  type: IMPORT_TABLE_COMPLETE
})

export const updateImportStartTime = (time) => ({
  type: UPDATE_IMPORT_START_TIME,
  time
})

export const updateImportEndTime = (time) => ({
  type: UPDATE_IMPORT_END_TIME,
  time
})

export const addEstimatedEndTime = (time) => ({
  type: ADD_ESTIMATED_END_TIME,
  time
})

export const getImportStatusSuccess = (status) => ({
  type: GET_IMPORT_STATUS_SUCCESS,
  status
})

const IMPORT_STATUS_UPDATE_INTERVAL_MS = 1000

const getImportStatus = (filename: string) => async (
  dispatch: Dispatch,
  getState: () => { importer: ImporterState },
  services: any
) => {
  const connector = services.get("DbCon")
  const {
    importer: { startTime, currentFileUploading, error }
  } = getState()

  const queueNext = () => {
    if (currentFileUploading) {
      setTimeout(() => {
        getImportStatus(filename)(dispatch, getState, services)
      }, IMPORT_STATUS_UPDATE_INTERVAL_MS)
    }
  }
  try {
    const status = await connector.importTableStatusAsync(filename)
    const secondsElapsed = moment().diff(moment(startTime), "seconds")

    const estimatedSecondsToComplete =
      (status.rows_estimated / status.rows_completed) * secondsElapsed

    dispatch(getImportStatusSuccess(status))
    dispatch(addEstimatedEndTime(estimatedSecondsToComplete))
  } finally {
    if (!error) {
      queueNext()
    }
  }
}

// Updates column comments from redux `importer` state.
// This only works on existing columns, so should be called after all table/column
// changes have completed.
const setColumnComments = async (importerState: ImporterState) => {
  const { columnComments } = importerState
  const columnCommentMap = importerState.data.row_set?.row_desc.map(
    (col, i) => ({
      columnName: col.clean_col_name,
      comment: columnComments[i]
    })
  )

  if (columnCommentMap) {
    await Promise.all(
      columnCommentMap
        .filter(
          (col) => col && col.comment && typeof col.columnName === "string"
        )
        .map((col) =>
          setColumnComment(
            importerState.tablename,
            col.columnName as string,
            col.comment
          )
        )
    )
  }
}

const setComments = async (importerState: ImporterState) => {
  try {
    await Promise.all([
      setTableComment(importerState.tablename, importerState.tableComment),
      setColumnComments(importerState)
    ])
  } catch (error) {
    // Catch error here; we don't want to fail the entire import if only comment calls fail
    // eslint-disable-next-line no-console
    console.error("Failed to set comment", error)
  }
}

const importFromOdbc = (appendTableName) => async (
  dispatch,
  getState,
  services
) => {
  dispatch(importTableRequest(""))

  const {
    importer,
    importer: { tablename, data }
  } = getState()

  const DbCon = services.get("DbCon")

  try {
    await DbCon.importTableAsync(
      appendTableName || tablename,
      "",
      {
        ...importer.settings,
        source_type: TSourceType.ODBC
      },
      data.row_set.row_desc
    )
    dispatch(updateImportEndTime(new Date().toISOString()))
    dispatch(importTableSuccess())

    await setComments(importer)
    dispatch(importTableComplete())
  } catch (error) {
    dispatch(importTableError(error))
  }
}

export const importFiles = (
  tableName: string, // either the newly created table or a table to append to
  fileNames?: ImportConnectorFields["filesToImport"]
) => async (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>,
  getState: () => { importer: ImporterState },
  services: any
) => {
  const {
    importer,
    importer: { data }
  } = getState()

  fileNames = fileNames || importer.connector.filesToImport

  const shpFileName = getMultiFileGeoFileName(fileNames)

  const filesToImport = shpFileName ? [shpFileName] : fileNames
  const currentFile = filesToImport?.length && filesToImport.shift()

  if (!currentFile) {
    dispatch(updateImportEndTime(new Date().toISOString()))
    dispatch(importTableSuccess())
    return
  }

  dispatch(clearImportStatus())
  dispatch(importTableRequest(currentFile))

  const DbCon = services.get("DbCon")
  const importMethod = [TSourceType.GEO_FILE, TSourceType.RASTER_FILE].includes(
    data.copy_params.source_type
  )
    ? DbCon.importTableGeoAsync
    : DbCon.importTableAsync

  dispatch(updateImportStartTime(new Date().toISOString()))
  getImportStatus(currentFile)(dispatch, getState, services)

  try {
    await importMethod(
      tableName,
      currentFile,
      importer.settings,
      data.row_set.row_desc
    )
    dispatch(updateImportEndTime(new Date().toISOString()))
    dispatch(importTableSuccess())

    if (filesToImport.length === 0) {
      await setComments(importer)
      dispatch(importTableComplete())
    } else {
      await importFiles(tableName, filesToImport)(dispatch, getState, services)
    }
  } catch (error) {
    dispatch(importTableError(error))
  }
}

export const importData = (
  tableName: string,
  fileNames?: ImportConnectorFields["filesToImport"]
) => (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>,
  getState: () => { importer: ImporterState }
) => {
  const {
    importer: {
      data,
      connector: { type }
    }
  } = getState()

  if (!data.copy_params || !data.row_set) {
    // detect data types should be called to populate these
    dispatch(importTableError("Import type not detected."))
    return
  }

  if (type && ODBC_CONNECTORS.includes(type)) {
    dispatch(importFromOdbc(tableName))
    return
  }

  dispatch(importFiles(tableName, fileNames))
}

export const createNewTableAndImportData = () => async (
  dispatch: Dispatch,
  getState: () => { importer: ImporterState },
  services: any
) => {
  const { importer } = getState()

  await createNewTableForImporter()(dispatch, getState, services)
  await importData(importer.tablename)(dispatch, getState)
}

// connecting

export const setFSIRefreshInfo = (refreshInfo: TTableRefreshInfo) => ({
  type: SET_FSI_CONNECT_REFRESH_INFO,
  refreshInfo
})

export const createConnectedServerFileTable = (
  importerState: ImporterState
) => {
  const { data, connector, tablename } = importerState
  const serverFileConnectArgs: RemoteConnectorConfig = {
    copyParams: data.copy_params,
    rowDescriptor: data.row_set.row_desc,
    path: connector.filesToImport[0]
  }

  if (connector.refreshInfo) {
    serverFileConnectArgs.refreshInfo = connector.refreshInfo
  }

  return createServerFileConnector(serverFileConnectArgs, tablename)
}

export const createConnectedS3Table = (importerState: ImporterState) => {
  const { data, connector, settings, tablename } = importerState

  const s3ConnectArgs: RemoteConnectorConfig = {
    copyParams: data.copy_params,
    rowDescriptor: data.row_set.row_desc,
    accessId: settings.s3_access_key,
    secretKey: settings.s3_secret_key,
    awsRegion: settings.s3_region as AwsRegion,
    bucket: connector.s3Bucket,
    basePath: connector.s3Path
  }

  if (connector.refreshInfo) {
    s3ConnectArgs.refreshInfo = connector.refreshInfo
  }

  return createS3Connector(s3ConnectArgs, tablename)
}

const createPostgreSqlConnectTablePayload = (
  connectorState:
    | ImportConnectorFields[ConnectorType.PostgreSQL]
    | ImportConnectorFields[ConnectorType.PostGIS]
) => ({
  driver: connectorState?.driver,
  dbName: connectorState?.[PostgreSqlFieldKey.DATABASE],
  dbHost: connectorState?.[PostgreSqlFieldKey.SERVERNAME],
  sqlSelect: connectorState?.[PostgreSqlFieldKey.SELECT_QUERY],
  sqlOrderBy: connectorState?.[PostgreSqlFieldKey.ORDER_BY]
})

const buildPostgreSqlConnectorConfig = (
  connectorFields:
    | ImportConnectorFields[ConnectorType.PostgreSQL]
    | ImportConnectorFields[ConnectorType.PostGIS],
  tableName: string
) => {
  return {
    ...createPostgreSqlConnectTablePayload(connectorFields),
    username: connectorFields?.[PostgreSqlFieldKey.USERNAME],
    password: connectorFields?.[PostgreSqlFieldKey.PASSWORD],
    port:
      connectorFields && parseInt(connectorFields[PostgreSqlFieldKey.PORT], 10),
    tableName
  }
}

const buildSnowflakeConnectorConfig = (
  connectorFields: ImportConnectorFields[ConnectorType.Snowflake],
  tableName: string
) => ({
  username: connectorFields?.[SnowflakeFieldKey.USERNAME],
  password: connectorFields?.[SnowflakeFieldKey.PASSWORD],
  port:
    connectorFields && parseInt(connectorFields[SnowflakeFieldKey.PORT], 10),
  tableName,
  driver: connectorFields?.driver,
  dataWarehouse: connectorFields?.[SnowflakeFieldKey.WAREHOUSE],
  role: connectorFields?.[SnowflakeFieldKey.ROLE],
  dbName: connectorFields?.[SnowflakeFieldKey.DATABASE],
  dbHost: connectorFields?.[SnowflakeFieldKey.SERVER],
  sqlSelect: connectorFields?.[SnowflakeFieldKey.SELECT_QUERY],
  sqlOrderBy: connectorFields?.[SnowflakeFieldKey.ORDER_BY]
})

const buildRedshiftConnectorConfig = (
  connectorFields: ImportConnectorFields[ConnectorType.Redshift],
  tableName: string
) => ({
  username: connectorFields?.[RedshiftFieldKey.USERNAME],
  password: connectorFields?.[RedshiftFieldKey.PASSWORD],
  port: connectorFields && parseInt(connectorFields[RedshiftFieldKey.PORT], 10),
  tableName,
  sqlSelect: connectorFields?.[RedshiftFieldKey.SELECT_QUERY],
  sqlOrderBy: connectorFields?.[RedshiftFieldKey.ORDER_BY],
  driver: connectorFields?.driver,
  dbName: connectorFields?.[RedshiftFieldKey.DATABASE],
  dbHost: connectorFields?.[RedshiftFieldKey.SERVER]
})

export const createConnectedOdbcTable = (importerState: ImporterState) => {
  const { data, connector, tablename } = importerState

  let connectorConfig = {}

  switch (connector.type) {
    case ConnectorType.PostgreSQL:
      connectorConfig = buildPostgreSqlConnectorConfig(
        connector[ConnectorType.PostgreSQL],
        tablename
      )
      break
    case ConnectorType.PostGIS:
      connectorConfig = buildPostgreSqlConnectorConfig(
        connector[ConnectorType.PostGIS],
        tablename
      )
      break
    case ConnectorType.Snowflake:
      connectorConfig = buildSnowflakeConnectorConfig(
        connector[ConnectorType.Snowflake],
        tablename
      )
      break
    case ConnectorType.Redshift:
      connectorConfig = buildRedshiftConnectorConfig(
        connector[ConnectorType.Redshift],
        tablename
      )
      break
    default:
      throw Error(
        "buildOdbcConnectorConfig failed with unknown ODBC connector type"
      )
  }

  if (connector.refreshInfo) {
    connectorConfig.refreshInfo = connector.refreshInfo
  }

  connectorConfig.rowDescriptor = cleanOdbcRowDescriptors(data.row_set.row_desc)

  return createOdbcConnector(connectorConfig, tablename)
}

const createConnectedTable = (importerState: ImporterState) => {
  const connectorType = importerState.connector.type
  switch (connectorType) {
    case ConnectorType.Snowflake:
    case ConnectorType.PostgreSQL:
    case ConnectorType.PostGIS:
    case ConnectorType.Redshift:
      return createConnectedOdbcTable(importerState)
    case ConnectorType.S3Import:
      return createConnectedS3Table(importerState)
    case ConnectorType.ServerFileImport:
      return createConnectedServerFileTable(importerState)
    default:
      throw Error("createConnectedTable failed with unknown connector type")
  }
}

export const connectTable = () => async (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>,
  getState: () => { importer: ImporterState }
) => {
  const {
    importer,
    importer: { data }
  } = getState()

  if (!data.copy_params || !data.row_set) {
    // detect data types should be called to populate these
    dispatch(importTableError("Connect type not detected."))
    return
  }

  try {
    dispatch(clearImportStatus())
    dispatch(updateImportStartTime(new Date().toISOString()))

    const resp = await createConnectedTable(importer)

    if (resp.ok) {
      dispatch(updateImportEndTime(new Date().toISOString()))
      dispatch(importTableSuccess())
      await setComments(importer)
      dispatch(importTableComplete())
    } else {
      dispatch(importTableError(resp))
    }
  } catch (error) {
    dispatch(importTableError(error))
  }
}

// Data catalog

const HTTP_ERROR = 400
const HTTP_NOT_FOUND = 404

export const getDataCatalogRequest = () => ({
  type: GET_DATA_CATALOG_REQUEST
})

export const getDataCatalogError = (error) => ({
  type: GET_DATA_CATALOG_ERROR,
  error
})

export const getDataCatalogSuccess = (catalogItems) => ({
  type: GET_DATA_CATALOG_SUCCESS,
  catalogItems
})

export const getDataCatalog = (url: string) => async (dispatch: Dispatch) => {
  dispatch(getDataCatalogRequest())

  try {
    let response = await fetch(`${url}/data-catalog/manifest.json`)

    if (response.status === HTTP_NOT_FOUND) {
      const defaultUrl = process.env.DEFAULT_DATA_CATALOG_MANIFEST_URL

      if (typeof defaultUrl === "undefined") {
        const error =
          "Environment variable DEFAULT_DATA_CATALOG_MANIFEST_URL has not been defined for this build of Immerse. This variable must be defined for the table importer to work correctly, if the connected database has no local data catalog configured."
        // eslint-disable-next-line no-console
        console.error(error)
        dispatch(getDataCatalogError(error))
      } else {
        response = await fetch(process.env.DEFAULT_DATA_CATALOG_MANIFEST_URL)
      }
    }

    if (response.status >= HTTP_ERROR) {
      dispatch(getDataCatalogError(response.statusText))
    } else {
      const catalogItems = await response.json()

      dispatch(getDataCatalogSuccess(catalogItems))
    }
  } catch (error) {
    dispatch(getDataCatalogError(String(error)))
  }
}

export const loadDataCatalogRequest = () => ({
  type: LOAD_DATA_CATALOG_FILE_REQUEST
})

export const loadDataCatalogError = (error) => ({
  type: LOAD_DATA_CATALOG_FILE_ERROR,
  error
})

export const loadDataCatalogSuccess = () => ({
  type: LOAD_DATA_CATALOG_FILE_SUCCESS
})

export const loadDataCatalogFile = (
  filename: string,
  postUrl: string,
  sessionId: string
) => async (dispatch: Dispatch) => {
  dispatch(loadDataCatalogRequest())

  const formData = new FormData()
  formData.append("filename", filename)
  formData.append("sessionid", sessionId)

  return fetch(`${postUrl}/data-catalog-upload`, {
    method: "POST",
    body: formData
  })
    .then(async (response) => {
      if (response.status >= HTTP_ERROR) {
        const httpError = await response.text()
        throw httpError
      } else {
        dispatch(loadDataCatalogSuccess())
      }
    })
    .catch((error) => {
      dispatch(loadDataCatalogError(error))
      throw error
    })
}

// Preview Data

export const getImportPreviewDataRequest = (fileName = "") => ({
  type: GET_IMPORT_PREVIEW_DATA_REQUEST,
  pathName: fileName
})

export const getImportPreviewDataError = (error) => ({
  type: GET_IMPORT_PREVIEW_DATA_ERROR,
  error
})

export const getImportPreviewDataSuccess = (
  importPreviewData: TDetectResult,
  ctxTableFields?: RowDescription[] // columns from table being appended to, if table being appended to
) => ({
  type: GET_IMPORT_PREVIEW_DATA_SUCCESS,
  importPreviewData,
  ctxTableFields
})

const selectFilenameForDetectColumnTypes = ({
  connector: { filesToImport }
}: ImporterState): string => {
  if (filesToImport.length === 1) {
    return filesToImport[0]
  }

  const shpFileName = getMultiFileGeoFileName(filesToImport)
  // Multi-file GEO
  if (shpFileName) {
    return shpFileName
  }
  // Multi-file RASTER
  let matchesRasterMain = undefined
  filesToImport.some((name: string) => {
    matchesRasterMain = IMPORT_FILE_TYPES_UNFORMATTED.rasterMain.find((ext) =>
      name.endsWith(ext)
    )
    return Boolean(matchesRasterMain)
  })
  if (matchesRasterMain) {
    return `${parseFileName(filesToImport[0])}.${matchesRasterMain}`
  }
  // The rest
  return filesToImport[0]
}

const createPostgreSqlDetectColumnTypesPayload = (
  connectorState: ImportConnectorFields
) => {
  const postgresConnectorState = connectorState[ConnectorType.PostgreSQL]
  return {
    sourceType: "ODBC",
    dbUserName: postgresConnectorState?.[PostgreSqlFieldKey.USERNAME],
    dbPassword: postgresConnectorState?.[PostgreSqlFieldKey.PASSWORD],
    dbPort:
      postgresConnectorState &&
      parseInt(postgresConnectorState[PostgreSqlFieldKey.PORT], 10),
    ...createPostgreSqlConnectTablePayload(postgresConnectorState)
  }
}

const createPostGisDetectColumnTypesPayload = (
  connectorState: ImportConnectorFields
) => {
  const postGisConnectorState = connectorState[ConnectorType.PostGIS]
  return {
    sourceType: "ODBC",
    dbUserName: postGisConnectorState?.[PostgreSqlFieldKey.USERNAME],
    dbPassword: postGisConnectorState?.[PostgreSqlFieldKey.PASSWORD],
    dbPort:
      postGisConnectorState &&
      parseInt(postGisConnectorState[PostgreSqlFieldKey.PORT], 10),
    ...createPostgreSqlConnectTablePayload(postGisConnectorState)
  }
}

const createSnowflakeDetectColumnTypesPayload = (
  connectorState: ImportConnectorFields
) => {
  const snowflakeConnectorState = connectorState[ConnectorType.Snowflake]
  return {
    sourceType: "ODBC",
    dbUserName: snowflakeConnectorState?.[SnowflakeFieldKey.USERNAME],
    dbPassword: snowflakeConnectorState?.[SnowflakeFieldKey.PASSWORD],
    dbPort:
      snowflakeConnectorState &&
      parseInt(snowflakeConnectorState[SnowflakeFieldKey.PORT], 10),
    dataWarehouse: snowflakeConnectorState?.[SnowflakeFieldKey.WAREHOUSE],
    role: snowflakeConnectorState?.[SnowflakeFieldKey.ROLE],
    driver: snowflakeConnectorState?.driver,
    dbName: snowflakeConnectorState?.[SnowflakeFieldKey.DATABASE],
    dbHost: snowflakeConnectorState?.[SnowflakeFieldKey.SERVER],
    sqlSelect: snowflakeConnectorState?.[SnowflakeFieldKey.SELECT_QUERY],
    sqlOrderBy: snowflakeConnectorState?.[SnowflakeFieldKey.ORDER_BY]
  }
}

const createRedshiftDetectColumnTypesPayload = (
  connectorState: ImportConnectorFields
) => {
  const redshiftConnectorState = connectorState[ConnectorType.Redshift]
  return {
    sourceType: "ODBC",
    dbUserName: redshiftConnectorState?.[RedshiftFieldKey.USERNAME],
    dbPassword: redshiftConnectorState?.[RedshiftFieldKey.PASSWORD],
    dbPort:
      redshiftConnectorState &&
      parseInt(redshiftConnectorState[RedshiftFieldKey.PORT], 10),
    driver: redshiftConnectorState?.driver,
    dbName: redshiftConnectorState?.[RedshiftFieldKey.DATABASE],
    dbHost: redshiftConnectorState?.[RedshiftFieldKey.SERVER],
    sqlSelect: redshiftConnectorState?.[RedshiftFieldKey.SELECT_QUERY],
    sqlOrderBy: redshiftConnectorState?.[RedshiftFieldKey.ORDER_BY]
  }
}

const detectOdbcColumnTypes = async (connectorState) => {
  let detectColumnTypesPayload = {}

  switch (connectorState.type) {
    case ConnectorType.PostgreSQL:
      detectColumnTypesPayload = createPostgreSqlDetectColumnTypesPayload(
        connectorState
      )
      break
    case ConnectorType.PostGIS:
      detectColumnTypesPayload = createPostGisDetectColumnTypesPayload(
        connectorState
      )
      break
    case ConnectorType.Snowflake:
      detectColumnTypesPayload = createSnowflakeDetectColumnTypesPayload(
        connectorState
      )
      break
    case ConnectorType.Redshift:
      detectColumnTypesPayload = createRedshiftDetectColumnTypesPayload(
        connectorState
      )
      break
    default:
      throw Error("detectOdbcColumnTypes failed with unknown connector type")
  }

  const detectColumnTypesResponse: TDetectResult = await detectColumnTypesService(
    detectColumnTypesPayload
  )

  if (detectColumnTypesResponse.ok) {
    return detectColumnTypesResponse.json()
  }

  const textResponse = await detectColumnTypesResponse.text()
  throw Error(textResponse)
}

const buildCopyParams = (
  importerSettings: ImportSettings,
  fileName: string
) => {
  const copyParams: TCopyParams = {
    ...importerSettings,
    has_header:
      importerSettings.has_header === undefined
        ? TImportHeaderRow.AUTODETECT
        : importerSettings.has_header,
    source_type: importerSettings.source_type
  }

  // BE delimiter autodetect doesnt work so well, so we help it out here
  if (
    importerSettings.source_type === TSourceType.DELIMITED_FILE &&
    importerSettings.delimiter === "" && // "auto" setting
    fileName.includes(".tsv")
  ) {
    copyParams.delimiter = "\\t"
  }

  return copyParams
}

export const detectColumnTypes = (
  importerSettings: ImportSettings,
  fileName: string
) => async (_dispatch: any, _getState: any, services: any) => {
  const copyParams = buildCopyParams(importerSettings, fileName)
  return await services
    .get("DbCon")
    .detectColumnTypesAsync(fileName, copyParams)
}

const detectDataCatalogColumnTypes = (
  importerSettings: ImportSettings,
  fileName: string
) => async (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>,
  getState: () => AppState
) => {
  const {
    connection: {
      user: { host, port, protocol },
      sessionId
    },
    importer: {
      connector: { isS3 }
    }
  } = getState()
  if (!isS3) {
    await loadDataCatalogFile(
      fileName,
      `${protocol}://${host}:${port}`,
      sessionId
    )(dispatch)
  }

  const sourceType = await filenameToSourceTypeHeuristics(
    fileName,
    importerSettings
  )

  return dispatch(
    detectColumnTypes(
      { ...importerSettings, source_type: sourceType },
      fileName
    )
  )
}

export const getImportPreviewData = (appendTableName?: string | null) => async (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>,
  getState: () => { importer: ImporterState; connection: ConnectionState },
  services: any
) => {
  const { importer } = getState()

  const {
    connector: { type: connectorType },
    settings
  } = importer
  const filename = selectFilenameForDetectColumnTypes(importer)
  await dispatch(getImportPreviewDataRequest(filename))

  let importPreviewData = null

  try {
    switch (connectorType) {
      case ConnectorType.LocalFileImport:
      case ConnectorType.ServerFileImport:
      case ConnectorType.S3Import:
        importPreviewData = await dispatch(
          detectColumnTypes(settings, filename)
        )
        break
      case ConnectorType.DataCatalog:
        importPreviewData = await dispatch(
          detectDataCatalogColumnTypes(settings, filename)
        )
        break
      case ConnectorType.PostgreSQL:
      case ConnectorType.PostGIS:
      case ConnectorType.Snowflake:
      case ConnectorType.Redshift:
        importPreviewData = await detectOdbcColumnTypes(importer.connector)
        break
      default:
        return dispatch(getImportPreviewDataError("Unknown connector type"))
    }

    const appendFields = appendTableName
      ? (await services.get("DbCon").getFieldsAsync(appendTableName)).row_desc
      : undefined

    return dispatch(
      getImportPreviewDataSuccess(importPreviewData, appendFields)
    )
  } catch (e) {
    return dispatch(getImportPreviewDataError(e))
  }
}

// const fileNameIsArchive = (fileName: string) =>
//   IMPORT_FILE_CATEGORIES[FILE_TYPES.COMPRESSED]
//     .extensions
//     .includes(
//       mime.getExtension(
//         mime.getType(fileName) as string
//       ) as string
//     )

// const filterArchiveFileNames = (fileNames: string[]) =>
//   fileNames.filter(
//     (fileName) =>
//       IMPORT_FILE_CATEGORIES[FILE_TYPES.COMPRESSED]
//         .extensions
//         .includes(
//           mime.getExtension(
//             mime.getType(fileName) as string
//           ) as string
//         )
//   )
//
// const rewriteGeoArchiveFileNames = async (
//   fileNames: string[]
// ): Promise<string[]> =>
//   await Promise.all(fileNames.map(
//     async (fileName: string) =>
//       fileNameIsArchive(fileName) ?
//         await archiveContainsGeoFile(fileName) || fileName :
//         fileName
//   )) as string[]

// Submit Connector Forms

export const submitLocalFileConnector = (
  uploadedFilenames: string[],
  sourceType: TSourceType
) => ({
  type: SUBMIT_LOCAL_FILE_CONNECTOR,
  uploadedFilenames, // await rewriteGeoArchiveFileNames(uploadedFilenames),
  sourceType
})

export const submitDataCatalogConnector = (item: DataCatalogItem) => ({
  type: SUBMIT_DATA_CATALOG_CONNECTOR,
  item
})

export const submitS3Connector = (
  filenames: string[],
  region: string,
  bucket: string,
  path: string,
  requiresCredentials: boolean,
  accessKey = "",
  secretKey = "",
  sourceType: TSourceType
) => ({
  type: SUBMIT_S3_CONNECTOR,
  requiresCredentials,
  accessKey,
  secretKey,
  region,
  filenames,
  bucket,
  path,
  sourceType
})

export const submitServerFileConnector = (
  path: string,
  sourceType: string
) => ({
  type: SUBMIT_SERVER_FILE_CONNECTOR,
  sourceType,
  path
})

export const submitOdbcConnector = (payload) => ({
  type: SUBMIT_ODBC_CONNECTOR,
  payload
})

export const resetImporter = () => ({
  type: RESET_IMPORTER
})

export const displayImporterError = (errorMessage) => (dispatch) => {
  dispatch(
    showDangerModal({
      title: "Importer Error",
      message: errorMessage,
      primaryAction: {
        action: () => {
          dispatch(hideDangerModal())
          dispatch(acceptImportError())
        },
        text: "Close"
      }
    })
  )
}
export const clearChangedColumnNameList = () => ({
  type: CLEAR_COLUMN_NAME_LIST
}) // This type is a subset of ColumnTypeInfo in importer-reducer.ts, with all props optional
interface ColumnTypeUpdate {
  type?: number
  precision?: number
  encoding?: number
}

export const updateColumnName = (name, columnId) => ({
  type: UPDATE_COLUMN_NAME,
  name,
  columnId
})

export const updateColumnType = (
  value: ColumnTypeUpdate,
  columnId: number
) => ({
  type: UPDATE_COLUMN_TYPE,
  value,
  columnId
})
