// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import sql from "./sql-tag"

describe("select", () => {
  test("with empty parameters", () => {
    expect(sql.select()).toBe("")
  })

  test("with single empty string parameter", () => {
    expect(sql.select("")).toBe("")
  })

  test("with single empty array parameter", () => {
    expect(sql.select([])).toBe("")
  })

  test("with single parameter", () => {
    expect(sql.select("red")).toBe("SELECT red")
  })

  test("with single array parameter", () => {
    expect(sql.select(["red"])).toBe("SELECT red")
  })

  test("with multiple parameters", () => {
    expect(sql.select("red", "blue", "green")).toBe("SELECT red, blue, green")
  })

  test("with multi-element array parameter", () => {
    expect(sql.select(["red", "blue", "green"])).toBe("SELECT red, blue, green")
  })

  test("with mixed parameters", () => {
    expect(sql.select(["red"], "blue", "green")).toBe("SELECT red, blue, green")
    expect(sql.select("red", ["blue"], "green")).toBe("SELECT red, blue, green")
    expect(sql.select("red", "blue", ["green"])).toBe("SELECT red, blue, green")
    expect(sql.select(["red", "blue"], "green")).toBe("SELECT red, blue, green")
    expect(sql.select("red", ["blue", "green"])).toBe("SELECT red, blue, green")
    expect(sql.select(["red", "blue"], ["green"])).toBe(
      "SELECT red, blue, green"
    )
    expect(sql.select(["red"], ["blue", "green"])).toBe(
      "SELECT red, blue, green"
    )
    expect(sql.select(["red"], ["blue"], ["green"])).toBe(
      "SELECT red, blue, green"
    )
    expect(sql.select(["red", "blue"], ["green", "yellow"])).toBe(
      "SELECT red, blue, green, yellow"
    )
  })

  test("with an empty array parameter", () => {
    expect(sql.select("red", [])).toBe("SELECT red")
    expect(sql.select([], "red")).toBe("SELECT red")
    expect(sql.select(["red"], [])).toBe("SELECT red")
    expect(sql.select([], ["red"])).toBe("SELECT red")
  })

  test("with an empty string parameter", () => {
    expect(sql.select("red", "")).toBe("SELECT red")
    expect(sql.select("", "red")).toBe("SELECT red")
    expect(sql.select(["red"], "")).toBe("SELECT red")
    expect(sql.select("", ["red"])).toBe("SELECT red")
  })

  test("with an empty string parameter inside an array", () => {
    expect(sql.select("red", [""])).toBe("SELECT red")
    expect(sql.select([""], "red")).toBe("SELECT red")
    expect(sql.select(["red"], [""])).toBe("SELECT red")
    expect(sql.select([""], ["red"])).toBe("SELECT red")
  })

  test("with multiple empty array parameters", () => {
    expect(sql.select([], [], "red")).toBe("SELECT red")
    expect(sql.select([], "red", [])).toBe("SELECT red")
    expect(sql.select("red", [], [])).toBe("SELECT red")
    expect(sql.select([], [], ["red"])).toBe("SELECT red")
    expect(sql.select([], ["red"], [])).toBe("SELECT red")
    expect(sql.select(["red"], [], [])).toBe("SELECT red")
  })

  test("with multiple empty string parameters", () => {
    expect(sql.select("", "", "red")).toBe("SELECT red")
    expect(sql.select("", "red", "")).toBe("SELECT red")
    expect(sql.select("red", "", "")).toBe("SELECT red")
    expect(sql.select("", "", ["red"])).toBe("SELECT red")
    expect(sql.select("", ["red"], "")).toBe("SELECT red")
    expect(sql.select(["red"], "", "")).toBe("SELECT red")
  })

  test("with parameters having extra whitespace", () => {
    expect(sql.select([" red"], "blue ", ["green", "\nyellow\t"])).toBe(
      "SELECT red, blue, green, yellow"
    )
  })

  test("with whitespace-only parameters", () => {
    expect(sql.select(["   "], "\t ", ["\n\n", ""])).toBe("")
  })
})

