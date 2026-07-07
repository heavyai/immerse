// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChartFieldAssignment, ChartTypes } from "components/sql-notebook/types"
import {
  ChartGenerator,
  assignNumber,
  assignString,
  numberField,
  stringField
} from "../chart-generator"

const { X, Y1, Y2, Y3, Y4, Y5 } = ChartFieldAssignment

export const layeredBarGenerator = new ChartGenerator(ChartTypes.LAYERED_BAR, [
  X,
  Y1
])
layeredBarGenerator.addDefinition(
  [stringField(1), numberField(2)],
  [assignString(X), assignNumber(Y1), assignNumber(Y2)]
)
layeredBarGenerator.addDefinition(
  [stringField(1), numberField(3)],
  [assignString(X), assignNumber(Y1), assignNumber(Y2), assignNumber(Y3)]
)
layeredBarGenerator.addDefinition(
  [stringField(1), numberField(4)],
  [
    assignString(X),
    assignNumber(Y1),
    assignNumber(Y2),
    assignNumber(Y3),
    assignNumber(Y4)
  ]
)
layeredBarGenerator.addDefinition(
  [stringField(1), numberField(5)],
  [
    assignString(X),
    assignNumber(Y1),
    assignNumber(Y2),
    assignNumber(Y3),
    assignNumber(Y4),
    assignNumber(Y5)
  ]
)
