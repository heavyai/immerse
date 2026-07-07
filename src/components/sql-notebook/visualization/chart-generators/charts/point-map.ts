// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChartFieldAssignment, ChartTypes } from "components/sql-notebook/types"
import {
  ChartGenerator,
  assignNumber,
  assignString,
  assignLatitude,
  assignLongitude,
  assignPointGeometry,
  numberField,
  stringField,
  latitudeField,
  longitudeField,
  pointGeometryField,
  unassigned,
  nonLocationNumberField,
  assignNonLocationNumber
} from "../chart-generator"

const { COLOR, LAT, LON, SIZE, POINT } = ChartFieldAssignment
export const pointMapGenerator = new ChartGenerator(ChartTypes.POINT_MAP, [
  POINT,
  LAT,
  LON
])

pointMapGenerator.addDefinition(
  [latitudeField(1), longitudeField(1)],
  [assignLatitude(LAT), assignLongitude(LON)]
)
pointMapGenerator.addDefinition(
  [latitudeField(1), longitudeField(1), nonLocationNumberField(1)],
  [
    assignLatitude(LAT),
    assignLongitude(LON),
    assignNonLocationNumber(COLOR),
    unassigned(SIZE)
  ]
)
pointMapGenerator.addDefinition(
  [latitudeField(1), longitudeField(1), stringField(1)],
  [assignLatitude(LAT), assignLongitude(LON), assignString(COLOR)]
)
pointMapGenerator.addDefinition(
  [latitudeField(1), longitudeField(1), nonLocationNumberField(2)],
  [
    assignLatitude(LAT),
    assignLongitude(LON),
    assignNonLocationNumber(COLOR),
    assignNonLocationNumber(SIZE)
  ]
)
pointMapGenerator.addDefinition(
  [
    latitudeField(1),
    longitudeField(1),
    nonLocationNumberField(1),
    stringField(1)
  ],
  [
    assignLatitude(LAT),
    assignLongitude(LON),
    assignString(COLOR),
    assignNonLocationNumber(SIZE)
  ]
)

// Now with point geometry
pointMapGenerator.addDefinition(
  [pointGeometryField(1)],
  [assignPointGeometry(POINT)]
)
pointMapGenerator.addDefinition(
  [pointGeometryField(1), numberField(1)],
  [assignPointGeometry(POINT), assignNumber(COLOR), unassigned(SIZE)]
)
pointMapGenerator.addDefinition(
  [pointGeometryField(1), stringField(1)],
  [assignPointGeometry(POINT), assignString(COLOR)]
)
pointMapGenerator.addDefinition(
  [pointGeometryField(1), numberField(2)],
  [assignPointGeometry(POINT), assignNumber(COLOR), assignNumber(SIZE)]
)
pointMapGenerator.addDefinition(
  [pointGeometryField(1), numberField(1), stringField(1)],
  [assignPointGeometry(POINT), assignString(COLOR), assignNumber(SIZE)]
)