describe("from", () => {
  test("with empty parameters", () => {
    expect(sql.from()).toBe("")
  })

  test("with single empty string parameter", () => {
    expect(sql.from("")).toBe("")
  })

  test("with single empty array parameter", () => {
    expect(sql.from([])).toBe("")
  })

  test("with single parameter", () => {
    expect(sql.from("colors")).toBe("FROM colors")
  })

  test("with single array parameter", () => {
    expect(sql.from(["colors"])).toBe("FROM colors")
  })

  test("with multiple parameters", () => {
    expect(sql.from("redColors", "blueColors", "greenColors")).toBe(
      "FROM redColors, blueColors, greenColors"
    )
  })

  test("with multi-element array parameter", () => {
    expect(sql.from(["redColors", "blueColors", "greenColors"])).toBe(
      "FROM redColors, blueColors, greenColors"
    )
  })

  test("with mixed parameters", () => {
    expect(sql.from(["redColors"], "blueColors", "greenColors")).toBe(
      "FROM redColors, blueColors, greenColors"
    )
    expect(sql.from("redColors", ["blueColors"], "greenColors")).toBe(
      "FROM redColors, blueColors, greenColors"
    )
    expect(sql.from("redColors", "blueColors", ["greenColors"])).toBe(
      "FROM redColors, blueColors, greenColors"
    )
    expect(sql.from(["redColors", "blueColors"], "greenColors")).toBe(
      "FROM redColors, blueColors, greenColors"
    )
    expect(sql.from("redColors", ["blueColors", "greenColors"])).toBe(
      "FROM redColors, blueColors, greenColors"
    )
    expect(sql.from(["redColors", "blueColors"], ["greenColors"])).toBe(
      "FROM redColors, blueColors, greenColors"
    )
    expect(sql.from(["redColors"], ["blueColors", "greenColors"])).toBe(
      "FROM redColors, blueColors, greenColors"
    )
    expect(sql.from(["redColors"], ["blueColors"], ["greenColors"])).toBe(
      "FROM redColors, blueColors, greenColors"
    )
    expect(
      sql.from(["redColors", "blueColors"], ["greenColors", "yellowColors"])
    ).toBe("FROM redColors, blueColors, greenColors, yellowColors")
  })

  test("with an empty array parameter", () => {
    expect(sql.from("redColors", [])).toBe("FROM redColors")
    expect(sql.from([], "redColors")).toBe("FROM redColors")
    expect(sql.from(["redColors"], [])).toBe("FROM redColors")
    expect(sql.from([], ["redColors"])).toBe("FROM redColors")
  })

  test("with an empty string parameter", () => {
    expect(sql.from("redColors", "")).toBe("FROM redColors")
    expect(sql.from("", "redColors")).toBe("FROM redColors")
    expect(sql.from(["redColors"], "")).toBe("FROM redColors")
    expect(sql.from("", ["redColors"])).toBe("FROM redColors")
  })

  test("with an empty string parameter inside an array", () => {
    expect(sql.from("red", [""])).toBe("FROM red")
    expect(sql.from([""], "red")).toBe("FROM red")
    expect(sql.from(["red"], [""])).toBe("FROM red")
    expect(sql.from([""], ["red"])).toBe("FROM red")
  })

  test("with multiple empty array parameters", () => {
    expect(sql.from([], [], "redColors")).toBe("FROM redColors")
    expect(sql.from([], "redColors", [])).toBe("FROM redColors")
    expect(sql.from("redColors", [], [])).toBe("FROM redColors")
    expect(sql.from([], [], ["redColors"])).toBe("FROM redColors")
    expect(sql.from([], ["redColors"], [])).toBe("FROM redColors")
    expect(sql.from(["redColors"], [], [])).toBe("FROM redColors")
  })

  test("with multiple empty string parameters", () => {
    expect(sql.from("", "", "redColors")).toBe("FROM redColors")
    expect(sql.from("", "redColors", "")).toBe("FROM redColors")
    expect(sql.from("redColors", "", "")).toBe("FROM redColors")
    expect(sql.from("", "", ["redColors"])).toBe("FROM redColors")
    expect(sql.from("", ["redColors"], "")).toBe("FROM redColors")
    expect(sql.from(["redColors"], "", "")).toBe("FROM redColors")
  })

  test("with parameters having extra whitespace", () => {
    expect(
      sql.from([" redColors"], "blueColors ", [
        "greenColors",
        "\nyellowColors\t"
      ])
    ).toBe("FROM redColors, blueColors, greenColors, yellowColors")
  })

  test("with whitespace-only parameters", () => {
    expect(sql.from(["   "], "\t ", ["\n\n", ""])).toBe("")
  })
})

