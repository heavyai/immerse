// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import APP_CONFIG from "constants/app-config"
import {
  BASE_FETCH_CONFIG,
  HTTP_METHOD_POST,
  JSON_HEADERS
} from "../constants/services"

/**
 * This service is used to access the IQ Service
 * to generate a query from a question
 * or to generate an analysis of a question
 *  */

export type IQQuery = {
  question: string // The question to be converted to a query
  tables: string[] // Names of tables
}
export type IQAutoQuery = {
  question: string // The question to be converted to a query
  allowed_tables?: string[] // Names of tables to choose from (optional)
}

export type IQQuestion = {
  question: string // The question to be converted to a question
  tables: string[] // Names of tables
}
export type IQAnswer = {
  question: string // The question to be converted to a question
  query: string // Query to generate answer from
  tables: string[] // Names of tables
}

export type IQFeedback = {
  feedback_id: string
  score: number
  comment: string
}

export const generateIQQuery = async (iqQueryObj: IQQuery | {}) =>
  await fetch(`${APP_CONFIG.url}/iq/query`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify(iqQueryObj)
    }
  })

export const generateIQAutoQuery = async (iqAutoQuery: IQAutoQuery) =>
  await fetch(`${APP_CONFIG.url}/iq/auto/query`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify(iqAutoQuery)
    }
  })

export const generateIQAnalysis = async (iqQuestionObj: IQQuestion | {}) =>
  await fetch(`${APP_CONFIG.url}/iq/question`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify(iqQuestionObj)
    }
  })

export const generateIQAnswer = async (iqAnswerObj: IQAnswer | {}) =>
  await fetch(`${APP_CONFIG.url}/iq/answer`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify(iqAnswerObj)
    }
  })

export const submitIQFeedback = async (iqFeedbackObj: IQFeedback) =>
  await fetch(`${APP_CONFIG.url}/iq/submit-feedback`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify(iqFeedbackObj)
    }
  })
