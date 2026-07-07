// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useParams } from "react-router"
import { useIsAppend } from "./use-is-append"
import { DataManagerRouteParams } from "../constants"
import { useImporterState } from "./use-importer-state"

export const useImportTableName = () => {
  const params = useParams<DataManagerRouteParams>()
  const tableName = useImporterState().tablename
  return useIsAppend() ? params.tableName : tableName
}
