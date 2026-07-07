// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChartFieldAssignment, ChartTypes } from "components/sql-notebook/types"
import {
  ChartGenerator,
  assignDate,
  assignNumber,
  dateField,
  numberField
} from "../chart-generator"

const { X, Y, COLOR } = ChartFieldAssignment
export const heatmapGenerator = new ChartGenerator(ChartTypes.HEATMAP, [X, Y])
heatmapGenerator.addDefinition(
  [numberField(3)],
  [assignNumber(X), assignNumber(Y), assignNumber(COLOR)]
)
heatmapGenerator.addDefinition(
  [numberField(2), dateField(1)],
  [assignDate(X), assignNumber(Y), assignNumber(COLOR)]
)
heatmapGenerator.addDefinition(
  [numberField(1), dateField(2)],
  [assignDate(X), assignDate(Y), assignNumber(COLOR)]
)
