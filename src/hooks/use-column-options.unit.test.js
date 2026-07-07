// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Services from "services/immerse"
import { renderHookWithStore } from "jest/renderScaffolding"
import { useColumnOptions } from "./use-column-options"

Services.set("DbCon", {
  getFieldsAsync: () =>
    Promise.resolve({
      columns: [
        {
          table: "flights_donotmodify",
          type: "fetched type",
          column: "fetched column",
          name: "fetched column"
        }
      ]
    })
})

let defaultState

describe("useColumnOptions", () => {
  beforeEach(() => {
    defaultState = {
      dashboard: {
        dataSources: {
          flights_donotmodify: {
            columnMetadata: [
              {
                table: "flights_donotmodify",
                value: "stored value",
                type: "SMALLINT"
              }
            ]
          }
        }
      }
    }
  })

  it("Returns stored metadata if it exists", async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useColumnOptions("flights_donotmodify"),
      {
        initialState: defaultState
      }
    )

    await waitForNextUpdate()

    expect(result.current).toMatchObject([
      {
        table: "flights_donotmodify",
        value: "stored value"
      }
    ])
  })

  it("Fetches metadata if none is stored", async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useColumnOptions("flights_donotmodify"),
      {
        dashboard: {}
      }
    )

    await waitForNextUpdate()

    expect(result.current).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: "flights_donotmodify",
          type: "fetched type",
          column: "fetched column",
          name: "fetched column"
        })
      ])
    )
  })

  it("Does not return columns from other sources", async () => {
    defaultState.dataSources = {
      ...defaultState.dataSources,
      flights_notamatch: {
        columnMetadata: [
          {
            table: "flights_notamatch",
            value: "not this"
          }
        ]
      }
    }

    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useColumnOptions("flights_donotmodify"),
      {
        initialState: defaultState
      }
    )

    await waitForNextUpdate()

    expect(result.current).toMatchObject([
      {
        table: "flights_donotmodify",
        value: "stored value"
      }
    ])
  })

  it("Returns only columns with the same type as resetValue", async () => {
    defaultState.dashboard.dataSources.flights_donotmodify.columnMetadata.push(
      {
        table: "flights_donotmodify",
        value: "str_value",
        type: "STR"
      },
      {
        table: "flights_donotmodify",
        value: "another int val",
        type: "SMALLINT"
      }
    )

    const { result, waitForNextUpdate } = renderHookWithStore(
      () =>
        useColumnOptions("flights_donotmodify", {
          resetValue: "stored value"
        }),
      {
        initialState: defaultState
      }
    )

    await waitForNextUpdate()

    expect(result.current).toMatchObject([
      {
        table: "flights_donotmodify",
        value: "another int val",
        type: "SMALLINT"
      },
      {
        table: "flights_donotmodify",
        value: "stored value",
        type: "SMALLINT"
      }
    ])
  })
})
