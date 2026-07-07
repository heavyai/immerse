// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type Aggregate =
  | "Avg"
  | "Min"
  | "Max"
  | "Sum"
  | "# Unique"
  | "Stddev"
  | "Sample"
  | "Median"
  | "Mode"

export const AGGTYPE_ALIASES = {
  Avg: "Avg",
  Min: "Min",
  Max: "Max",
  Sum: "Sum Of",
  Count: "",
  Custom: "",
  "# Unique": "# Of Unique",
  Stddev: "Standard Deviation",
  Sample: "Sample",
  Median: "Median"
}

export const AGG_TYPES_WITHOUT_SAMPLE: Aggregate[] = [
  "Avg",
  "Min",
  "Max",
  "Sum",
  "# Unique",
  "Stddev",
  "Median"
]

export const AGG_TYPES: Aggregate[] = [
  "Avg",
  "Min",
  "Max",
  "Sum",
  "# Unique",
  "Stddev",
  "Sample",
  "Median"
]

export const GEO_POSITION_AGG_TYPES: Aggregate[] = [
  "Avg",
  "Min",
  "Max",
  "Sample",
  "Median"
]

export const GEO_RASTERIZE_AGG_TYPES: Aggregate[] = ["Avg", "Min", "Max"]