describe("group by", () => {
  test("with empty parameters", () => {
    expect(sql.groupBy()).toBe("")
  })

  test("with single empty string parameter", () => {
    expect(sql.groupBy("")).toBe("")
  })

  test("with single empty array parameter", () => {
    expect(sql.groupBy([])).toBe("")
  })

  test("with single parameter", () => {
    expect(sql.groupBy("red")).toBe("GROUP BY red")
  })

  test("with single array parameter", () => {
    expect(sql.groupBy(["red"])).toBe("GROUP BY red")
  })

  test("with multiple parameters", () => {
    expect(sql.groupBy("red", "blue", "green")).toBe(
      "GROUP BY red, blue, green"
    )
  })

  test("with multi-element array parameter", () => {
    expect(sql.groupBy(["red", "blue", "green"])).toBe(
      "GROUP BY red, blue, green"
    )
  })

  test("with mixed parameters", () => {
    expect(sql.groupBy(["red"], "blue", "green")).toBe(
      "GROUP BY red, blue, green"
    )
    expect(sql.groupBy("red", ["blue"], "green")).toBe(
      "GROUP BY red, blue, green"
    )
    expect(sql.groupBy("red", "blue", ["green"])).toBe(
      "GROUP BY red, blue, green"
    )
    expect(sql.groupBy(["red", "blue"], "green")).toBe(
      "GROUP BY red, blue, green"
    )
    expect(sql.groupBy("red", ["blue", "green"])).toBe(
      "GROUP BY red, blue, green"
    )
    expect(sql.groupBy(["red", "blue"], ["green"])).toBe(
      "GROUP BY red, blue, green"
    )
    expect(sql.groupBy(["red"], ["blue", "green"])).toBe(
      "GROUP BY red, blue, green"
    )
    expect(sql.groupBy(["red"], ["blue"], ["green"])).toBe(
      "GROUP BY red, blue, green"
    )
    expect(sql.groupBy(["red", "blue"], ["green", "yellow"])).toBe(
      "GROUP BY red, blue, green, yellow"
    )
  })

  test("with an empty array parameter", () => {
    expect(sql.groupBy("red", [])).toBe("GROUP BY red")
    expect(sql.groupBy([], "red")).toBe("GROUP BY red")
    expect(sql.groupBy(["red"], [])).toBe("GROUP BY red")
    expect(sql.groupBy([], ["red"])).toBe("GROUP BY red")
  })

  test("with an empty string parameter", () => {
    expect(sql.groupBy("red", "")).toBe("GROUP BY red")
    expect(sql.groupBy("", "red")).toBe("GROUP BY red")
    expect(sql.groupBy(["red"], "")).toBe("GROUP BY red")
    expect(sql.groupBy("", ["red"])).toBe("GROUP BY red")
  })

  test("with an empty string parameter inside an array", () => {
    expect(sql.groupBy("red", [""])).toBe("GROUP BY red")
    expect(sql.groupBy([""], "red")).toBe("GROUP BY red")
    expect(sql.groupBy(["red"], [""])).toBe("GROUP BY red")
    expect(sql.groupBy([""], ["red"])).toBe("GROUP BY red")
  })

  test("with multiple empty array parameters", () => {
    expect(sql.groupBy([], [], "red")).toBe("GROUP BY red")
    expect(sql.groupBy([], "red", [])).toBe("GROUP BY red")
    expect(sql.groupBy("red", [], [])).toBe("GROUP BY red")
    expect(sql.groupBy([], [], ["red"])).toBe("GROUP BY red")
    expect(sql.groupBy([], ["red"], [])).toBe("GROUP BY red")
    expect(sql.groupBy(["red"], [], [])).toBe("GROUP BY red")
  })

  test("with multiple empty string parameters", () => {
    expect(sql.groupBy("", "", "red")).toBe("GROUP BY red")
    expect(sql.groupBy("", "red", "")).toBe("GROUP BY red")
    expect(sql.groupBy("red", "", "")).toBe("GROUP BY red")
    expect(sql.groupBy("", "", ["red"])).toBe("GROUP BY red")
    expect(sql.groupBy("", ["red"], "")).toBe("GROUP BY red")
    expect(sql.groupBy(["red"], "", "")).toBe("GROUP BY red")
  })

  test("with parameters having extra whitespace", () => {
    expect(sql.groupBy([" red"], "blue ", ["green", "\nyellow\t"])).toBe(
      "GROUP BY red, blue, green, yellow"
    )
  })

  test("with whitespace-only parameters", () => {
    expect(sql.groupBy(["   "], "\t ", ["\n\n", ""])).toBe("")
  })
})

