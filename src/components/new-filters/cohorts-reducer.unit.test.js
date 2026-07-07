// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from "lodash"

import cohortReducer from "components/new-filters/cohorts-reducer"
import * as actions from "components/new-filters/cohorts-action-creators"

const defaultStore = {
  cohort_1: {
    id: "cohort_1",
    dataSource: "ds_1",
    dimension: "dim_1",
    filter: { filter: "f1" },
    name: "cohort_1 name"
  },
  cohort_2: {
    id: "cohort_2",
    dataSource: "ds_2",
    dimension: "dim_2",
    filter: { filter: "f2" },
    name: "cohort_2 name"
  }
}

const defaultStoreCopy = cloneDeep(defaultStore)

describe("cohort reducer", () => {
  /* it("should add a cohort to the store", () => {
    const newCohort = {
      id: "cohort_3",
      dataSource: "ds_3",
      dimension: "dim_3",
      filter: { filter: "f3" },
      name: "cohort_3 name"
    }

    const newStore = {
      ...defaultStore,
      cohort_3: newCohort
    }

    const addCohortAction = actions.addCohort(newCohort)

    expect(cohortReducer(defaultStore, addCohortAction)).toEqual(newStore)
    expect(defaultStore).toEqual(defaultStoreCopy)
  }) */

  it("should rename a cohort in the store", () => {
    const test_id = "cohort_1"
    const newName = "cohort_1 name updated"

    const newStore = {
      ...defaultStore,
      [test_id]: {
        ...defaultStore.cohort_1,
        name: newName
      }
    }

    const renameCohortAction = actions.renameCohort(test_id, newName)

    expect(cohortReducer(defaultStore, renameCohortAction)).toEqual(newStore)
    expect(defaultStore).toEqual(defaultStoreCopy)
  })

  it("should delete a cohort in the store", () => {
    const test_id = "cohort_1"

    const newStore = {
      cohort_2: defaultStore.cohort_2
    }

    const deleteCohortAction = actions.deleteCohort(test_id)

    expect(cohortReducer(defaultStore, deleteCohortAction)).toEqual(newStore)
    expect(defaultStore).toEqual(defaultStoreCopy)
  })

  it("should delete all cohorts in the store", () => {
    const newStore = {}

    const deleteAllCohortsAction = actions.deleteAllCohorts()

    expect(cohortReducer(defaultStore, deleteAllCohortsAction)).toEqual(
      newStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
})
