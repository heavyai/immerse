// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { joinDataSourceToSQL } = require("./join-manager-thunks")

describe("joinDataSourceToSQL()", () => {
  it("should return blank string if no join data source", () => {
    const sql = joinDataSourceToSQL()
    expect(sql).toBe("")
  })

  it("should return valid join sql if join data source exists", () => {
    const testJoin = {
      leftTable: "lt",
      rightTable: "rt",
      leftDatabase: "ldb",
      rightDatabase: "rdb",
      leftJoinKey: "ljk",
      rightJoinKey: "rjk",
      joinType: "LEFT"
    }
    let sql = joinDataSourceToSQL({
      joins: [testJoin]
    })
    expect(sql).toBe('"lt" LEFT JOIN "rt" ON ("lt"."ljk" = "rt"."rjk")')

    testJoin.joinType = "INNER"
    sql = joinDataSourceToSQL({
      joins: [testJoin]
    })
    expect(sql).toBe('"lt" INNER JOIN "rt" ON ("lt"."ljk" = "rt"."rjk")')
  })
})
