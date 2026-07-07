// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Get the bounding box that encompasses one or more elements
 * @param elements - HTML elements to include in the bounding box calculation
 */
export const createDomRectFromElements = (
  elements: Array<HTMLElement | null>
): DOMRect | null => {
  let allBoundingBoxes: any = {}
  elements
    .filter((e) => Boolean(e))
    .forEach((e, i) => {
      const { top, left, bottom, right } = e.getBoundingClientRect()
      if (i === 0) {
        allBoundingBoxes = {
          top,
          left,
          bottom,
          right
        }
      } else {
        allBoundingBoxes.top = Math.min(allBoundingBoxes.top, top)
        allBoundingBoxes.left = Math.min(allBoundingBoxes.left, left)
        allBoundingBoxes.bottom = Math.max(allBoundingBoxes.bottom, bottom)
        allBoundingBoxes.right = Math.max(allBoundingBoxes.right, right)
      }
    })

  if (
    typeof allBoundingBoxes.top === "number" &&
    typeof allBoundingBoxes.bottom === "number" &&
    typeof allBoundingBoxes.left === "number" &&
    typeof allBoundingBoxes.right === "number"
  ) {
    const x = allBoundingBoxes.left
    const y = allBoundingBoxes.top
    const width = allBoundingBoxes.right - allBoundingBoxes.left
    const height = allBoundingBoxes.bottom - allBoundingBoxes.top
    return new DOMRect(x, y, width, height)
  }
  return null
}

/** Check if two DOMRects are equal */
export const isDomRectEqual = (a?: DOMRect | null, b?: DOMRect | null) => {
  if (!a || !b) {
    return a === b
  } else {
    return (
      a.x === b.x &&
      a.y === b.y &&
      a.width === b.width &&
      a.height === b.height &&
      a.top === b.top &&
      a.right === b.right &&
      a.bottom === b.bottom &&
      a.left === b.left
    )
  }
}
