// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import toProperCase from "./to-proper-case"

describe("toProperCase", () => {
  it("should convert a string to uppercase", () => {
    expect(toProperCase("something")).toBe("Something")
    expect(toProperCase("something cool")).toBe("Something Cool")
  })
})
