// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createSortByOptions,
  setCorrectOrderingValue
} from "./chart-settings-sort-by-helpers"

describe("Settings Sort By Helper Functions", () => {
  describe("setCorrectOrdering Value Function", () => {
    it("set value to desc if current value is asc", () => {
      const sortColumn = setCorrectOrderingValue({ order: "asc" })
      expect(sortColumn.order).toEqual("desc")
    })

    it("set value to asc if current value is desc", () => {
      const sortColumn = setCorrectOrderingValue({ order: "desc" })
      expect(sortColumn.order).toEqual("asc")
    })

    it("set value to asc if current value is null", () => {
      const sortColumn = setCorrectOrderingValue()
      expect(sortColumn.order).toEqual("asc")
    })
  })

  describe("createSortByOptions Value Function", () => {
    it("should set value on dimensions as key0, and set value on measures as the name, will also add # Records as countval", () => {
      const dims = [
        {
          value: "dest",
          label: "dest"
        }
      ]

      const measures = [
        {
          value: "airtime",
          label: "airtime",
          name: "val",
          aggType: "Avg"
        }
      ]

      expect(createSortByOptions(dims, measures)).toStrictEqual([
        { label: "# Records", value: "countval" },
        { label: "dest", value: "key0", type: "A-Z" },
        { label: "airtime", value: "val", type: "Avg" }
      ])
    })

    it("should set value of # Records to a custom measure name if # Records is selected", () => {
      const dims = [
        {
          value: "dest",
          label: "dest"
        }
      ]

      const measures = [
        {
          value: "*",
          label: "# Records",
          name: "val",
          aggType: "Avg"
        }
      ]

      expect(createSortByOptions(dims, measures)).toStrictEqual([
        { label: "# Records", value: "val" },
        { label: "dest", value: "key0", type: "A-Z" }
      ])
    })

    it("should not add value if is inactive or measure has no value", () => {
      const dims = [
        {
          value: "dest",
          label: "dest"
        }
      ]

      const measures = [
        {
          value: null,
          label: "# Records",
          name: "val",
          aggType: "Avg"
        },
        {
          value: "*",
          label: "# Records",
          name: "val",
          aggType: "Avg",
          inactive: true
        }
      ]

      expect(createSortByOptions(dims, measures)).toStrictEqual([
        { label: "# Records", value: "countval" },
        { label: "dest", value: "key0", type: "A-Z" }
      ])
    })
    it("should remove duplicates in the measures if value and aggType are the same", () => {
      const dims = [
        {
          value: "dest",
          label: "dest"
        }
      ]

      const measures = [
        {
          value: "airtime",
          label: "airtime",
          name: "val",
          aggType: "Avg"
        },
        {
          value: "airtime",
          label: "airtime",
          name: "color",
          aggType: "Avg"
        }
      ]

      expect(createSortByOptions(dims, measures)).toStrictEqual([
        { label: "# Records", value: "countval" },
        { label: "dest", value: "key0", type: "A-Z" },
        { label: "airtime", value: "val", type: "Avg" }
      ])
    })
  })
})
