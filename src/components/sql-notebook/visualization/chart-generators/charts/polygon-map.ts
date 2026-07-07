// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChartFieldAssignment, ChartTypes } from "components/sql-notebook/types"
import {
  ChartGenerator,
  assignNumber,
  assignString,
  numberField,
  stringField,
  assignPolygonGeometry,
  polygonGeometryField
} from "../chart-generator"

const { COLOR, GEOM } = ChartFieldAssignment
export const polygonMapGenerator = new ChartGenerator(ChartTypes.POLYGON_MAP, [
  GEOM
])

polygonMapGenerator.addDefinition(
  [polygonGeometryField(1)],
  [assignPolygonGeometry(GEOM)]
)
polygonMapGenerator.addDefinition(
  [polygonGeometryField(1), numberField(1)],
  [assignPolygonGeometry(GEOM), assignNumber(COLOR)]
)
polygonMapGenerator.addDefinition(
  [polygonGeometryField(1), stringField(1)],
  [assignPolygonGeometry(GEOM), assignString(COLOR)]
)
