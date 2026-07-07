// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { JoinType } from "./join-manager-types"
import {
  getFullColumnName,
  getTablesForDataSource,
  getTablesFromJoinDataSource
} from "./utils"
import { importableStore as store } from "store/importableStore"

describe("Join Manager Utils", () => {
  describe("getFullColumnName", () => {
    let column

    beforeEach(() => {
      column = {
        parameter: false,
        label: "column_name",
        is_join: false,
        table: "test_table"
      }
    })
    it("should use column label as default if not a join", () => {
      expect(getFullColumnName(column)).toBe(column.label)
    })
    it("should use columnKey if passed in", () => {
      const alternateLabel = "otherLabel"
      const alternateValue = "Some other key"
      column[alternateLabel] = alternateValue
      expect(getFullColumnName(column, alternateLabel)).toBe(alternateValue)
    })
    it("should fallback to label if key doesnt exist", () => {
      const alternateLabel = "otherLabel"
      expect(getFullColumnName(column, alternateLabel)).toBe(column.label)
    })
    it("should use table.column when is_join is true", () => {
      column.is_join = true
      expect(getFullColumnName(column)).toBe("test_table.column_name")
    })
    it("should use columnKey attribute when is_join AND param are true", () => {
      column.parameter = true
      column.is_join = true
      expect(getFullColumnName(column)).toBe(column.label)
    })
    it("should return blank if no column provided", () => {
      expect(getFullColumnName(null)).toBe("")
    })
  })
  describe("getTablesFromJoinDataSource", () => {
    let joinDataSource
    beforeEach(() => {
      joinDataSource = {
        joins: [
          {
            joinType: JoinType.INNER,
            leftJoinKey: "ljk",
            rightJoinKey: "rjk",
            leftDatabase: "ldb",
            rightDatabase: "rdb",
            leftTable: "lt",
            rightTable: "rt"
          }
        ],
        name: "test-join-1",
        parameter: "fake-param-name",
        id: "-12345"
      }
    })
    it("should return empty array if joinDataSource is not provided", () => {
      const tables = getTablesFromJoinDataSource()
      expect(tables.length).toBe(0)
    })
    it("should return all tables in a 2 table join", () => {
      const tables = getTablesFromJoinDataSource(joinDataSource)
      expect(tables.length).toBe(2)
      expect(tables).toEqual(expect.arrayContaining(["lt", "rt"]))
    })
    it("should work when a join datasource has > 1 join", () => {
      joinDataSource.joins.push({
        joinType: JoinType.INNER,
        leftJoinKey: "rjk",
        rightJoinKey: "rrjk",
        leftDatabase: "rdb",
        rightDatabase: "rrdb",
        leftTable: "rt",
        rightTable: "rrt"
      })
      const tables = getTablesFromJoinDataSource(joinDataSource)
      expect(tables.length).toBe(3)
      expect(tables).toEqual(expect.arrayContaining(["lt", "rt", "rrt"]))
    })
  })
  describe("getTablesForDataSource", () => {
    let getStateSpy
    let joinDataSource
    beforeEach(() => {
      joinDataSource = {
        joins: [
          {
            joinType: JoinType.INNER,
            leftJoinKey: "ljk",
            rightJoinKey: "rjk",
            leftDatabase: "ldb",
            rightDatabase: "rdb",
            leftTable: "lt",
            rightTable: "rt"
          }
        ],
        name: "test-join-1",
        parameter: "fake-param-name",
        id: "-12345"
      }
      getStateSpy = jest.spyOn(store, "getState").mockReturnValue({
        joinDataSources: [joinDataSource]
      })
    })
    it("should return an array with only datasource if it is not a join", () => {
      const otherTable = "other_table_name"
      expect(getTablesForDataSource(otherTable)).toEqual([otherTable])
    })
    it("should return all tables in join datasource if found", () => {
      expect(getTablesForDataSource("fake-param-name")).toEqual(
        expect.arrayContaining(["lt", "rt"])
      )
    })
    it("should return all tables when join has > 2 tables", () => {
      joinDataSource.joins.push({
        joinType: JoinType.INNER,
        leftJoinKey: "rjk",
        rightJoinKey: "rrjk",
        leftDatabase: "rdb",
        rightDatabase: "rrdb",
        leftTable: "rt",
        rightTable: "rrt"
      })
      getStateSpy.mockReturnValue({ joinDataSources: [joinDataSource] })

      expect(getTablesForDataSource("fake-param-name")).toEqual(
        expect.arrayContaining(["lt", "rt", "rrt"])
      )
    })
  })
})