describe("order by", () => {
  test("with empty parameters", () => {
    expect(sql.orderBy()).toBe("")
  })

  test("with single empty string parameter", () => {
    expect(sql.orderBy("")).toBe("")
  })

  test("with single empty array parameter", () => {
    expect(sql.orderBy([])).toBe("")
  })

  test("with single parameter", () => {
    expect(sql.orderBy("red")).toBe("ORDER BY red")
  })

  test("with single array parameter", () => {
    expect(sql.orderBy(["red"])).toBe("ORDER BY red")
  })

  test("with multiple parameters", () => {
    expect(sql.orderBy("red", "blue", "green")).toBe(
      "ORDER BY red, blue, green"
    )
  })

  test("with multi-element array parameter", () => {
    expect(sql.orderBy(["red", "blue", "green"])).toBe(
      "ORDER BY red, blue, green"
    )
  })

  test("with mixed parameters", () => {
    expect(sql.orderBy(["red"], "blue", "green")).toBe(
      "ORDER BY red, blue, green"
    )
    expect(sql.orderBy("red", ["blue"], "green")).toBe(
      "ORDER BY red, blue, green"
    )
    expect(sql.orderBy("red", "blue", ["green"])).toBe(
      "ORDER BY red, blue, green"
    )
    expect(sql.orderBy(["red", "blue"], "green")).toBe(
      "ORDER BY red, blue, green"
    )
    expect(sql.orderBy("red", ["blue", "green"])).toBe(
      "ORDER BY red, blue, green"
    )
    expect(sql.orderBy(["red", "blue"], ["green"])).toBe(
      "ORDER BY red, blue, green"
    )
    expect(sql.orderBy(["red"], ["blue", "green"])).toBe(
      "ORDER BY red, blue, green"
    )
    expect(sql.orderBy(["red"], ["blue"], ["green"])).toBe(
      "ORDER BY red, blue, green"
    )
    expect(sql.orderBy(["red", "blue"], ["green", "yellow"])).toBe(
      "ORDER BY red, blue, green, yellow"
    )
  })

  test("with an empty array parameter", () => {
    expect(sql.orderBy("red", [])).toBe("ORDER BY red")
    expect(sql.orderBy([], "red")).toBe("ORDER BY red")
    expect(sql.orderBy(["red"], [])).toBe("ORDER BY red")
    expect(sql.orderBy([], ["red"])).toBe("ORDER BY red")
  })

  test("with an empty string parameter", () => {
    expect(sql.orderBy("red", "")).toBe("ORDER BY red")
    expect(sql.orderBy("", "red")).toBe("ORDER BY red")
    expect(sql.orderBy(["red"], "")).toBe("ORDER BY red")
    expect(sql.orderBy("", ["red"])).toBe("ORDER BY red")
  })

  test("with an empty string parameter inside an array", () => {
    expect(sql.orderBy("red", [""])).toBe("ORDER BY red")
    expect(sql.orderBy([""], "red")).toBe("ORDER BY red")
    expect(sql.orderBy(["red"], [""])).toBe("ORDER BY red")
    expect(sql.orderBy([""], ["red"])).toBe("ORDER BY red")
  })

  test("with multiple empty array parameters", () => {
    expect(sql.orderBy([], [], "red")).toBe("ORDER BY red")
    expect(sql.orderBy([], "red", [])).toBe("ORDER BY red")
    expect(sql.orderBy("red", [], [])).toBe("ORDER BY red")
    expect(sql.orderBy([], [], ["red"])).toBe("ORDER BY red")
    expect(sql.orderBy([], ["red"], [])).toBe("ORDER BY red")
    expect(sql.orderBy(["red"], [], [])).toBe("ORDER BY red")
  })

  test("with multiple empty string parameters", () => {
    expect(sql.orderBy("", "", "red")).toBe("ORDER BY red")
    expect(sql.orderBy("", "red", "")).toBe("ORDER BY red")
    expect(sql.orderBy("red", "", "")).toBe("ORDER BY red")
    expect(sql.orderBy("", "", ["red"])).toBe("ORDER BY red")
    expect(sql.orderBy("", ["red"], "")).toBe("ORDER BY red")
    expect(sql.orderBy(["red"], "", "")).toBe("ORDER BY red")
  })

  test("with parameters having extra whitespace", () => {
    expect(sql.orderBy([" red"], "blue ", ["green", "\nyellow\t"])).toBe(
      "ORDER BY red, blue, green, yellow"
    )
  })

  test("with whitespace-only parameters", () => {
    expect(sql.orderBy(["   "], "\t ", ["\n\n", ""])).toBe("")
  })
})

