// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import action from "utils/redux/action"
import {
  CREATE_NEW_TABLE_ERROR,
  CREATE_NEW_TABLE_REQUEST,
  CREATE_NEW_TABLE_SUCCESS,
  GET_IMPORT_PREVIEW_DATA_ERROR,
  GET_IMPORT_PREVIEW_DATA_REQUEST,
  GET_IMPORT_PREVIEW_DATA_SUCCESS,
  IMPORT_TABLE_COMPLETE,
  IMPORT_TABLE_ERROR,
  IMPORT_TABLE_REQUEST,
  IMPORT_TABLE_SUCCESS,
  REMOVE_IMPORT_FILES_REQUEST,
  UPDATE_COLUMN_NAME,
  UPDATE_IMPORTER_SETTING
} from "constants/action-types"

import ImporterReducer, {
  setRequestState,
  setErrorState,
  setSuccessState,
  reducers
} from "./importer-reducer"

function testRequestAction(state, actionType) {
  const nextState = ImporterReducer(state, actionType)
  expect(nextState).toEqual(setRequestState(state, actionType))
}

function testErrorAction(state, actionType) {
  const nextState = ImporterReducer(state, actionType)
  expect(nextState).toEqual(setErrorState(state, actionType))
}

function testSuccessAction(state, actionType) {
  const nextState = ImporterReducer(state, actionType)
  expect(nextState).toEqual(setSuccessState(state, actionType))
}

