// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChartFieldAssignment, ChartTypes } from "components/sql-notebook/types"
import {
  ChartGenerator,
  assignDate,
  assignNumber,
  assignString,
  dateField,
  numberField,
  stringField,
  unassigned
} from "../chart-generator"

const { X, Y, COLOR } = ChartFieldAssignment

export const lineChartGenerator = new ChartGenerator(ChartTypes.LINE, [X, Y])

lineChartGenerator.addDefinition(
  [dateField(1), numberField(1), stringField(1)],
  [assignDate(X), assignNumber(Y), assignString(COLOR)]
)
lineChartGenerator.addDefinition(
  [dateField(2), numberField(1)],
  [assignDate(X), assignDate(COLOR), assignNumber(Y)]
)
lineChartGenerator.addDefinition(
  [dateField(1), numberField(1)],
  [assignDate(X), unassigned(COLOR), assignNumber(Y)]
)
lineChartGenerator.addDefinition(
  [dateField(2), numberField(1)],
  [assignDate(X), assignDate(COLOR), assignNumber(Y)]
)
