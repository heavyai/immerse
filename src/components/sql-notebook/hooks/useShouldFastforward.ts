// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"
import { AppState } from "vega/charts/types"

export const useShouldFastforward = (cellIndex: number) =>
  useSelector((state: AppState) =>
    state.sqlNotebook.cells[cellIndex].fastforward === undefined
      ? state.sqlNotebook.fastforwardDefault
      : state.sqlNotebook.cells[cellIndex].fastforward
  )
