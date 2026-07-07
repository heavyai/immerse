// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { keys } from "ramda"

export const IMPORT_FILE_TYPES_UNFORMATTED = {
  standard: [
    "csv",
    "tsv",
    "txt",
    "csv.zip",
    "csv.7z",
    "csv.gz",
    "csv.bz2",
    "tsv.zip",
    "tsv.7z",
    "tsv.gz",
    "tsv.bz2",
    "txt.zip",
    "txt.7z",
    "txt.gz",
    "txt.bz2"
  ],
  parquet: ["parquet"],
  rasterMain: ["tif", "hdr", "gif", "jpg", "jp2", "png"],
  rasterExtra: ["tfw", "gfw", "jgw", "j2w", "pgw"],
  singleFileGeo: [
    "kml",
    "kmz",
    "kml.zip",
    "kml.gz",
    "kml.7z",
    "kml.bz2",
    "geojson",
    "json",
    "geojson.gz",
    "json.gz",
    "geojson.zip",
    "json.zip",
    "geojson.7z",
    "json.7z",
    "geojson.bz2",
    "json.bz2"
  ],
  multiFileGeo: [
    "shp",
    "shx",
    "dbf",
    "prj",
    "sbn",
    "sbx",
    "fbn",
    "fbx",
    "ain",
    "aih",
    "ixs",
    "mxs",
    "atx",
    "shp.xml",
    "cpg",
    "qix"
  ]
}

// Some files are necessary to be uploaded to the backend for detect_column_types
// but they will cause an error if you try to import them
export const DONT_CALL_IMPORT_EXTS = [
  ...IMPORT_FILE_TYPES_UNFORMATTED.rasterExtra,
  "prj",
  "dbf",
  "shx",
  "cpg"
]

const createImportableFileTypes = () => {
  const result = {}
  keys(IMPORT_FILE_TYPES_UNFORMATTED).forEach((key) => {
    IMPORT_FILE_TYPES_UNFORMATTED[key].forEach((ext) => {
      result[ext] = key
    })
  })
  return result
}

export const IMPORT_FILE_TYPES = createImportableFileTypes()

export const IMPORT_GEO_TYPES = {
  singleFileGeo: true,
  multiFileGeo: true
}

export const SHAPE_FILE_REQUIREMENTS = {
  shp: true,
  shx: true,
  dbf: true
}

// For raster imports:
// 1. If a column with any of these names is uploaded, it cannot be renamed.
// 2. No column can be renamed to any of these values.
export const RESERVED_RASTER_COLUMN_NAMES = new Set([
  "raster_lat",
  "raster_lon",
  "raster_x",
  "raster_y",
  "raster_angle"
])
