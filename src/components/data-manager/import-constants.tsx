// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import IconCsvDocument from "components/svg-icons/icon-csv-document"
import IconCompressedFile from "components/svg-icons/icon-compressed-file"
import IconGeoPin from "components/svg-icons/icon-geo-pin"
import IconGeoFolder from "components/svg-icons/icon-geo-folder"
import IconBinaryFile from "components/svg-icons/icon-binary-file"

export const FILE_TYPES = {
  DELIMITED: "DELIMITED",
  COMPRESSED: "COMPRESSED",
  GEO: "GEO",
  GEO_MULTI: "GEO_MULTI",
  BINARY: "BINARY"
}

// TODO: use npm package 'mime' to determine file types:
//  https://www.npmjs.com/package/mime
export const IMPORT_FILE_CATEGORIES = {
  [FILE_TYPES.DELIMITED]: {
    label: "Delimited files",
    extensions: ["csv", "tsv", "txt"],
    icon: <IconCsvDocument />
  },
  [FILE_TYPES.COMPRESSED]: {
    label: "Compressed files",
    extensions: ["tar", "zip", "zip-7", "gzip", "bzip2", "rar", "tgz"],
    icon: <IconCompressedFile />
  },
  [FILE_TYPES.GEO]: {
    label: "GEO files",
    extensions: ["kml", "kmz", "geojson", "json", "csv"],
    icon: <IconGeoPin />
  },
  [FILE_TYPES.GEO_MULTI]: {
    label: "GEO Multi files",
    extensions: [
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
      "xml",
      "cpg",
      "qix"
    ],
    icon: <IconGeoFolder />
  },
  [FILE_TYPES.BINARY]: {
    label: "Binary files",
    extensions: ["parquet"],
    icon: <IconBinaryFile />
  }
}
