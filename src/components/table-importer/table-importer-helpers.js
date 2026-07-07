// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  IMPORT_GEO_TYPES,
  IMPORT_FILE_TYPES,
  SHAPE_FILE_REQUIREMENTS
} from "constants/import-file-types"
import { checkForNameValidity } from "reducers/importer-reducer"
import { any, keys } from "ramda"
import { TDatumType } from "@heavyai/connector/dist/browser-connector"

export const areAnyColumnsNotValid = (headers) =>
  headers.some((header) => header.is_not_valid)
const removeNameFromEndOfString = (func) => (filename = "") =>
  filename.substr(0, filename.length - (func(filename) || filename).length - 1)

const parseExtensionStrategy1 = (filename) =>
  keys(IMPORT_FILE_TYPES).filter(
    (type) => filename.lastIndexOf(type) === filename.length - type.length
  )[0]
const parseFileNameStrategy1 = removeNameFromEndOfString(
  parseExtensionStrategy1
)

const parseFileNameStrategy2 = (filename) =>
  filename.substr(0, filename.lastIndexOf("."))
const parseExtensionStrategy2 = (filename) =>
  filename.substr(filename.lastIndexOf(".") + 1)

export const parseExtension = (filename) => {
  if (!filename || filename.indexOf(".") === -1) {
    return null
  }

  const extension =
    parseExtensionStrategy1(filename) || parseExtensionStrategy2(filename)

  return extension.toLowerCase()
}

export const parseFileName = (filename) => {
  if (!filename || filename.indexOf(".") === -1) {
    return null
  }

  return parseFileNameStrategy1(filename) || parseFileNameStrategy2(filename)
}

export const doesTableNameAlreadyExists = (tableName, listOfTables) =>
  listOfTables.some((table) => table.name === tableName)

const areThereMandatoryFilesMissing = (filesToUpload) => {
  const shapeFileRequirements = Object.assign({}, SHAPE_FILE_REQUIREMENTS)
  filesToUpload.forEach((file) => {
    const fileExtension = parseExtension(file)
    if (shapeFileRequirements[fileExtension]) {
      shapeFileRequirements[fileExtension] = false
    }
  })
  const missingRequiredShapeFiles = keys(shapeFileRequirements).filter(
    (reqExtension) => shapeFileRequirements[reqExtension]
  )

  return missingRequiredShapeFiles.length
    ? `You are missing the following mandatory shape file(s): ${missingRequiredShapeFiles.join(
        ", "
      )}`
    : false
}

const findDuplicates = (arr) => {
  const cache = {}
  const results = []
  for (let i = 0; i < arr.length; i += 1) {
    if (cache[arr[i]] === true) {
      results.push(arr[i])
    } else {
      cache[arr[i]] = true
    }
  }
  return results
}

const areThereDifferentNamesAcrossFiles = (filesToUpload) => {
  const namesWithoutExtensions = filesToUpload.map((file) =>
    parseFileName(file)
  )
  const uniqueNames = [...new Set(namesWithoutExtensions)]
  return uniqueNames.length > 1
    ? `You must have one unique filename across all files.\nYou currently have the following in the shape: ${uniqueNames.join(
        " & "
      )}`
    : false
}

const areThereDuplicateExtensions = (filesToUpload) => {
  const extensions = filesToUpload.map((file) => parseExtension(file))
  const duplicates = findDuplicates(extensions)
  return duplicates.length
    ? `You have more than one file with the follow extension(s): ${duplicates.join(
        ", "
      )}`
    : false
}

export const doesShapeHaveError = (filesToUpload) => {
  const errorCheckFunctions = [
    areThereMandatoryFilesMissing,
    areThereDifferentNamesAcrossFiles,
    areThereDuplicateExtensions
  ]

  return errorCheckFunctions.reduce((foundError, func) => {
    if (foundError) {
      return foundError
    } else {
      const checkForError = func(filesToUpload)
      if (checkForError) {
        return checkForError
      }
    }
    return false
  }, false)
}

export const checkForValidTableName = (tableName, listOfTables) => {
  const nameInvalidMsg = checkForNameValidity(tableName)
  if (nameInvalidMsg) {
    return nameInvalidMsg
  } else if (doesTableNameAlreadyExists(tableName, listOfTables)) {
    return "You have a duplicate table name in your database"
  } else {
    return null
  }
}

export const createImportTitle = (
  { dataCatalogShowing, tablePreviewShowing, importProgressShowing },
  { importComplete }
) => {
  if (tablePreviewShowing) {
    return "Data Preview"
  } else if (importProgressShowing && !importComplete) {
    return "Creating Table and Importing Data"
  } else if (importComplete) {
    return "Successfully Imported Table"
  } else if (dataCatalogShowing) {
    return "Data Catalog"
  } else {
    return "Data Importer"
  }
}

export const isGeoImport = (typeOfImport) => IMPORT_GEO_TYPES[typeOfImport]

export const isGeoColumn = ({ col_type: { type } }) =>
  [
    // TODO: Maybe reconcile these w/ https://github.com/heavyai/immerse/blob/46f552d8b1582aea9820d0f1905b86eb5ad85c96/src/vega/constants/data-selection-types.ts#L180-L186
    //  and https://github.com/heavyai/immerse/blob/3b9ce8e43bd786cf4afbd280d5748f55e74f7a99/src/reducers/importer-reducer.ts#L461-L466
    //  at some point?
    TDatumType.POINT,
    TDatumType.LINESTRING,
    TDatumType.MULTILINESTRING,
    TDatumType.POLYGON,
    TDatumType.MULTIPOLYGON
  ].includes(type)

export const hasGeoColumns = (importerData) =>
  importerData &&
  importerData.row_set &&
  importerData.row_set.row_desc &&
  any(isGeoColumn, importerData.row_set.row_desc)

export const pickPreviewFileBasedOnTypeOfImport = (
  filesToUpload,
  typeOfImport
) =>
  typeOfImport === "multiFileGeo"
    ? `${parseFileName(filesToUpload[0])}.shp`
    : filesToUpload[0]

export const uploadFilesBasedOnTypeOfImport = (filesToUpload, typeOfImport) =>
  typeOfImport === "multiFileGeo"
    ? [`${parseFileName(filesToUpload[0])}.shp`]
    : filesToUpload
