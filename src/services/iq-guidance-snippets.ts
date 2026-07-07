// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import APP_CONFIG from "constants/app-config"
import {
  BASE_FETCH_CONFIG,
  HTTP_METHOD_POST,
  JSON_HEADERS
} from "../constants/services"

/**
 * Service to set/fetch IQ guidance (RAG) snippets
 */

// Gets a list of all snippets
export const listSnippets = async () =>
  await fetch(`${APP_CONFIG.url}/guidance/list`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS
    }
  })

// Inserts one or more snippets
export const insertSnippets = async (snippets: string[]) =>
  await fetch(`${APP_CONFIG.url}/guidance/insert`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify({ snippets })
    }
  })

// Updates the text of a single existing snippet
export const updateSnippet = async (snippet: string, snippetId: string) =>
  await fetch(`${APP_CONFIG.url}/guidance/update`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify({ snippet, snippet_id: snippetId })
    }
  })

// Deletes one or more snippets
export const deleteSnippets = async (snippetIds: string[]) =>
  await fetch(`${APP_CONFIG.url}/guidance/delete`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify({ snippet_ids: snippetIds })
    }
  })
