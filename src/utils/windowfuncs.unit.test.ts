// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getWindowFunctions } from "./windowfuncs"

describe("getWindowFunctions", () => {
  test("no window functions", () => {
    expect(getWindowFunctions("col_dict_text1")).toHaveLength(0)
  })

  test("one window function", () => {
    expect(
      getWindowFunctions(
        "lag(avg(col_integer_1)) over (order by col_dict_text1)"
      )
    ).toHaveLength(1)
  })

  test("two window functions", () => {
    expect(
      getWindowFunctions(
        "lag(avg(col_integer_1)) over (order by col_dict_text1), lag(avg(col_float_1)) over (order by col_dict_text1)"
      )
    ).toHaveLength(2)
  })

  test("over in a string", () => {
    expect(
      getWindowFunctions("col_integer_1 as 'over(threshold)'")
    ).toHaveLength(0)
  })

  test("window func + over in a string", () => {
    expect(
      getWindowFunctions(
        "lag(avg(col_integer_1)) over (order by col_dict_text1), col_integer_1 as 'over(threshold)'"
      )
    ).toHaveLength(1)
  })

  test("window func + over in a string, part 2", () => {
    expect(
      getWindowFunctions(
        "col_integer_1 as 'over(threshold)', lag(avg(col_integer_1)) over (order by col_dict_text1)"
      )
    ).toHaveLength(1)
  })
})
