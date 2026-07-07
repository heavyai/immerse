// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import thunk from "redux-thunk"
import configureStore from "redux-mock-store"
import { TSourceType } from "@heavyai/connector/dist/browser-connector"

import mockAppState from "utils/test-helpers/mock-app-state"
import {
  getImportPreviewData,
  createNewTableForImporter,
  importFiles,
  updateColumnName
} from "actions/importer-action-creators"
import { ConnectorType } from "components/data-manager/constants"

const services = new Map()

services.set("DbCon", {
  importTableAsync: () => Promise.resolve({ rows_completed: 0 }),
  importTableStatusAsync: () =>
    Promise.resolve({
      rows_completed: 0,
      rows_estimated: 0,
      rows_rejected: 0
    }),
  detectColumnTypesAsync: () => Promise.resolve("previewData"),
  getFieldsAsync: () => Promise.resolve({ columns: [] }),
  createTableAsync: () => Promise.resolve()
})

const middlewares = [thunk.withExtraArgument(services)]
const mockStore = configureStore(middlewares)

describe("Importer Action Creators", () => {
  describe("getImportPreviewData", () => {
    it("should dispatch twice on success", async () => {
      const fileName = "table"
      const copyParams = { file_type: 0 }

      const store = mockStore({
        ...mockAppState,
        importer: {
          data: { ...mockAppState.importer.data, copy_params: copyParams },
          connector: {
            filesToImport: [fileName],
            type: ConnectorType.LocalFileImport
          },
          settings: {
            source_type: TSourceType.DELIMITED_FILE
          }
        }
      })

      await store.dispatch(getImportPreviewData())

      expect(store.getActions()).toEqual([
        {
          type: "GET_IMPORT_PREVIEW_DATA_REQUEST",
          pathName: fileName
        },
        {
          type: "GET_IMPORT_PREVIEW_DATA_SUCCESS",
          importPreviewData: "previewData"
        }
      ])
    })

    describe("createNewTableForImporter", () => {
      it("should dispatch twice on success", async () => {
        const tableName = "table"
        const headers = ["headers"]

        const store = mockStore({
          ...mockAppState,
          importer: {
            ...mockAppState.importer,
            connector: {
              filesToImport: [tableName]
            }
          }
        })

        await store.dispatch(createNewTableForImporter(tableName, headers))

        expect(store.getActions()).toEqual([
          { type: "CREATE_NEW_TABLE_REQUEST" },
          { type: "CREATE_NEW_TABLE_SUCCESS" }
        ])
      })
    })
  })

  describe("importFiles", () => {
    it("should dispatch IMPORT_TABLE_REQUEST for each file", async () => {
      const tableName = "table"
      const fileNames = ["file1", "file2", "file3"]
      const copyParams = { file_type: 0 }
      const store = mockStore({
        ...mockAppState,
        importer: {
          data: { ...mockAppState.importer.data, copy_params: copyParams },
          connector: {}
        }
      })

      await store.dispatch(importFiles(tableName, fileNames, copyParams))

      expect(
        store.getActions().filter(({ type }) => type === "IMPORT_TABLE_REQUEST")
      ).toEqual([
        { type: "IMPORT_TABLE_REQUEST", filename: "file1" },
        { type: "IMPORT_TABLE_REQUEST", filename: "file2" },
        { type: "IMPORT_TABLE_REQUEST", filename: "file3" }
      ])
    })
  })

  describe("updateColumnName", () => {
    it("should return an object with columnId and updated name as params", () => {
      const store = mockStore(mockAppState)
      const updatedColName = "timestamp"
      const col = 4

      store.dispatch(updateColumnName(updatedColName, col))
      const actions = store.getActions()

      expect(actions).toEqual([
        {
          columnId: col,
          name: updatedColName,
          type: "UPDATE_COLUMN_NAME"
        }
      ])
    })
  })
})
