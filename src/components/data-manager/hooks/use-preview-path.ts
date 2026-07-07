// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { generatePath } from "react-router"
import { ROUTE_DATA_MANAGEMENT_IMPORT_TABLE_PREVIEW } from "routes/paths"

export const useImportPreviewPath = (params: {
  tableName?: string
  connect?: string
}) =>
  generatePath(ROUTE_DATA_MANAGEMENT_IMPORT_TABLE_PREVIEW, {
    ...params
  })

export const useConnectPreviewPath = (params: { tableName?: string }) =>
  useImportPreviewPath({
    ...params,
    connect: "connect"
  })
