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
export const barChartGenerator = new ChartGenerator(ChartTypes.BAR, [X, Y])

barChartGenerator.addDefinition(
  [stringField(1), numberField(1), dateField(1)],
  [assignString(X), assignNumber(Y), assignDate(COLOR)]
)
barChartGenerator.addDefinition(
  [stringField(2), numberField(1)],
  [assignString(X), assignNumber(Y), assignString(COLOR)]
)
barChartGenerator.addDefinition(
  [stringField(1), numberField(1)],
  [assignString(X), assignNumber(Y), unassigned(COLOR)]
)
barChartGenerator.addDefinition(
  [dateField(2), numberField(1)],
  [assignDate(X), assignDate(Y), assignNumber(COLOR)]
)
barChartGenerator.addDefinition(
  [numberField(2)],
  [assignNumber(X), assignNumber(Y), unassigned(COLOR)]
)
