// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { groupBy, mapObjIndexed, sum } from "ramda"

type Datum = {
  key0: string
  val: number
}

type PercentageDatum = {
  key0: string
  val: number
  absoluteval: number
}

export const percentageTransform = (data: Datum[]): PercentageDatum[] => {
  const stacks = groupBy((datum) => datum.key0, data)

  const stackTotals = mapObjIndexed(
    (stack) => sum(stack.map((dB) => Math.abs(dB.val))),
    stacks
  )

  return data.map((dB) => ({
    ...dB,
    val: dB.val / stackTotals[dB.key0],
    absoluteval: dB.val
  }))
}
