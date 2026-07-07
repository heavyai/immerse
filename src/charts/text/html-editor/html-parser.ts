// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-useless-escape */
import sanitizeHtml from "sanitize-html"
import { sanitizeOpts } from "../sanitize-opts"

/**
 * NOTE: This is a copy from https://github.com/benwinding/quill-html-edit-button
 * so we can sanitize the input on the FE appropriately to prevent js injection
 */
export function OutputHTMLParser(inputHtmlFromQuillPopup: string): string {
  return Compose(
    [
      Sanitize,
      ConvertMultipleSpacesToSingle,
      FixTagSpaceOpenTag,
      FixTagSpaceCloseTag,
      PreserveNewlinesBr,
      PreserveNewlinesPTags
    ],
    inputHtmlFromQuillPopup
  )
}

// Adding this to sanitize input coming from the html editor
export function Sanitize(input: string): string {
  return sanitizeHtml(input, sanitizeOpts)
}

export function ConvertMultipleSpacesToSingle(input: string): string {
  return input.replace(/\s+/g, " ").trim()
}

export function PreserveNewlinesBr(input: string): string {
  return input.replace(/<br([\s]*[\/]?>)/g, "<p> </p>")
}

export function PreserveNewlinesPTags(input: string): string {
  return input.replace(/<p><\/p>/g, "<p> </p>")
}

export function FixTagSpaceOpenTag(input: string): string {
  // Open tag remove space on inside
  return input.replace(/(<(?!\/)[\w=\."'\s]*>) /g, "$1")
}

export function FixTagSpaceCloseTag(input: string): string {
  // Close tag remove space on inside
  return input.replace(/ (<\/[\w]+>)/g, "$1")
}

export function Compose<T>(functions: Array<(input: T) => T>, input: T): T {
  return functions.reduce((acc, cur) => cur(acc), input)
}