describe("where", () => {
  test("with empty parameters", () => {
    expect(sql.where()).toBe("")
  })

  test("with an empty string parameter", () => {
    expect(sql.where("")).toBe("")
  })

  test("with a nonempty string parameter", () => {
    expect(sql.where("color = 'red'")).toBe("WHERE color = 'red'")
  })

  test("with a nonempty string parameter having extra whitespace", () => {
    expect(sql.where(" color = 'red'")).toBe("WHERE color = 'red'")
    expect(sql.where("color = 'red' ")).toBe("WHERE color = 'red'")
    expect(sql.where("\ncolor = 'red'\t")).toBe("WHERE color = 'red'")
  })

  test("with a whitespace-only parameter", () => {
    expect(sql.where("  \t \n  ")).toBe("")
  })
})

describe("having", () => {
  test("with empty parameters", () => {
    expect(sql.having()).toBe("")
  })

  test("with an empty string parameter", () => {
    expect(sql.having("")).toBe("")
  })

  test("with a nonempty string parameter", () => {
    expect(sql.having("color = 'red'")).toBe("HAVING color = 'red'")
  })

  test("with a nonempty string parameter having extra whitespace", () => {
    expect(sql.having(" color = 'red'")).toBe("HAVING color = 'red'")
    expect(sql.having("color = 'red' ")).toBe("HAVING color = 'red'")
    expect(sql.having("\ncolor = 'red'\t")).toBe("HAVING color = 'red'")
  })

  test("with a whitespace-only parameter", () => {
    expect(sql.having("  \t \n  ")).toBe("")
  })
})

