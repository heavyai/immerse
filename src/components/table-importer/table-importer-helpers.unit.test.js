// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createImportTitle,
  areAnyColumnsNotValid,
  doesTableNameAlreadyExists,
  doesShapeHaveError,
  parseExtension,
  parseFileName
} from "./table-importer-helpers"

describe("Import Helper functions", () => {
  describe("Create Import Title", () => {
    it("should display import title properly based on dropzone showing", () => {
      const state = {
        dropZoneShowing: true,
        tablePreviewShowing: false,
        importProgressShowing: false
      }
      const props = {
        importComplete: false
      }
      const title = createImportTitle(state, props)
      expect(title).toEqual("Data Importer")
    })

    it("should display import title properly based on table preview showing", () => {
      const state = {
        dropZoneShowing: false,
        tablePreviewShowing: true,
        importProgressShowing: false
      }
      const props = {
        importComplete: false
      }
      const title = createImportTitle(state, props)
      expect(title).toEqual("Data Preview")
    })

    it("should display import title properly based on import progress showing", () => {
      const state = {
        dropZoneShowing: false,
        tablePreviewShowing: false,
        importProgressShowing: true
      }
      const props = {
        importComplete: false
      }
      const title = createImportTitle(state, props)
      expect(title).toEqual("Creating Table and Importing Data")
    })

    it("should display import title properly based on import complete", () => {
      const state = {
        dropZoneShowing: false,
        tablePreviewShowing: false,
        importProgressShowing: true
      }
      const props = {
        importComplete: true
      }
      const title = createImportTitle(state, props)
      expect(title).toEqual("Successfully Imported Table")
    })
  })

  describe("Does Table Name Already Exists", () => {
    it("should return true if Table Name Exists in list", () => {
      const tableName = "myTable"
      const list = [
        { name: "myTable" },
        { name: "mySecondTable" },
        { name: "myThirdTable" }
      ]
      const result = doesTableNameAlreadyExists(tableName, list)
      expect(result).toEqual(true)
    })

    it("should return false if Table Name Does Not Exist in list", () => {
      const tableName = "myTable"
      const list = [{ name: "mySecondTable" }, { name: "myThirdTable" }]
      const result = doesTableNameAlreadyExists(tableName, list)
      expect(result).toEqual(false)
    })
  })

  describe("Are Any Columns Not Valid", () => {
    it("should return false if columns are not valid", () => {
      const headers = [{ is_not_valid: true }, { is_not_valid: false }]
      const result = areAnyColumnsNotValid(headers)
      expect(result).toEqual(true)
    })
    it("should return false if columns are not valid", () => {
      const headers = [{ is_not_valid: false }, { is_not_valid: false }]
      const result = areAnyColumnsNotValid(headers)
      expect(result).toEqual(false)
    })
  })

  describe("doesShapeHaveError", () => {
    it("should return false if providing proper files for shape", () => {
      const filesToUpload = ["somefile.shp", "somefile.shx", "somefile.dbf"]
      const result = doesShapeHaveError(filesToUpload)
      expect(result).toEqual(false)
    })

    it("should handle files with multiple periods in filename and pass", () => {
      const filesToUpload = [
        "somefile.bigdata.shp",
        "somefile.bigdata.shx",
        "somefile.bigdata.dbf"
      ]
      const result = doesShapeHaveError(filesToUpload)
      expect(result).toEqual(false)
    })

    it("should return error message if there are missing multiple mandatory shape files", () => {
      const filesToUpload = ["somefile.shp"]
      const result = doesShapeHaveError(filesToUpload)
      expect(result).toEqual(
        "You are missing the following mandatory shape file(s): shx, dbf"
      )
    })

    it("should return error message if there are missing a single mandatory shape files", () => {
      const filesToUpload = ["somefile.shp", "somefile.dbf"]
      const result = doesShapeHaveError(filesToUpload)
      expect(result).toEqual(
        "You are missing the following mandatory shape file(s): shx"
      )
    })

    it("should return error if there are duplicate file extensions", () => {
      const filesToUpload = [
        "somefile.shp",
        "somefile.dbf",
        "somefile.dbf",
        "somefile.shx"
      ]
      const result = doesShapeHaveError(filesToUpload)
      expect(result).toEqual(
        "You have more than one file with the follow extension(s): dbf"
      )
    })
  })

  describe("parseExtension", () => {
    it("should be able to parse standard file", () => {
      const file = "somefile.shp"
      const result = parseExtension(file)
      expect(result).toEqual("shp")
    })

    it("should be able to parse file with multiple periods in it", () => {
      const file = "somefile.shp.dbx.pdf.shp"
      const result = parseExtension(file)
      expect(result).toEqual("shp")
    })

    it("should be able to parse file with special shp.xml extension", () => {
      const file = "somefile.shp.dbx.shp.xml"
      const result = parseExtension(file)
      expect(result).toEqual("shp.xml")
    })

    it("should be able to parse file that is not listed in constants file", () => {
      const file = "somefile.shp.dbx.shp.dat"
      const result = parseExtension(file)
      expect(result).toEqual("dat")
    })

    it("should be able to handle a null file", () => {
      const file = ""
      const result = parseExtension(file)
      expect(result).toEqual(null)
    })

    it("should be able to handle a file without an extension", () => {
      const file = "dumbfilewithoutanextension"
      const result = parseExtension(file)
      expect(result).toEqual(null)
    })
  })

  describe("parseFileName", () => {
    it("should be able to parse standard file", () => {
      const file = "somefile.shp"
      const result = parseFileName(file)
      expect(result).toEqual("somefile")
    })

    it("should be able to parse file with multiple periods in it", () => {
      const file = "somefile.shp.dbx.pdf.shp"
      const result = parseFileName(file)
      expect(result).toEqual("somefile.shp.dbx.pdf")
    })

    it("should be able to parse file with special shp.xml extension", () => {
      const file = "somefile.shp.dbx.shp.xml"
      const result = parseFileName(file)
      expect(result).toEqual("somefile.shp.dbx")
    })

    it("should be able to parse file that is not listed in constants file", () => {
      const file = "somefile.shp.dbx.shp.dat"
      const result = parseFileName(file)
      expect(result).toEqual("somefile.shp.dbx.shp")
    })

    it("should be able to handle a null file", () => {
      const file = ""
      const result = parseFileName(file)
      expect(result).toEqual(null)
    })

    it("should be able to handle a file without an extension", () => {
      const file = "dumbfilewithoutanextension"
      const result = parseFileName(file)
      expect(result).toEqual(null)
    })
  })
})
