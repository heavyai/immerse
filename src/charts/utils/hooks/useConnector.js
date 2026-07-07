// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Services from "services/immerse"
import { createQueuedConnector } from "services/ConnectorWithQueue"

export const useConnector = ({ chartId, dashboardId, tableName }) => {
  return createQueuedConnector({
    connector: Services.get("DbCon"),
    dashboardId,
    chartId,
    tableName
  })
}
