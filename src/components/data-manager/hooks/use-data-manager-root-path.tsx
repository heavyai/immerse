// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { generatePath, useParams } from "react-router"
import { ROUTE_DATA_MANAGEMENT } from "../../../routes/paths"

export const useDataManagerRootPath = () => {
  return generatePath(ROUTE_DATA_MANAGEMENT, useParams())
}
