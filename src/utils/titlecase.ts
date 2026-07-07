// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// This is pretty much an exact copy of https://github.com/gouch/to-title-case
// which ignores articles, leaves intentional capitalization, etc. See
// https://daringfireball.net/2008/05/title_case for the library's inspo
//
// Copied here instead of using the library directly because the library
// works by modifying the String prototype
export const toSmartTitleCase = (str) => {
  const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i
  const alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/
  const wordSeparators = /([ :–—-])/

  return (
    str
      // The only modification to the original gouch code. We want to replace
      // the underscores in table and column names with spaces
      .replace(/_/g, " ")
      .split(wordSeparators)
      .map((current, index, array) => {
        if (
          /* Check for small words */
          current.search(smallWords) > -1 &&
          /* Skip first and last word */
          index !== 0 &&
          index !== array.length - 1 &&
          /* Ignore title end and subtitle start */
          array[index - 3] !== ":" &&
          array[index + 1] !== ":" &&
          /* Ignore small words that start a hyphenated phrase */
          (array[index + 1] !== "-" ||
            (array[index - 1] === "-" && array[index + 1] === "-"))
        ) {
          return current.toLowerCase()
        }

        /* Ignore intentional capitalization */
        if (current.substr(1).search(/[A-Z]|\../) > -1) {
          return current
        }

        /* Ignore URLs */
        if (array[index + 1] === ":" && array[index + 2] !== "") {
          return current
        }

        /* Capitalize the first letter */
        return current.replace(alphanumericPattern, (match) =>
          match.toUpperCase()
        )
      })
      .join("")
  )
}