describe("Importer Reducer", () => {
  describe("Request Action Types", () => {
    it("should set loading to true, and error to false", () => {
      ;[REMOVE_IMPORT_FILES_REQUEST, CREATE_NEW_TABLE_REQUEST].forEach(
        (type) => {
          testRequestAction(
            {
              loading: false,
              error: false
            },
            action(type)
          )
        }
      )
    })

    it("should set loading to true, error to false, and populate table name", () => {
      testRequestAction(
        {
          loading: false,
          error: false,
          tablename: ""
        },
        action(GET_IMPORT_PREVIEW_DATA_REQUEST)
      )
    })

    it("should set filename to currentFileUploading name", () => {
      expect(
        reducers[IMPORT_TABLE_REQUEST](
          {},
          {
            filename: "test"
          }
        )
      ).toEqual({
        loading: false,
        error: false,
        currentFileUploading: "test"
      })
    })
  })

  describe("All Error Action Types", () => {
    it("should set error to true, and loading to false", () => {
      ;[
        CREATE_NEW_TABLE_ERROR,
        GET_IMPORT_PREVIEW_DATA_ERROR,
        IMPORT_TABLE_ERROR
      ].forEach((type) => {
        testErrorAction(
          {
            loading: true,
            error: false
          },
          action(type)
        )
      })
    })
  })

  describe("Success Action Types", () => {
    it("should set error to false, and loading to false for most success actions", () => {
      ;[CREATE_NEW_TABLE_SUCCESS, IMPORT_TABLE_SUCCESS].forEach((type) => {
        testSuccessAction(
          {
            loading: true,
            error: false
          },
          action(type)
        )
      })
    })

    it("should set error to false, and loading to false.  It also should create clean_col_names, is_not_valid, and changed_columns for GET_IMPORT_PREVIEW_DATA_SUCCESS", () => {
      const previewData = {
        row_set: {
          row_desc: [
            { col_name: "col1" },
            { col_name: "col2" },
            { col_name: "col3" }
          ]
        }
      }

      expect(
        reducers[GET_IMPORT_PREVIEW_DATA_SUCCESS](
          {
            loading: true,
            error: false
          },
          { importPreviewData: previewData }
        )
      ).toEqual({
        settings: {},
        loading: false,
        error: false,
        data: {
          row_set: {
            changed_columns: [],
            row_desc: [
              {
                clean_col_name: "col1",
                col_name: "col1",
                col_name_modified: false,
                is_not_valid: null
              },
              {
                clean_col_name: "col2",
                col_name: "col2",
                col_name_modified: false,
                is_not_valid: null
              },
              {
                clean_col_name: "col3",
                col_name: "col3",
                col_name_modified: false,
                is_not_valid: null
              }
            ]
          }
        }
      })
    })

    it("should replace first character if not a-zA-Z on SUCCESS", () => {
      const previewData = {
        row_set: {
          row_desc: [{ col_name: "1col1" }]
        }
      }

      expect(
        reducers[GET_IMPORT_PREVIEW_DATA_SUCCESS](
          {
            loading: true,
            error: false
          },
          { importPreviewData: previewData }
        )
      ).toEqual({
        settings: {},
        loading: false,
        error: false,
        data: {
          row_set: {
            changed_columns: [0],
            row_desc: [
              {
                clean_col_name: "c1_1col1",
                col_name: "1col1",
                col_name_modified: false,
                is_not_valid: null
              }
            ]
          }
        }
      })
    })

    it("should replace reserved words on SUCCESS", () => {
      const previewData = {
        row_set: {
          row_desc: [{ col_name: "date" }]
        }
      }

      expect(
        reducers[GET_IMPORT_PREVIEW_DATA_SUCCESS](
          {
            loading: true,
            error: false
          },
          { importPreviewData: previewData }
        )
      ).toEqual({
        settings: {},
        loading: false,
        error: false,
        data: {
          row_set: {
            changed_columns: [0],
            row_desc: [
              {
                clean_col_name: "c1_date",
                col_name: "date",
                col_name_modified: false,
                is_not_valid: null
              }
            ]
          }
        }
      })
    })

    it('should replace anything but "alphanumeric characters, $, and _" in name on SUCCESS with an underscore', () => {
      const previewData = {
        row_set: {
          row_desc: [{ col_name: "Date/Time" }]
        }
      }

      expect(
        reducers[GET_IMPORT_PREVIEW_DATA_SUCCESS](
          {
            loading: true,
            error: false
          },
          { importPreviewData: previewData }
        )
      ).toEqual({
        settings: {},
        loading: false,
        error: false,
        data: {
          row_set: {
            changed_columns: [0],
            row_desc: [
              {
                clean_col_name: "Date_Time",
                col_name: "Date/Time",
                col_name_modified: false,
                is_not_valid: null
              }
            ]
          }
        }
      })
    })

    it("should replace duplicate columns on SUCCESS", () => {
      const previewData = {
        row_set: {
          row_desc: [
            { col_name: "col1" },
            { col_name: "col2" },
            { col_name: "col1" },
            { col_name: "col2" },
            { col_name: "col1" }
          ]
        }
      }

      expect(
        reducers[GET_IMPORT_PREVIEW_DATA_SUCCESS](
          {
            loading: true,
            error: false
          },
          { importPreviewData: previewData }
        )
      ).toEqual({
        settings: {},
        loading: false,
        error: false,
        data: {
          row_set: {
            changed_columns: [2, 3, 4],
            row_desc: [
              {
                clean_col_name: "col1",
                col_name: "col1",
                col_name_modified: false,
                is_not_valid: null
              },
              {
                clean_col_name: "col2",
                col_name: "col2",
                col_name_modified: false,
                is_not_valid: null
              },
              {
                clean_col_name: "col1_1",
                col_name: "col1",
                col_name_modified: false,
                is_not_valid: null
              },
              {
                clean_col_name: "col2_1",
                col_name: "col2",
                col_name_modified: false,
                is_not_valid: null
              },
              {
                clean_col_name: "col1_2",
                col_name: "col1",
                col_name_modified: false,
                is_not_valid: null
              }
            ]
          }
        }
      })
    })
    it("should prepend reserved word column names on SUCCESS", () => {
      const previewData = {
        row_set: {
          row_desc: [
            { col_name: "timestamp" },
            { col_name: "begin" },
            { col_name: "end" }
          ]
        }
      }

      expect(
        reducers[GET_IMPORT_PREVIEW_DATA_SUCCESS](
          {
            loading: true,
            error: false
          },
          { importPreviewData: previewData }
        )
      ).toEqual({
        settings: {},
        loading: false,
        error: false,
        data: {
          row_set: {
            changed_columns: [0, 1, 2],
            row_desc: [
              {
                clean_col_name: "c1_timestamp",
                col_name: "timestamp",
                col_name_modified: false,
                is_not_valid: null
              },
              {
                clean_col_name: "c2_begin",
                col_name: "begin",
                col_name_modified: false,
                is_not_valid: null
              },
              {
                clean_col_name: "c3_end",
                col_name: "end",
                col_name_modified: false,
                is_not_valid: null
              }
            ]
          }
        }
      })
    })
  })

  describe("Complete Action Types", () => {
    it("should add importComplete flag to import reducer and set currentFileUploading to null", () => {
      expect(
        reducers[IMPORT_TABLE_COMPLETE]({
          loading: true,
          error: false,
          importPreviewData: ["data"]
        })
      ).toEqual({
        loading: false,
        error: false,
        importPreviewData: ["data"],
        importComplete: true,
        currentFileUploading: null
      })
    })
  })

  describe("UPDATE_COLUMN_NAME", () => {
    it("should replace column name at position properly", () => {
      expect(
        reducers[UPDATE_COLUMN_NAME](
          {
            loading: true,
            error: false,
            data: { row_set: { row_desc: [{ clean_col_name: "frank" }] } }
          },
          { name: "jim", columnId: 0 }
        )
      ).toEqual({
        loading: true,
        error: false,
        data: {
          row_set: {
            row_desc: [
              {
                clean_col_name: "jim",
                col_name_modified: true,
                is_not_valid: null
              }
            ]
          }
        }
      })
    })

    it("should set error if column name first character is not a letter", () => {
      expect(
        reducers[UPDATE_COLUMN_NAME](
          {
            loading: true,
            error: false,
            data: { row_set: { row_desc: [{ clean_col_name: "frank" }] } }
          },
          { name: "1frank", columnId: 0 }
        )
      ).toEqual({
        loading: true,
        error: false,
        data: {
          row_set: {
            row_desc: [
              {
                clean_col_name: "1frank",
                col_name_modified: true,
                is_not_valid: "First character has to be a letter"
              }
            ]
          }
        }
      })
    })

    it("should set error if not using bad characters in column name", () => {
      expect(
        reducers[UPDATE_COLUMN_NAME](
          {
            loading: true,
            error: false,
            data: { row_set: { row_desc: [{ clean_col_name: "frank" }] } }
          },
          { name: "date/time", columnId: 0 }
        )
      ).toEqual({
        loading: true,
        error: false,
        data: {
          row_set: {
            row_desc: [
              {
                clean_col_name: "date/time",
                col_name_modified: true,
                is_not_valid:
                  "Can only use alphanumeric characters, and '_' in name"
              }
            ]
          }
        }
      })
    })

    it("should set error if column name is sql reserved word", () => {
      expect(
        reducers[UPDATE_COLUMN_NAME](
          {
            loading: true,
            error: false,
            data: { row_set: { row_desc: [{ clean_col_name: "frank" }] } }
          },
          { name: "date", columnId: 0 }
        )
      ).toEqual({
        loading: true,
        error: false,
        data: {
          row_set: {
            row_desc: [
              {
                clean_col_name: "date",
                col_name_modified: true,
                is_not_valid: "Cannot use a SQL reserved word"
              }
            ]
          }
        }
      })
    })

    it("should set error if column name is blank", () => {
      expect(
        reducers[UPDATE_COLUMN_NAME](
          {
            loading: true,
            error: false,
            data: { row_set: { row_desc: [{ clean_col_name: "frank" }] } }
          },
          { name: "", columnId: 0 }
        )
      ).toEqual({
        loading: true,
        error: false,
        data: {
          row_set: {
            row_desc: [
              {
                clean_col_name: "",
                col_name_modified: true,
                is_not_valid: "Cannot be an empty name"
              }
            ]
          }
        }
      })
    })

    it("should set error if column name is duplicate", () => {
      expect(
        reducers[UPDATE_COLUMN_NAME](
          {
            loading: true,
            error: false,
            data: {
              row_set: {
                row_desc: [
                  { clean_col_name: "frank" },
                  { clean_col_name: "jim" }
                ]
              }
            }
          },
          { name: "jim", columnId: 0 }
        )
      ).toEqual({
        loading: true,
        error: false,
        data: {
          row_set: {
            row_desc: [
              {
                clean_col_name: "jim",
                col_name_modified: true,
                is_not_valid: "Cannot have a duplicate name in entry"
              },
              {
                clean_col_name: "jim"
              }
            ]
          }
        }
      })
    })
  })

  describe("UPDATE_IMPORTER_SETTING", () => {
    it("should update importer setting", () => {
      expect(
        reducers[UPDATE_IMPORTER_SETTING](
          {
            loading: true,
            error: false,
            data: { row_set: { row_desc: [{ col_type: { encoding: 4 } }] } },
            settings: { delimiter: "|" }
          },
          { setting: "delimiter", value: "," }
        )
      ).toEqual({
        loading: true,
        error: false,
        data: { row_set: { row_desc: [{ col_type: { encoding: 4 } }] } },
        settings: { delimiter: "," }
      })
    })
  })
})
