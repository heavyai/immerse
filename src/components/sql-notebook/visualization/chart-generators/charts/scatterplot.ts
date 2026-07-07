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

const { X, Y, COLOR, SIZE } = ChartFieldAssignment

export const scatterplotGenerator = new ChartGenerator(ChartTypes.SCATTER, [
  X,
  Y
])
scatterplotGenerator.addDefinition(
  [dateField(1), numberField(1), stringField(1)],
  [assignDate(X), assignNumber(Y), assignString(COLOR), unassigned(SIZE)]
)
scatterplotGenerator.addDefinition(
  [dateField(1), numberField(1), stringField(2)],
  [assignDate(X), assignNumber(Y), assignString(COLOR), assignString(SIZE)]
)
scatterplotGenerator.addDefinition(
  [dateField(2), numberField(1)],
  [assignDate(X), assignDate(Y), assignNumber(COLOR), unassigned(SIZE)]
)
scatterplotGenerator.addDefinition(
  [dateField(2), numberField(2)],
  [assignDate(X), assignDate(Y), assignNumber(COLOR), assignNumber(SIZE)]
)
scatterplotGenerator.addDefinition(
  [dateField(3)],
  [assignDate(X), assignDate(Y), unassigned(COLOR), assignDate(SIZE)]
)
scatterplotGenerator.addDefinition(
  [dateField(2)],
  [assignDate(X), assignDate(Y), unassigned(COLOR), unassigned(SIZE)]
)
scatterplotGenerator.addDefinition(
  [dateField(2), stringField(1)],
  [assignDate(X), assignDate(Y), assignString(COLOR), unassigned(SIZE)]
)
scatterplotGenerator.addDefinition(
  [dateField(3), stringField(1)],
  [assignDate(X), assignDate(Y), assignString(COLOR), assignDate(SIZE)]
)
scatterplotGenerator.addDefinition(
  [numberField(2), stringField(1)],
  [assignNumber(X), assignNumber(Y), assignString(COLOR), unassigned(SIZE)]
)
scatterplotGenerator.addDefinition(
  [numberField(3), stringField(1)],
  [assignNumber(X), assignNumber(Y), assignString(COLOR), assignNumber(SIZE)]
)
scatterplotGenerator.addDefinition(
  [numberField(2)],
  [assignNumber(X), assignNumber(Y), unassigned(COLOR), unassigned(SIZE)]
)
scatterplotGenerator.addDefinition(
  [numberField(3)],
  [assignNumber(X), assignNumber(Y), assignNumber(COLOR), unassigned(SIZE)]
)
scatterplotGenerator.addDefinition(
  [numberField(4)],
  [assignNumber(X), assignNumber(Y), assignNumber(COLOR), assignNumber(SIZE)]
)
scatterplotGenerator.addDefinition(
  [dateField(1), numberField(1)],
  [assignDate(X), assignNumber(Y), unassigned(COLOR), unassigned(SIZE)]
)
scatterplotGenerator.addDefinition(
  [dateField(2), numberField(1)],
  [assignDate(X), assignNumber(Y), assignDate(COLOR), unassigned(SIZE)]
)
scatterplotGenerator.addDefinition(
  [dateField(3), numberField(1)],
  [assignDate(X), assignNumber(Y), assignDate(COLOR), assignDate(SIZE)]
)
