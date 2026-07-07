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

const { X, Y1, Y2, Y3, Y4, Y5 } = ChartFieldAssignment

export const layeredLineGenerator = new ChartGenerator(
  ChartTypes.LAYERED_LINE,
  [X, Y1]
)
layeredLineGenerator.addDefinition(
  [dateField(1), numberField(2)],
  [assignDate(X), assignNumber(Y1), assignNumber(Y2)]
)
layeredLineGenerator.addDefinition(
  [dateField(1), numberField(3)],
  [assignDate(X), assignNumber(Y1), assignNumber(Y2), assignNumber(Y3)]
)
layeredLineGenerator.addDefinition(
  [dateField(1), numberField(4)],
  [
    assignDate(X),
    assignNumber(Y1),
    assignNumber(Y2),
    assignNumber(Y3),
    assignNumber(Y4)
  ]
)
layeredLineGenerator.addDefinition(
  [dateField(1), numberField(5)],
  [
    assignDate(X),
    assignNumber(Y1),
    assignNumber(Y2),
    assignNumber(Y3),
    assignNumber(Y4),
    assignNumber(Y5)
  ]
)
