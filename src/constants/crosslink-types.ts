// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Mapping of a column from data source A to B */
export type ColumnMap = {
  /** Column from sourceA */
  columnA: string

  /** Column from sourceB */
  columnB: string

  /** If true, filters on this column will be built as a cohort */
  cohort?: boolean
}

/** Links columns between two data sources */
export type CrossLink = {
  /** A dashboard-unique identifier */
  id: string

  /** Whether or not this crosslink is enabled */
  enabled: boolean

  /** First data source */
  sourceA: string

  /** Second data source */
  sourceB: string

  /** Mapping of source columns to destination columns */
  columnLinks: ColumnMap[]
}
