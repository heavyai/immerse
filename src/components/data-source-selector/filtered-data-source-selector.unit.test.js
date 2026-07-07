// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  mapStateToProps,
  mapDispatchToProps
} from "./filtered-data-source-selector"

const dataSourceFilterFunc = (table) => table.type === 1

describe("FilteredDataSourceSelector", () => {
  const state = {
    dashboard: {
      dataSources: { flights: true, tweets: true }
    },
    tables: {
      listWithMeta: [
        { name: "flights", type: 1 },
        { name: "tweets", type: 2 },
        { name: "contribs", type: 1 }
      ]
    }
  }

  it("mapStateToProps should filter tables by dataSourceFilterFunc", () => {
    const props = mapStateToProps(state, { dataSourceFilterFunc })

    expect(props.tables).toEqual([
      { label: "flights", value: "flights" },
      { label: "contribs", value: "contribs" }
    ])
  })

  it("mapDispatchToProps should expose expected callbacks", () => {
    const dispatch = jest.fn()
    const props = mapDispatchToProps(dispatch)

    expect(typeof props.getTables).toBe("function")
  })
})
