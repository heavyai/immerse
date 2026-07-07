// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const {
  joinDataSourceCreated,
  joinCreated,
  joinDataSourceUpdated,
  joinUpdated,
  joinDataSourceDeleted,
  joinDeleted
} = require("components/join-manager/join-manager-actions")
const { JoinType } = require("components/join-manager/join-manager-types")
const { joinDataSourcesReducer } = require("./join-reducer")

describe("Join Reducer", () => {
  const testJoin = {
    joinType: JoinType.INNER,
    leftJoinKey: "tail_num",
    rightJoinKey: "tail_num",
    leftTable: "flights_no_tail_number_data",
    rightTable: "flights_tail_number_reference",
    leftDatabase: "mapd",
    rightDatabase: "mapd"
  }
  it("should create a new join data source", () => {
    const state = []
    const dataSource = {
      name: `Join 1`,
      joins: []
    }
    const action = joinDataSourceCreated(dataSource)
    const newState = joinDataSourcesReducer(state, action)
    const newJoinDataSource = newState[0]
    expect(newJoinDataSource.name).toBe(dataSource.name)
    expect(newJoinDataSource.joins).toHaveLength(0)
  })

  it("should create ids for joins when created as part of a datasource", () => {
    const state = []
    const action = joinDataSourceCreated({
      name: `Join 1`,
      joins: [testJoin]
    })
    const newState = joinDataSourcesReducer(state, action)
    const newJoinDataSource = newState[0]
    expect(newJoinDataSource.id).toBeDefined()
    expect(newJoinDataSource.joins).toHaveLength(1)
    expect(newJoinDataSource.joins[0].id).toBeDefined()
  })

  it("should create a join within a datasource", () => {
    const state = []
    const dataSource = {
      name: `Join 1`,
      joins: []
    }
    const action = joinDataSourceCreated(dataSource)
    let newState = joinDataSourcesReducer(state, action)
    expect(newState).toHaveLength(1)
    expect(newState[0].name).toBe(dataSource.name)
    expect(newState[0].id).toBeDefined()
    expect(newState[0].joins).toHaveLength(0)

    const addJoinAction = joinCreated(newState[0].id, testJoin)

    newState = joinDataSourcesReducer(newState, addJoinAction)
    expect(newState[0].joins).toHaveLength(1)
  })

  it("should update a join data source", () => {
    const state = []
    const action = joinDataSourceCreated({
      name: `Join 1`,
      joins: [testJoin]
    })
    let newState = joinDataSourcesReducer(state, action)
    const newJoinDataSource = newState[0]
    expect(newJoinDataSource.id).toBeDefined()
    expect(newJoinDataSource.joins).toHaveLength(1)
    expect(newJoinDataSource.joins[0].id).toBeDefined()

    const newName = "New Name!"
    const updateAction = joinDataSourceUpdated(newJoinDataSource.id, {
      name: newName
    })
    newState = joinDataSourcesReducer(newState, updateAction)
    expect(newState[0].name).toEqual(newName)
  })

  it("should update a single join", () => {
    const state = []
    const action = joinDataSourceCreated({
      name: `Join 1`,
      joins: [testJoin]
    })
    let newState = joinDataSourcesReducer(state, action)
    const newJoinDataSource = newState[0]
    expect(newJoinDataSource.id).toBeDefined()
    expect(newJoinDataSource.joins).toHaveLength(1)

    const newJoin = newJoinDataSource.joins[0]
    expect(newJoinDataSource.joins[0].id).toBeDefined()

    const updateAction = joinUpdated(newJoinDataSource.id, newJoin.id, {
      joinType: JoinType.LEFT
    })
    newState = joinDataSourcesReducer(newState, updateAction)
    expect(newState[0].joins[0].joinType).toEqual(JoinType.LEFT)
  })

  it("should delete join data source", () => {
    const state = []
    const dataSource = {
      name: `Join 1`,
      joins: []
    }
    const action = joinDataSourceCreated(dataSource)
    let newState = joinDataSourcesReducer(state, action)
    expect(newState).toHaveLength(1)

    const deleteAction = joinDataSourceDeleted(newState[0].id)
    newState = joinDataSourcesReducer(newState, deleteAction)

    expect(newState).toHaveLength(0)
  })

  it("should delete a single join", () => {
    const state = []
    const action = joinDataSourceCreated({
      name: `Join 1`,
      joins: [testJoin]
    })
    let newState = joinDataSourcesReducer(state, action)
    expect(newState).toHaveLength(1)
    expect(newState[0].joins).toHaveLength(1)

    const deleteJoinAction = joinDeleted(
      newState[0].id,
      newState[0].joins[0].id
    )
    newState = joinDataSourcesReducer(newState, deleteJoinAction)
    expect(newState).toHaveLength(1)
    expect(newState[0].joins).toHaveLength(0)
  })
})
