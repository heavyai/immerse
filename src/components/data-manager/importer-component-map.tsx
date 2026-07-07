// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import ImportCSVIcon from "../svg-icons/import-csv"
import ImportLocalFile from "./import-local-file"
import ImportServerFile from "./import-server-file"
import { IMPORT_FILE_CATEGORIES } from "./import-constants"
import ImportDataCatalogIcon from "../svg-icons/import-data-catalog"
import ImportDataCatalog from "./import-data-catalog"
import ImportS3Icon from "../svg-icons/import-s3"
import ImportS3 from "./import-s3"
import ImportSnowflakeIcon from "../svg-icons/import-snowflake"
import ImportSnowflake from "./import-snowflake"
import IconRedshift from "../svg-icons/connectors/icon-redshift"
import RdmsImportForm from "./import-form-rdms"
import IconPostgres from "../svg-icons/connectors/icon-postgres"
import IconPostGis from "../svg-icons/connectors/icon-postgis"
import IconOdbc from "../svg-icons/connectors/icon-odbc"
import { ConnectorType, ODBCDriverName } from "./constants"
import ImportPostgreSql from "./import-postgresql"
import ImportRedshift from "./import-redshift"
import ImportPostGIS from "./import-postgis"

export type Importer = {
  label: string
  icon: JSX.Element
  adminRequired?: boolean
  supportedFiles?: any
  supported?: boolean
  driver?: ODBCDriverName
  component: any
  type: ConnectorType
}

export const IMPORTERS: Record<ConnectorType, Importer> = {
  [ConnectorType.LocalFileImport]: {
    label: "Local File",
    icon: <ImportCSVIcon />,
    component: ImportLocalFile,
    supportedFiles: IMPORT_FILE_CATEGORIES,
    type: ConnectorType.LocalFileImport,
    supported: true
  },
  [ConnectorType.ServerFileImport]: {
    label: "Server File",
    icon: <ImportCSVIcon />,
    component: ImportServerFile,
    adminRequired: true,
    type: ConnectorType.ServerFileImport,
    supported: true
  },
  [ConnectorType.DataCatalog]: {
    label: "Data Catalog",
    icon: <ImportDataCatalogIcon />,
    component: ImportDataCatalog,
    type: ConnectorType.DataCatalog,
    supported: true
  },
  [ConnectorType.S3Import]: {
    label: "Amazon S3",
    icon: <ImportS3Icon />,
    component: ImportS3,
    type: ConnectorType.S3Import,
    supported: true
  },
  [ConnectorType.Snowflake]: {
    label: "Snowflake",
    icon: <ImportSnowflakeIcon />,
    component: ImportSnowflake,
    driver: ODBCDriverName.Snowflake,
    type: ConnectorType.Snowflake,
    supported: true
  },
  [ConnectorType.Redshift]: {
    label: "Redshift",
    icon: <IconRedshift />,
    component: ImportRedshift,
    driver: ODBCDriverName.Redshift,
    type: ConnectorType.Redshift,
    supported: true
  },
  [ConnectorType.PostgreSQL]: {
    label: "PostgreSQL",
    icon: <IconPostgres />,
    component: ImportPostgreSql,
    driver: ODBCDriverName.PostgreSQL,
    type: ConnectorType.PostgreSQL,
    supported: true
  },
  [ConnectorType.PostGIS]: {
    label: "PostGIS",
    icon: <IconPostGis />,
    component: ImportPostGIS,
    driver: ODBCDriverName.PostGIS,
    type: ConnectorType.PostGIS,
    supported: true
  }
}

export const GENERIC_ODBC_IMPORTER: Importer = {
  label: "ODBC",
  icon: <IconOdbc />,
  component: RdmsImportForm
}
