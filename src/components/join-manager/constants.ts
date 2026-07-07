// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const JOIN_CONDITION_TYPES = {
  INTERSECTS: "ST_INTERSECTS",
  CONTAINS: "ST_CONTAINS",
  DISJOINT: "ST_DISJOINT"
}

// Describes compatible left/right column types for join condition parameter order.
// Outer keys are the join condition
// Inner objects are LEFT_TYPE: [COMPATIBLE, RIGHT, TYPES]
export const GEO_JOIN_COMPATIBILITY = {
  [JOIN_CONDITION_TYPES.CONTAINS]: {
    POLYGON: ["POLYGON", "POINT"],
    MULTIPOLYGON: ["POINT"]
  },
  [JOIN_CONDITION_TYPES.INTERSECTS]: {
    POINT: ["MULTIPOLYGON", "POLYGON"],
    POLYGON: ["MULTIPOLYGON", "POLYGON"],
    MULTIPOLYGON: ["MULTIPOLYGON", "POLYGON"]
  }
}
