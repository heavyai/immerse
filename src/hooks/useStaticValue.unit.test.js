// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { renderHook } from "@testing-library/react-hooks"

import { useStaticValue } from "./useStaticValue"

/* eslint-disable react/display-name */

describe("useStaticValue test suite", () => {
  it("can useStaticValue", () => {
    const initialVal = ["a"]
    const { result, rerender } = renderHook(
      ({ staticVal }) => useStaticValue(staticVal),
      { initialProps: { staticVal: initialVal } }
    )

    expect(result.current).toBe(initialVal)
    rerender({ staticVal: ["a"] })
    expect(result.current).toBe(initialVal)

    const nextVal = ["b"]
    rerender({ staticVal: nextVal })
    expect(result.current).toBe(nextVal)
    rerender({ staticVal: nextVal })
    expect(result.current).toBe(nextVal)
  })
})
