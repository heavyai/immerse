// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const canvas = document.createElement("canvas")
const canvasContext = canvas.getContext("2d")

// Taken from https://medium.com/@CarysMills/wrapping-svg-text-without-svg-2-ecbfb58f7ba4

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
  const words = text.split(/\s+/)
  const completedLines: string[] = []
  let currentLine = ""

  words.forEach((word) => {
    let wordLength = getTextWidth(word, font)
    if (wordLength > maxWidth) {
      if (currentLine) {
        completedLines.push(currentLine)
      }

      currentLine = word[0]
      for (let i = 1; i < word.length; i += 1) {
        const next = `${currentLine}${word[i]}`
        wordLength = getTextWidth(next, font)
        if (wordLength > maxWidth) {
          completedLines.push(currentLine)
          currentLine = word[i]
        } else {
          currentLine = next
        }
      }
    } else {
      const nextLine = currentLine ? `${currentLine} ${word}` : word
      const nextLineLength = getTextWidth(nextLine, font)

      if (nextLineLength > maxWidth) {
        completedLines.push(currentLine)
        currentLine = word
      } else {
        currentLine = nextLine
      }
    }
  })

  if (currentLine) {
    completedLines.push(currentLine)
  }

  return completedLines
}
