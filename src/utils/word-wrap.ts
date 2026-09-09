// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const canvas = document.createElement("canvas")
const canvasContext = canvas.getContext("2d")

/**
 * Calculates the width of text
 * @param text The text
 * @param font The font to use (CSS string)
 * @returns the width of the text
 */
export function getTextWidth(text: string, font = "9px inherit"): number {
  canvasContext.font = font
  return canvasContext.measureText(text).width
}

function splitLongWord(word: string, maxWidth: number, font: string): string[] {
  const chunks: string[] = []
  let chunk = ""

  for (const char of word) {
    const candidate = chunk + char
    if (chunk && getTextWidth(candidate, font) > maxWidth) {
      chunks.push(chunk)
      chunk = char
    } else {
      chunk = candidate
    }
  }

  if (chunk) {
    chunks.push(chunk)
  }

  return chunks
}

/**
 * Calculates word wrapping.
 * @param text The text to wrap
 * @param maxWidth The maximum width
 * @param font The font to use (CSS string)
 * @returns an array of strings where each element is a line of wrapped text.
 */
export function wordWrap(
  text: string,
  maxWidth: number,
  font = "9px inherit"
): string[] {
  const lines: string[] = []
  let line = ""

  text.split(/\s+/).forEach((word) => {
    const candidate = line ? `${line} ${word}` : word

    if (getTextWidth(candidate, font) <= maxWidth) {
      line = candidate
      return
    }

    if (line) {
      lines.push(line)
      line = ""
    }

    if (getTextWidth(word, font) <= maxWidth) {
      line = word
      return
    }

    const chunks = splitLongWord(word, maxWidth, font)
    lines.push(...chunks.slice(0, -1))
    line = chunks[chunks.length - 1] ?? ""
  })

  if (line) {
    lines.push(line)
  }

  return lines
}
