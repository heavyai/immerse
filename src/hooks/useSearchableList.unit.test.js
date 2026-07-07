// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { renderHook } from "@testing-library/react-hooks"
import { act } from "react-test-renderer"
import { useSearchableList } from "./useSearchableList"

describe("<RolesSettings />", () => {
  const list = [
    { label: "labelA", value: "valueA", extra: "foo" },
    { label: "labelB", value: "valueB", extra: "bar" },
    { label: "labelC", value: ["val0", "val1"], extra: "baz" }
  ]

  test("should filter list", () => {
    const { result } = renderHook(() => useSearchableList(list, ["value"]))
    act(() => result.current.setSearchTerm("b"))
    expect(result.current.filteredList).toEqual([list[1]])
  })

  test("should only filter on searchableProperties", () => {
    const { result } = renderHook(() => useSearchableList(list, ["extra"]))
    act(() => result.current.setSearchTerm("value"))
    expect(result.current.filteredList).toEqual([])
  })

  test("should search string arrays", () => {
    const { result } = renderHook(() => useSearchableList(list, ["value"]))
    act(() => result.current.setSearchTerm("val"))
    expect(result.current.filteredList).toEqual(list)
  })
})
