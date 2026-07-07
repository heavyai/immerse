// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useParams } from "react-router"
import { DataManagerRouteParams, IMPORT_ACTIONS } from "../constants"

export const useIsAppend = () => {
  const params = useParams<DataManagerRouteParams>()
  return params.importAction === IMPORT_ACTIONS.APPEND
}
