// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { createLegacyDcEngine } = require("./index")
it("uses the injected legacy instance and returns its completion promise", () => {
  const complete = Promise.resolve("redrawn")
  const dc = {
    redrawAllAsync: jest.fn(() => complete),
    renderAllAsync: jest.fn(() => complete)
  }
  const engine = createLegacyDcEngine(dc)
  expect(engine.redraw(["fixture"])).toBe(complete)
  expect(dc.redrawAllAsync).toHaveBeenCalledWith(["fixture"])
  expect(engine.render()).toBe(complete)
})
