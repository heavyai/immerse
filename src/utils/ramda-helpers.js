// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  addIndex,
  concat,
  filter,
  flip,
  identity,
  intersection,
  length,
  map,
  merge
} from "ramda"

export const filterIdx = addIndex(filter)
export const mapIdx = addIndex(map)
export const mergeR = flip(merge)
export const concatR = flip(concat)
export const intersects = (a, b) => length(intersection(a, b)) > 0
export function log(inspected) {
  // eslint-disable-next-line no-console
  console.log(identity(inspected))
  return inspected
}
