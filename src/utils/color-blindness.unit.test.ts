// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { simulateColorBlindness } from "./color-blindness"

describe("simulateColorBlindness", () => {
  it("simulates supported color vision deficiencies", () => {
    expect(simulateColorBlindness("#ff0000", "protanopia")).toBe("#2b2b00")
    expect(simulateColorBlindness("#ff0000", "deuteranopia")).toBe("#545400")
    expect(simulateColorBlindness("#ff0000", "tritanopia")).toBe("#ff0000")
  })

  it("supports three-digit hex colors", () => {
    expect(simulateColorBlindness("#f00", "protanopia")).toBe("#2b2b00")
  })

  it("supports CSS color names", () => {
    expect(simulateColorBlindness("red", "protanopia")).toBe("#2b2b00")
  })

  it("leaves invalid colors unchanged", () => {
    expect(simulateColorBlindness("invalid", "protanopia")).toBe("invalid")
  })
})