describe("and", () => {
  test("with empty parameters", () => {
    expect(sql.and()).toBe("")
  })

  test("with single empty string parameter", () => {
    expect(sql.and("")).toBe("")
  })

  test("with single empty array parameter", () => {
    expect(sql.and([])).toBe("")
  })

  test("with single parameter", () => {
    expect(sql.and("color = 'red'")).toBe("color = 'red'")
  })

  test("with single array parameter", () => {
    expect(sql.and(["color = 'red'"])).toBe("color = 'red'")
  })

  test("with multiple parameters", () => {
    expect(
      sql.and("color1 = 'red'", "color2 = 'blue'", "color3 = 'green'")
    ).toBe("(color1 = 'red' AND color2 = 'blue' AND color3 = 'green')")
  })

  test("with multi-element array parameter", () => {
    expect(
      sql.and(["color1 = 'red'", "color2 = 'blue'", "color3 = 'green'"])
    ).toBe("(color1 = 'red' AND color2 = 'blue' AND color3 = 'green')")
  })

  test("with mixed parameters", () => {
    expect(
      sql.and(["color1 = 'red'"], "color2 = 'blue'", "color3 = 'green'")
    ).toBe("(color1 = 'red' AND color2 = 'blue' AND color3 = 'green')")
    expect(
      sql.and("color1 = 'red'", ["color2 = 'blue'"], "color3 = 'green'")
    ).toBe("(color1 = 'red' AND color2 = 'blue' AND color3 = 'green')")
    expect(
      sql.and("color1 = 'red'", "color2 = 'blue'", ["color3 = 'green'"])
    ).toBe("(color1 = 'red' AND color2 = 'blue' AND color3 = 'green')")
    expect(
      sql.and(["color1 = 'red'", "color2 = 'blue'"], "color3 = 'green'")
    ).toBe("(color1 = 'red' AND color2 = 'blue' AND color3 = 'green')")
    expect(
      sql.and("color1 = 'red'", ["color2 = 'blue'", "color3 = 'green'"])
    ).toBe("(color1 = 'red' AND color2 = 'blue' AND color3 = 'green')")
    expect(
      sql.and(["color1 = 'red'", "color2 = 'blue'"], ["color3 = 'green'"])
    ).toBe("(color1 = 'red' AND color2 = 'blue' AND color3 = 'green')")
    expect(
      sql.and(["color1 = 'red'"], ["color2 = 'blue'", "color3 = 'green'"])
    ).toBe("(color1 = 'red' AND color2 = 'blue' AND color3 = 'green')")
    expect(
      sql.and(["color1 = 'red'"], ["color2 = 'blue'"], ["color3 = 'green'"])
    ).toBe("(color1 = 'red' AND color2 = 'blue' AND color3 = 'green')")
    expect(
      sql.and(
        ["color1 = 'red'", "color2 = 'blue'"],
        ["color3 = 'green'", "color4 = 'yellow'"]
      )
    ).toBe(
      "(color1 = 'red' AND color2 = 'blue' AND color3 = 'green' AND color4 = 'yellow')"
    )
  })

  test("with an empty array parameter", () => {
    expect(sql.and("color = 'red'", [])).toBe("color = 'red'")
    expect(sql.and([], "color = 'red'")).toBe("color = 'red'")
    expect(sql.and(["color = 'red'"], [])).toBe("color = 'red'")
    expect(sql.and([], ["color = 'red'"])).toBe("color = 'red'")
  })

  test("with an empty string parameter", () => {
    expect(sql.and("color = 'red'", "")).toBe("color = 'red'")
    expect(sql.and("", "color = 'red'")).toBe("color = 'red'")
    expect(sql.and(["color = 'red'"], "")).toBe("color = 'red'")
    expect(sql.and("", ["color = 'red'"])).toBe("color = 'red'")
  })

  test("with an empty string parameter inside an array", () => {
    expect(sql.and("color = 'red'", [""])).toBe("color = 'red'")
    expect(sql.and([""], "color = 'red'")).toBe("color = 'red'")
    expect(sql.and(["color = 'red'"], [""])).toBe("color = 'red'")
    expect(sql.and([""], ["color = 'red'"])).toBe("color = 'red'")
  })

  test("with multiple empty array parameters", () => {
    expect(sql.and([], [], "color = 'red'")).toBe("color = 'red'")
    expect(sql.and([], "color = 'red'", [])).toBe("color = 'red'")
    expect(sql.and("color = 'red'", [], [])).toBe("color = 'red'")
    expect(sql.and([], [], ["color = 'red'"])).toBe("color = 'red'")
    expect(sql.and([], ["color = 'red'"], [])).toBe("color = 'red'")
    expect(sql.and(["color = 'red'"], [], [])).toBe("color = 'red'")
  })

  test("with multiple empty string parameters", () => {
    expect(sql.and("", "", "color = 'red'")).toBe("color = 'red'")
    expect(sql.and("", "color = 'red'", "")).toBe("color = 'red'")
    expect(sql.and("color = 'red'", "", "")).toBe("color = 'red'")
    expect(sql.and("", "", ["color = 'red'"])).toBe("color = 'red'")
    expect(sql.and("", ["color = 'red'"], "")).toBe("color = 'red'")
    expect(sql.and(["color = 'red'"], "", "")).toBe("color = 'red'")
  })

  test("with parameters having extra whitespace", () => {
    expect(
      sql.and([" color1 = 'red'"], "color2 = 'blue' ", [
        "color3 = 'green'",
        "\ncolor4 = 'yellow'\t"
      ])
    ).toBe(
      "(color1 = 'red' AND color2 = 'blue' AND color3 = 'green' AND color4 = 'yellow')"
    )
  })

  test("with whitespace-only parameters", () => {
    expect(sql.and(["   "], "\t ", ["\n\n", ""])).toBe("")
  })
})

