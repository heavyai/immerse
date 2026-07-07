// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Supported join types
 */
export enum JoinType {
  LEFT = "LEFT",
  INNER = "INNER",
  GEO_INTERSECTS = "GEO_INTERSECTS",
  GEO_PROXIMITY = "GEO_PROXIMITY"
}

/**
 * When join data source is created it may not have an ID, and a parameter
 * will be assigned after creation. This describes the action payload to
 * create a join data source
 */
export type JoinDataSourceCreate = {
  name: string
  joins: JoinCreate[]
  parameter?: string
  id?: string
}

/**
 * A JoinDataSource describes the data source which joins tables. It can
 * contain multiple Join objects in the case of >2 tables being joined.
 */
export type JoinDataSource = JoinDataSourceCreate & {
  id: string
  joins: Join[]
}

/**
 * A join data source update will contain any or all fields from the data source
 * but shouldn't be updating the ID
 */
export type JoinDataSourceUpdate = Partial<JoinDataSourceCreate>

/**
 * Joins will be created without an ID, which will be assigned before
 * saving to state. This will describe the action payload to create a join
 */
export type JoinCreate = {
  joinType: JoinType
  leftJoinKey: string
  rightJoinKey: string
  leftDatabase: string
  rightDatabase: string
  leftTable: string
  rightTable: string
  joinCondition?: string
}

/**
 * A Join type describes a single join between 2 tables
 */
export type Join = JoinCreate & {
  id: string
}

/**
 * Updating joins can update any/all of the fields from JoinCreate
 */
export type JoinUpdate = Partial<Join>
