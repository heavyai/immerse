// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { generatePath } from "react-router"
import { ROUTE_DATA_MANAGEMENT_IMPORT } from "../../../routes/paths"
import { IMPORT_ACTIONS } from "../constants"

type RouteParams = {
  [key: string]: string
}

export const generateImportAppendPath = (routeParams: RouteParams) => {
  return generatePath(ROUTE_DATA_MANAGEMENT_IMPORT, {
    importAction: IMPORT_ACTIONS.APPEND,
    ...routeParams
  })
}

export const generateImportCreatePath = (routeParams: RouteParams) => {
  return generatePath(ROUTE_DATA_MANAGEMENT_IMPORT, {
    importAction: IMPORT_ACTIONS.CREATE,
    ...routeParams
  })
}
