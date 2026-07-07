// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"
import { AppState } from "../../../vega/charts/types"
import { useIsAppend } from "./use-is-append"
import { checkForValidTableName } from "../../table-importer/table-importer-helpers"

export const useTableNameError = (tableName: string) => {
  const { tables } = useSelector((state: AppState) => state)

  return useIsAppend() ? "" : checkForValidTableName(tableName, tables.list)
}
