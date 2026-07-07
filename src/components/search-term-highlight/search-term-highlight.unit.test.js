// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen } from "@testing-library/react"
import SearchTermHighlight, { getSubstrings } from "./search-term-highlight"

describe("SearchTermHighlight sub-component", () => {
  test("should wrap the matching term in a highlight span", () => {
    const name = "ABCDEFG"
    const term = "CD"
    render(<SearchTermHighlight name={name} term={term} />)
    expect(screen.getByLabelText("search-term-highlight").textContent).toBe(
      term
    )
  })

  test("when no term matches should just return the name wrapped in a span", () => {
    const name = "TEST"
    render(<SearchTermHighlight name={name} term={""} />)
    expect(screen.getByText(name)).toBeTruthy()
  })

  test("should break name into correct num of substrings when search term occurs more than once", () => {
    const name = "one test two tests three tests"
    const term = "test"
    expect(getSubstrings(name, term)).toHaveLength(7)
  })

  test("should return original capitalization of substring", () => {
    const name = "TEST"
    const term = "test"
    expect(getSubstrings(name, term)[0].text).toBe(name)
  })

  test("should return the correct classname for a substring matching search term", () => {
    const highlightClass = "search-term-highlight"
    const name = "test"
    const term = "test"
    expect(getSubstrings(name, term)[0].spanClass).toBe(highlightClass)
  })

  test("should not break name into substrings when term is not found", () => {
    const name = "not found"
    const term = "x"
    expect(getSubstrings(name, term)).toHaveLength(1)
  })
})
