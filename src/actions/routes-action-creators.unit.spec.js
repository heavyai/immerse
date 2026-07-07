// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import { navigate } from "actions/routes-action-creators"

describe("navigate", () => {
  it("should return a function", () => {
    expect(typeof navigate()).to.eql("function")
  })
})
