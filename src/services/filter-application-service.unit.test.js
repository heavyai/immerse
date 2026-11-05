// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createFilterApplicationService } from "./filter-application-service"

it("commits canonical filter state once, redraws affected tables and notifies once", async () => {
  const action = () => ({ type: "canonical" })
  const actions = { setCrossFilter: jest.fn(action) }
  const redraw = jest.fn().mockResolvedValue()
  const notify = jest.fn()
  const service = createFilterApplicationService(actions, {
    redraw,
    notify,
    createId: () => "new-filter",
    getTables: (filter) => new Set([filter.table])
  })
  const state = { omnifilters: [] }
  const dispatch = jest.fn()
  await service.setCrossFilter({ table: "sales" }, "1")(dispatch, () => state)
  expect(actions.setCrossFilter).toHaveBeenCalledWith(
    { table: "sales" },
    "1",
    undefined,
    "new-filter"
  )
  expect(dispatch).toHaveBeenCalledTimes(1)
  expect(redraw.mock.calls[0][2]).toEqual(new Set(["sales"]))
  expect(notify).toHaveBeenCalledTimes(1)
})
it("keeps disabled dashboard filter state and existing notification policy", async () => {
  const actions = {
    setDashboardFilter: jest.fn(() => ({ type: "canonical" })),
    toggleFilterByName: jest.fn(() => ({ type: "toggle" }))
  }
  const notify = jest.fn()
  const redraw = jest.fn().mockResolvedValue()
  const service = createFilterApplicationService(actions, {
    redraw,
    notify,
    getTables: () => new Set(["sales"])
  })
  const state = {
    omnifilters: [{ name: "f", enabled: false, filter: { table: "sales" } }]
  }
  await service.setDashboardFilter({}, "f")(jest.fn(), () => state)
  expect(actions.setDashboardFilter.mock.calls[0][4]).toBe(false)
  expect(notify).toHaveBeenCalledTimes(1)
  await service.toggleFilterByName("f")(jest.fn(), () => state)
  expect(notify).toHaveBeenCalledTimes(1)
})
