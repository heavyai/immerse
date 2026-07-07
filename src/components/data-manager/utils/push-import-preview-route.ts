// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { generatePath } from "react-router"
import { History } from "history"
import { ROUTE_DATA_MANAGEMENT_IMPORT_TABLE_PREVIEW } from "../../../routes/paths"

export const pushImportPreviewRoute = (
  history: History,
  params: Record<string, any>
) =>
  history.push(generatePath(ROUTE_DATA_MANAGEMENT_IMPORT_TABLE_PREVIEW, params))
