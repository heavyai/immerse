// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AppState } from "vega/charts/types"
import { useSelector } from "react-redux"

export const useImporterState = () => {
  return useSelector((state: AppState) => state.importer)
}

export const useConnectorType = () => useImporterState().connector.type