describe("or", () => {
  test("with empty parameters", () => {
    expect(sql.or()).toBe("")
  })

  test("with single empty string parameter", () => {
    expect(sql.or("")).toBe("")
  })

  test("with single empty array parameter", () => {
    expect(sql.or([])).toBe("")
  })

  test("with single parameter", () => {
    expect(sql.or("color = 'red'")).toBe("color = 'red'")
  })

  test("with single array parameter", () => {
    expect(sql.or(["color = 'red'"])).toBe("color = 'red'")
  })

  test("with multiple parameters", () => {
    expect(
      sql.or("color1 = 'red'", "color2 = 'blue'", "color3 = 'green'")
    ).toBe("(color1 = 'red' OR color2 = 'blue' OR color3 = 'green')")
  })

  test("with multi-element array parameter", () => {
    expect(
      sql.or(["color1 = 'red'", "color2 = 'blue'", "color3 = 'green'"])
    ).toBe("(color1 = 'red' OR color2 = 'blue' OR color3 = 'green')")
  })

  test("with mixed parameters", () => {
    expect(
      sql.or(["color1 = 'red'"], "color2 = 'blue'", "color3 = 'green'")
    ).toBe("(color1 = 'red' OR color2 = 'blue' OR color3 = 'green')")
    expect(
      sql.or("color1 = 'red'", ["color2 = 'blue'"], "color3 = 'green'")
    ).toBe("(color1 = 'red' OR color2 = 'blue' OR color3 = 'green')")
    expect(
      sql.or("color1 = 'red'", "color2 = 'blue'", ["color3 = 'green'"])
    ).toBe("(color1 = 'red' OR color2 = 'blue' OR color3 = 'green')")
    expect(
      sql.or(["color1 = 'red'", "color2 = 'blue'"], "color3 = 'green'")
    ).toBe("(color1 = 'red' OR color2 = 'blue' OR color3 = 'green')")
    expect(
      sql.or("color1 = 'red'", ["color2 = 'blue'", "color3 = 'green'"])
    ).toBe("(color1 = 'red' OR color2 = 'blue' OR color3 = 'green')")
    expect(
      sql.or(["color1 = 'red'", "color2 = 'blue'"], ["color3 = 'green'"])
    ).toBe("(color1 = 'red' OR color2 = 'blue' OR color3 = 'green')")
    expect(
      sql.or(["color1 = 'red'"], ["color2 = 'blue'", "color3 = 'green'"])
    ).toBe("(color1 = 'red' OR color2 = 'blue' OR color3 = 'green')")
    expect(
      sql.or(["color1 = 'red'"], ["color2 = 'blue'"], ["color3 = 'green'"])
    ).toBe("(color1 = 'red' OR color2 = 'blue' OR color3 = 'green')")
    expect(
      sql.or(
        ["color1 = 'red'", "color2 = 'blue'"],
        ["color3 = 'green'", "color4 = 'yellow'"]
      )
    ).toBe(
      "(color1 = 'red' OR color2 = 'blue' OR color3 = 'green' OR color4 = 'yellow')"
    )
  })

  test("with an empty array parameter", () => {
    expect(sql.or("color = 'red'", [])).toBe("color = 'red'")
    expect(sql.or([], "color = 'red'")).toBe("color = 'red'")
    expect(sql.or(["color = 'red'"], [])).toBe("color = 'red'")
    expect(sql.or([], ["color = 'red'"])).toBe("color = 'red'")
  })

  test("with an empty string parameter", () => {
    expect(sql.or("color = 'red'", "")).toBe("color = 'red'")
    expect(sql.or("", "color = 'red'")).toBe("color = 'red'")
    expect(sql.or(["color = 'red'"], "")).toBe("color = 'red'")
    expect(sql.or("", ["color = 'red'"])).toBe("color = 'red'")
  })

  test("with an empty string parameter inside an array", () => {
    expect(sql.or("color = 'red'", [""])).toBe("color = 'red'")
    expect(sql.or([""], "color = 'red'")).toBe("color = 'red'")
    expect(sql.or(["color = 'red'"], [""])).toBe("color = 'red'")
    expect(sql.or([""], ["color = 'red'"])).toBe("color = 'red'")
  })

  test("with multiple empty array parameters", () => {
    expect(sql.or([], [], "color = 'red'")).toBe("color = 'red'")
    expect(sql.or([], "color = 'red'", [])).toBe("color = 'red'")
    expect(sql.or("color = 'red'", [], [])).toBe("color = 'red'")
    expect(sql.or([], [], ["color = 'red'"])).toBe("color = 'red'")
    expect(sql.or([], ["color = 'red'"], [])).toBe("color = 'red'")
    expect(sql.or(["color = 'red'"], [], [])).toBe("color = 'red'")
  })

  test("with multiple empty string parameters", () => {
    expect(sql.or("", "", "color = 'red'")).toBe("color = 'red'")
    expect(sql.or("", "color = 'red'", "")).toBe("color = 'red'")
    expect(sql.or("color = 'red'", "", "")).toBe("color = 'red'")
    expect(sql.or("", "", ["color = 'red'"])).toBe("color = 'red'")
    expect(sql.or("", ["color = 'red'"], "")).toBe("color = 'red'")
    expect(sql.or(["color = 'red'"], "", "")).toBe("color = 'red'")
  })

  test("with parameters having extra whitespace", () => {
    expect(
      sql.or([" color1 = 'red'"], "color2 = 'blue' ", [
        "color3 = 'green'",
        "\ncolor4 = 'yellow'\t"
      ])
    ).toBe(
      "(color1 = 'red' OR color2 = 'blue' OR color3 = 'green' OR color4 = 'yellow')"
    )
  })

  test("with whitespace-only parameters", () => {
    expect(sql.or(["   "], "\t ", ["\n\n", ""])).toBe("")
  })
})

