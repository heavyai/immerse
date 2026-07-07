// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { dataToArray } from "components/sql-editor/sql-editor-data-table"

describe("SqlEditorDataTable Component", () => {
  const props = {
    firstRender: false,
    viewerHeight: 320,
    data: {
      results: [
        {
          fieldName: "value",
          fieldName1: "value1"
        }
      ],
      fields: [{ name: "fieldName" }, { name: "fieldName1" }]
    }
  }

  describe("SqlEditorDataTable::dataToArray should return expected rows", () => {
    it("should parse rows correctly from data", () => {
      const expectedRows = [
        ["fieldName", "fieldName1"],
        ["value", "value1"]
      ]
      const newProps = dataToArray(props)
      expect(newProps.rows).toEqual(expectedRows)
    })
  })
})
