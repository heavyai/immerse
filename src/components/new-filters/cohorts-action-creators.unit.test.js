// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as actions from "components/new-filters/cohorts-action-creators"

describe("cohort actions", () => {
  /* it("should create an ADD_COHORT action", () => {
    const cohort = {
      dataSource: "test datasource",
      dimension: "test dimension",
      filter: "test filter",
      name: "test name",
      id: "test_id"
    }

    const expectedAction = {
      type: actions.ADD_COHORT,
      payload: cohort
    }

    expect(actions.addCohort(cohort)).toEqual(expectedAction)
  }) */

  it("should create a RENAME_COHORT action", () => {
    const id = "test_id"
    const name = "new_name"
    const expectedAction = {
      type: actions.RENAME_COHORT,
      payload: {
        id,
        newName: name
      }
    }

    expect(actions.renameCohort(id, name)).toEqual(expectedAction)
  })

  it("should create a DELETE_COHORT action", () => {
    const id = "test_id"
    const expectedAction = {
      type: actions.DELETE_COHORT,
      payload: {
        id
      }
    }

    expect(actions.deleteCohort(id)).toEqual(expectedAction)
  })

  it("should create a DELETE_ALL_COHORTS action", () => {
    const expectedAction = {
      type: actions.DELETE_ALL_COHORTS
    }

    expect(actions.deleteAllCohorts()).toEqual(expectedAction)
  })
})