describe("limit", () => {
  test("with empty parameters", () => {
    expect(sql.limit()).toBe("")
  })

  test("with a numerical parameter", () => {
    const LIMIT = 10
    expect(sql.limit(LIMIT)).toBe("LIMIT 10")
  })

  test("with a NaN parameter", () => {
    expect(() => sql.limit(NaN)).toThrow()
  })
})

describe("offset", () => {
  test("with empty parameters", () => {
    expect(sql.offset()).toBe("")
  })

  test("with a numerical parameter", () => {
    const OFFSET = 10
    expect(sql.offset(OFFSET)).toBe("OFFSET 10")
  })

  test("with a NaN parameter", () => {
    expect(() => sql.offset(NaN)).toThrow()
  })
})

describe("escape", () => {
  test("with string including quotes", () => {
    expect(sql.escape("\"doubles\" are fine, 'singles' are not")).toEqual(
      "'\"doubles\" are fine, ''singles'' are not'"
    )
  })

  test("with string including _ and % wildcards", () => {
    expect(
      sql.escape("_ and % are fine (not handling LIKE / ILIKE yet)")
    ).toEqual("'_ and % are fine (not handling LIKE / ILIKE yet)'")
  })
})

describe("sql", () => {
  test("with empty string", () => {
    expect(sql``).toBe("")
  })

  test("with whitespace-only string", () => {
    expect(sql`  \t\n \t \n\n `).toBe("")
  })

  test("with single string surrounded by whitespace", () => {
    expect(sql`
      \t\t
      SELECT
      \r\r
    `).toBe("SELECT")
  })

  test("with multiple strings separated by whitespace", () => {
    expect(sql`
      \t\t
      SELECT
      \r
      \t
      \tFROM
    `).toBe("SELECT FROM")
  })

  test("with multiple strings including inner whitespace", () => {
    expect(sql`
      SELECT
        str,
        rgb
      FROM
        table
      WHERE
        (str = '    red' OR str = '  yellow  ')
    `).toBe(
      "SELECT str, rgb FROM table WHERE (str = '    red' OR str = '  yellow  ')"
    )
  })

  test("with multiple strings and interpolated values including inner whitespace", () => {
    const table = `
      table
    `

    const filter = "str = '    red'"

    expect(sql`
      SELECT
        str,
        rgb
      FROM
        ${table}
      WHERE
        (${filter} OR str = '  yellow  ')
    `).toBe(
      "SELECT str, rgb FROM table WHERE (str = '    red' OR str = '  yellow  ')"
    )
  })
})
