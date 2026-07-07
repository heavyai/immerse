// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  TCopyParams,
  TSourceType
} from "@heavyai/connector/dist/browser-connector"
import { parseExtension } from "../../table-importer/table-importer-helpers"
import { IMPORT_FILE_TYPES } from "../../../constants/import-file-types"
import Services from "services/immerse"

export const parseFilenameForSourceType = (
  filename: string
): TSourceType | null => {
  switch (IMPORT_FILE_TYPES[parseExtension(filename)]) {
    case "parquet":
      return TSourceType.PARQUET_FILE
    case "multiFileGeo":
    case "singleFileGeo":
      return TSourceType.GEO_FILE
    case "standard":
      return TSourceType.DELIMITED_FILE
    case "rasterMain":
    case "rasterExtra":
      return TSourceType.RASTER_FILE
    default:
      return null
  }
}

export const parseArchiveForSourceType = async (
  filename: string,
  copyParams?: TCopyParams
): Promise<TSourceType | null> => {
  const connector = Services.get("DbCon")
  try {
    const filenames =
      (await connector.getFilesInArchiveAsync(
        filename,
        copyParams || new TCopyParams()
      )) || []
    const checkForSourceType = (sourceType: TSourceType) =>
      filenames.some(
        (fn: string) => parseFilenameForSourceType(fn) === sourceType
      )
    if (checkForSourceType(TSourceType.RASTER_FILE)) {
      return TSourceType.RASTER_FILE
    }
    if (checkForSourceType(TSourceType.GEO_FILE)) {
      return TSourceType.GEO_FILE
    }
    if (checkForSourceType(TSourceType.PARQUET_FILE)) {
      return TSourceType.PARQUET_FILE
    }
    if (checkForSourceType(TSourceType.DELIMITED_FILE)) {
      return TSourceType.DELIMITED_FILE
    }
    return null
  } catch (error) {
    // do nothing. unable to determine based on provided archive
    return null
  }
}

export const filenameToSourceTypeHeuristics = async (
  filename: string,
  copyParams?: TCopyParams
): Promise<TSourceType | null> => {
  const filenameParseResult = parseFilenameForSourceType(filename)
  if (filenameParseResult === null) {
    const archiveParseResult = await parseArchiveForSourceType(
      filename,
      copyParams
    )
    if (archiveParseResult === TSourceType.RASTER_FILE) {
      throw new Error(
        "Import of rasters from archives is not currently supported. Please uncompress the archive and import the contained raster files."
      )
    }
    return archiveParseResult
  }
  return filenameParseResult
}

export const archiveContainsGeoFile = async (
  filename: string,
  copyParams?: TCopyParams
): Promise<string | boolean> => {
  const connector = Services.get("DbCon")
  const geoFilePath = await connector.getFirstGeoFileInArchiveAsync(
    filename,
    copyParams || new TCopyParams()
  )
  // If it's a full path where the geo file can be found on the server, the archive is geo -
  // If it just returns the same input fileName back again, it is not
  return geoFilePath !== filename ? geoFilePath : false
}
