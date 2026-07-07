// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { screen } from "@testing-library/react"
import React from "react"
const { renderWithRedux } = require("jest/renderScaffolding")
const { JoinManagerModal } = require("./join-manager-modal")

describe("<JoinManagerModal />", () => {
  const joinManagerProps = {
    joinDefinition: {
      name: "a-real-join-name",
      id: "-NPwv_Xr37EBWZG4QzQA",
      joins: [
        {
          joinType: "INNER",
          leftJoinKey: "tmID",
          rightJoinKey: "tmID",
          leftTable: "Teams",
          rightTable: "TeamVsTeam",
          leftDatabase: "heavyai",
          rightDatabase: "heavyai",
          id: "-NPwv_XsIjfEbWB6vzC0"
        }
      ],
      parameter: "-NPwv_Xr37EBWZG4QzQA"
    }
  }

  const initialState = {
    connection: {
      sessionInfo: {
        database: "heavyai"
      }
    },
    ui: {
      joinManagerProps: {}
    }
  }

  it("should show create text when creating a join data source", () => {
    renderWithRedux(<JoinManagerModal />, null, initialState)
    expect(screen.getByTestId("join-manager-modal-title")).toHaveTextContent(
      "Create a New Join"
    )
    expect(
      screen.getByTestId("join-manager-modal-primary-action")
    ).toHaveTextContent("Create Join")
  })

  it("should show update text when editing a join data source", () => {
    renderWithRedux(<JoinManagerModal />, null, {
      ...initialState,
      ui: {
        joinManagerProps
      }
    })
    expect(screen.getByTestId("join-manager-modal-title")).toHaveTextContent(
      "Update Join"
    )
    expect(
      screen.getByTestId("join-manager-modal-primary-action")
    ).toHaveTextContent("Update Join")
    expect(screen.getByTestId("join-manager-name-input").value).toEqual(
      joinManagerProps.joinDefinition.name
    )
  })
})
