// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export enum GlobalExpressionType {
  DIMENSION = "DIMENSION",
  MEASURE = "MEASURE",
  FILTER = "FILTER"
}

/**
 * Maps persisted global expressions (from getCustomExpressionsAsync) to a parameter name
 * Returns the parameter name string the global expression should be stored under
 */
export function buildGlobalExpressionParameterName({
  label, // User-defined name for the expression
  dataSource,
  globalExpressionType
}: {
  label: string
  dataSource: string
  globalExpressionType: GlobalExpressionType
}) {
  return `GLOBAL_${globalExpressionType}_${dataSource}_${label}`
}
