// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { renderWithRedux } from "jest/renderScaffolding"
import DataSourceHeader from "./data-source-header"
import { toParameterSyntax } from "utils/parameters"
import { screen } from "@testing-library/react"

describe("<DataSourceHeader />", () => {
  describe("with joins", () => {
    let defaultProps

    beforeEach(() => {
      defaultProps = {
        dataSource: "testDataSource",
        onClick: jest.fn(),
        dataSourceFilters: [],
        toggleFiltersForDataSource: jest.fn(),
        showDashboardFilterDelete: jest.fn(),
        dashboardFilters: [],
        deleteDashboardFilters: jest.fn(),
        cohortDimension: null,
        selectedFilterSet: null,
        changeCohortDimension: jest.fn()
      }
    })
    it("should display dataSource string if no join is found", () => {
      const fakeParam = "fake-param-id"
      const fakeJoinName = "aJoinDataSource"
      defaultProps.dataSource = toParameterSyntax(fakeParam)
      renderWithRedux(<DataSourceHeader {...defaultProps} />, null, {
        joinDataSources: [
          {
            name: fakeJoinName,
            joins: [],
            parameter: fakeParam
          }
        ]
      })
      expect(screen.getByText(fakeJoinName)).toBeInTheDocument()
    })

    it("should display join name if param has associated join", () => {
      renderWithRedux(<DataSourceHeader {...defaultProps} />)
      expect(screen.getByText(defaultProps.dataSource)).toBeInTheDocument()
    })
  })
})
