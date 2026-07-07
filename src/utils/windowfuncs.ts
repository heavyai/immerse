// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Attempts to find window functions in sql
 * @param sql Some sql to parse
 * @returns an array of Regex match objects. The `index` property can be used
 * to find the position of the `over()` clause in the sql.
 */
export function getWindowFunctions(sql: string) {
  const windowfuncs = [...sql.matchAll(/over\s*\(/gi)]
  if (windowfuncs.length > 0) {
    // Parsing sql is messy... throw out anything that matched the regex but is
    // actually contained inside a string
    let stringStart = null
    let idx = 0
    for (let i = 0; i < sql.length; i++) {
      if (stringStart === null) {
        if (
          (sql[i] === '"' || sql[i] === "'") &&
          (i === 0 || sql[i - 1] !== "\\")
        ) {
          // beginning of a string has been found
          stringStart = i

          // any window funcs before the beginning of this string are safe
          while (idx < windowfuncs.length && windowfuncs[idx].index < i) {
            idx++
          }
          if (idx >= windowfuncs.length) {
            break
          }
        }
      } else if (sql[i] === sql[stringStart]) {
        if (i + 1 < sql.length && sql[i + 1] === sql[stringStart]) {
          // skip over two adjascent quote characters
          i++
        } else if (sql[i - 1] !== "\\") {
          // end of string found
          let remove = 0
          while (
            idx + remove < windowfuncs.length &&
            windowfuncs[idx + remove].index > stringStart &&
            windowfuncs[idx + remove].index < i
          ) {
            remove++
          }
          if (remove > 0) {
            windowfuncs.splice(idx, remove)
            if (idx >= windowfuncs.length) {
              break
            }
          }
          stringStart = null
        }
      }
    }
  }
  return windowfuncs
}
