// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import startOfToday from "date-fns/startOfToday"
import parse from "date-fns/parse"
import { makeBinStartDate, makeBinEndDate } from "./utils-date-bin"

const dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSX"

const parseDate = (dateStr) => parse(dateStr, dateFormat, startOfToday())

describe("crossfilter date bin utils", () => {
  it("can makeBinStartDate with ms offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const msOne = makeBinStartDate(startDate, "millisecond", 1)
    expect(msOne.toISOString()).toEqual("2021-03-01T00:00:00.001Z")

    const msFive = makeBinStartDate(startDate, "millisecond", 5)
    expect(msFive.toISOString()).toEqual("2021-03-01T00:00:00.005Z")
  })

  it("can makeBinStartDate with s offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const msOne = makeBinStartDate(startDate, "second", 1)
    expect(msOne.toISOString()).toEqual("2021-03-01T00:00:01.000Z")

    const msFive = makeBinStartDate(startDate, "second", 5)
    expect(msFive.toISOString()).toEqual("2021-03-01T00:00:05.000Z")
  })

  it("can makeBinStartDate with m offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const msOne = makeBinStartDate(startDate, "minute", 1)
    expect(msOne.toISOString()).toEqual("2021-03-01T00:01:00.000Z")

    const msFive = makeBinStartDate(startDate, "minute", 5)
    expect(msFive.toISOString()).toEqual("2021-03-01T00:05:00.000Z")
  })

  it("can makeBinStartDate with h offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const msOne = makeBinStartDate(startDate, "hour", 1)
    expect(msOne.toISOString()).toEqual("2021-03-01T01:00:00.000Z")

    const msFive = makeBinStartDate(startDate, "hour", 5)
    expect(msFive.toISOString()).toEqual("2021-03-01T05:00:00.000Z")
  })

  it("can makeBinStartDate with d offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const msOne = makeBinStartDate(startDate, "day", 1)
    expect(msOne.toISOString()).toEqual("2021-03-02T00:00:00.000Z")

    const msFive = makeBinStartDate(startDate, "day", 5)
    expect(msFive.toISOString()).toEqual("2021-03-06T00:00:00.000Z")
  })

  it("can makeBinStartDate with month offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const msOne = makeBinStartDate(startDate, "month", 1)
    expect(msOne.toISOString()).toEqual("2021-04-01T00:00:00.000Z")

    const msFive = makeBinStartDate(startDate, "month", 5)
    expect(msFive.toISOString()).toEqual("2021-08-01T00:00:00.000Z")
  })

  it("can makeBinStartDate with quarter offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const msOne = makeBinStartDate(startDate, "quarter", 1)
    expect(msOne.toISOString()).toEqual("2021-04-01T00:00:00.000Z")

    const msFive = makeBinStartDate(startDate, "quarter", 5)
    expect(msFive.toISOString()).toEqual("2022-04-01T00:00:00.000Z")
  })

  it("can makeBinStartDate with year offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const msOne = makeBinStartDate(startDate, "year", 1)
    expect(msOne.toISOString()).toEqual("2022-01-01T00:00:00.000Z")

    const msFive = makeBinStartDate(startDate, "year", 5)
    expect(msFive.toISOString()).toEqual("2026-01-01T00:00:00.000Z")
  })

  it("can makeBinStartDate with decade offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const msOne = makeBinStartDate(startDate, "decade", 1)
    expect(msOne.toISOString()).toEqual("2030-01-01T00:00:00.000Z")

    const msFive = makeBinStartDate(startDate, "decade", 5)
    expect(msFive.toISOString()).toEqual("2070-01-01T00:00:00.000Z")
  })

  it("can makeBinEndDate with ms offset", () => {
    const now = new Date()
    const endBin = makeBinEndDate(now, "millisecond")
    expect(endBin).toEqual(now)
  })

  it("can makeBinEndDate with sec offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const endBin = makeBinEndDate(startDate, "second")
    expect(endBin.toISOString()).toEqual("2021-03-01T00:00:00.999Z")
  })

  it("can makeBinEndDate with min offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const endBin = makeBinEndDate(startDate, "minute")
    expect(endBin.toISOString()).toEqual("2021-03-01T00:00:59.999Z")
  })

  it("can makeBinEndDate with hour offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const endBin = makeBinEndDate(startDate, "hour")
    expect(endBin.toISOString()).toEqual("2021-03-01T00:59:59.999Z")
  })

  it("can makeBinEndDate with day offset", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const endBin = makeBinEndDate(startDate, "day")
    expect(endBin.toISOString()).toEqual("2021-03-01T23:59:59.999Z")
  })

  it("can makeBinEndDate with month offset in 31 day month", () => {
    const startDate = parseDate("2021-03-01T00:00:00.000Z")
    const endBin = makeBinEndDate(startDate, "month")
    expect(endBin.toISOString()).toEqual("2021-03-31T23:59:59.999Z")
  })

  it("can makeBinEndDate with month offset in 30 day month", () => {
    const startDate = parseDate("2021-04-01T00:00:00.000Z")
    const endBin = makeBinEndDate(startDate, "month")
    expect(endBin.toISOString()).toEqual("2021-04-30T23:59:59.999Z")
  })

  it("can makeBinEndDate with month offset in 28 day month", () => {
    const startDate = parseDate("2021-02-01T00:00:00.000Z")
    const endBin = makeBinEndDate(startDate, "month")
    expect(endBin.toISOString()).toEqual("2021-02-28T23:59:59.999Z")
  })

  it("can makeBinEndDate with month offset in 29 day month", () => {
    const startDate = parseDate("2020-02-01T00:00:00.000Z")
    const endBin = makeBinEndDate(startDate, "month")
    expect(endBin.toISOString()).toEqual("2020-02-29T23:59:59.999Z")
  })

  it("can makeBinEndDate with quarter offset", () => {
    const startDate = parseDate("2020-01-01T00:00:00.000Z")
    const endBin = makeBinEndDate(startDate, "quarter")
    expect(endBin.toISOString()).toEqual("2020-03-31T23:59:59.999Z")
  })

  it("can makeBinEndDate with year offset", () => {
    const startDate = parseDate("2020-01-01T00:00:00.000Z")
    const endBin = makeBinEndDate(startDate, "year")
    expect(endBin.toISOString()).toEqual("2020-12-31T23:59:59.999Z")
  })

  it("can makeBinEndDate with decade offset", () => {
    const startDate = parseDate("2020-01-01T00:00:00.000Z")
    const endBin = makeBinEndDate(startDate, "decade")
    expect(endBin.toISOString()).toEqual("2029-12-31T23:59:59.999Z")
  })
})
