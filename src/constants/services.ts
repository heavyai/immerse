// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpHeaders, HttpRequestMethod } from "http-core-constants"
const { POST, GET, DELETE, PATCH } = HttpRequestMethod
export const HTTP_METHOD_POST = POST
export const HTTP_METHOD_PATCH = PATCH
export const HTTP_METHOD_DELETE = DELETE
export const HTTP_METHOD_GET = GET
const HTTP_UTF_8_CHARSET = "charset=UTF-8"
const HTTP_HEADER_NAME_CONTENT_TYPE = HttpHeaders.CONTENT_TYPE
const HTTP_CONTENT_TYPE_JSON = "application/json"
export const BASE_FETCH_CONFIG: { credentials: "include" } = {
  credentials: "include"
}
export const JSON_HEADERS = {
  [HTTP_HEADER_NAME_CONTENT_TYPE]: `${HTTP_CONTENT_TYPE_JSON}; ${HTTP_UTF_8_CHARSET}`
}

const JL_PORT = 9999
const JL_TOKEN =
  "ea436a31623ee0c6ef25f8f340fcf3bdd17f914260dc3e17620ae04f93dfbb3c"

export const JL_DESKTOP_URI = `http://localhost:${JL_PORT}/lab/tree/notebooks?token=${JL_TOKEN}`
export const JL_DESKTOP_EXAMPLE_URI = `http://localhost:${JL_PORT}/lab/tree/notebooks/00_Connection_Template.ipynb?token=${JL_TOKEN}`
