// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-shadow */
import promisifyChartCreation from "charts/utils/promisify-chart-creation"
import { noop } from "utils/helpers"

describe("promisifyChartCreation", () => {
  const crossFilter = {}
  const dispatch = noop
  const chartSpec = {}
  const node = {}

  it("resolves chart creation promise to the chart", (done) => {
    const chart = {}
    const create = (crossFilter, dispatch) => (chartSpec, node, cb) =>
      cb(null, chart)
    promisifyChartCreation(create)(crossFilter, dispatch)(chartSpec, node).then(
      (createdChart) => {
        expect(createdChart).toEqual(chart)
        done()
      }
    )
  })

  it("rejects chart creation promise with the error", (done) => {
    const create = (crossFilter, dispatch) => (chartSpec, node, cb) =>
      cb("badness")
    promisifyChartCreation(create)(crossFilter, dispatch)(
      chartSpec,
      node
    ).catch((error) => {
      expect(error).toEqual("badness")
      done()
    })
  })
})
