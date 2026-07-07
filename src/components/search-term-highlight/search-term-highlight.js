// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { NEGATIVE_ONE } from "constants/magic-variables"

SearchTermHighlight.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  searchIndex: PropTypes.number,
  searchStr: PropTypes.string,
  splitStr: PropTypes.arrayOf(PropTypes.string),
  term: PropTypes.string
}

export default function SearchTermHighlight({ id, name, term }) {
  if (!term.length) {
    return (
      <span title={name} id={id || "search-name"}>
        {name}
      </span>
    )
  }

  const searchIndex = name.toLowerCase().indexOf(term.toLowerCase())

  if (searchIndex > NEGATIVE_ONE) {
    return (
      <span>
        {getSubstrings(name, term).map(
          ({ text, spanClass, ariaLabel }, index) => (
            <span aria-label={ariaLabel} className={spanClass} key={index}>
              {text}
            </span>
          )
        )}
      </span>
    )
  }

  return (
    <span title={name} id={id || "search-name"}>
      {name}
    </span>
  )
}

export function getSubstrings(name, term) {
  const substrings = []
  const highlightedSpanClass = "search-term-highlight"
  const termLowerCase = term.toLowerCase()
  const nameLowerCase = name.toLowerCase()
  let searchIndex = nameLowerCase.indexOf(termLowerCase)
  let substringStartIndex = 0

  function pushSubstring(start, end, spanClass = null, ariaLabel = null) {
    if (start !== end) {
      const text = name.slice(start, end)
      substrings.push({ text, spanClass, ariaLabel })
    }
  }

  while (substringStartIndex < name.length) {
    searchIndex = nameLowerCase.indexOf(termLowerCase, substringStartIndex)
    if (searchIndex > NEGATIVE_ONE) {
      pushSubstring(substringStartIndex, searchIndex)
      pushSubstring(
        searchIndex,
        searchIndex + term.length,
        highlightedSpanClass,
        "search-term-highlight"
      )
      substringStartIndex = searchIndex + term.length
    } else {
      pushSubstring(substringStartIndex, name.length)
      substringStartIndex = name.length
    }
  }

  return substrings
}
