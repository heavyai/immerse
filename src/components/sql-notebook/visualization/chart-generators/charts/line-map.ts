// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChartFieldAssignment, ChartTypes } from "components/sql-notebook/types"
import {
  ChartGenerator,
  assignNumber,
  assignString,
  numberField,
  stringField,
  unassigned,
  assignLineGeometry,
  lineGeometryField
} from "../chart-generator"

const { COLOR, SIZE, LINE, GEOM } = ChartFieldAssignment
export const lineMapGenerator = new ChartGenerator(ChartTypes.LINE_MAP, [LINE])

lineMapGenerator.addDefinition(
  [lineGeometryField(1)],
  [assignLineGeometry(GEOM)]
)
lineMapGenerator.addDefinition(
  [lineGeometryField(1), numberField(1)],
  [assignLineGeometry(GEOM), assignNumber(COLOR), unassigned(SIZE)]
)
lineMapGenerator.addDefinition(
  [lineGeometryField(1), stringField(1)],
  [assignLineGeometry(GEOM), assignString(COLOR)]
)
lineMapGenerator.addDefinition(
  [lineGeometryField(1), numberField(2)],
  [assignLineGeometry(GEOM), assignNumber(COLOR), assignNumber(SIZE)]
)
lineMapGenerator.addDefinition(
  [lineGeometryField(1), numberField(1), stringField(1)],
  [assignLineGeometry(GEOM), assignString(COLOR), assignNumber(SIZE)]
)
