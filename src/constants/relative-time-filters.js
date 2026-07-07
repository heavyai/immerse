// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

function now() {
  return {
    now: true
  }
}

function dateDiff(datepart, number, add) {
  return {
    operator: "DATEDIFF",
    datepart,
    number,
    add
  }
}

function dateAdd(datepart, number, date) {
  return {
    datepart,
    number,
    date
  }
}

export const relativeTimeFilters = [
  {
    label: "Today",
    lower: dateAdd("day", dateDiff("day", 0), 0),
    upper: now()
  },
  {
    label: "Last 10 Min.",
    lower: dateAdd("minute", -10),
    upper: now()
  },
  {
    label: "Last 30 Min.",
    lower: dateAdd("minute", -30),
    upper: now()
  },

  {
    label: "Last 60 Min.",
    lower: dateAdd("hour", -1),
    upper: now()
  },
  {
    label: "Yesterday",
    lower: dateAdd("day", dateDiff("day", 0, -1), 0),
    upper: dateAdd("day", dateDiff("day", 0), 0)
  },
  {
    label: "This Week",
    lower: dateAdd("week", dateDiff("week", 0), 0),
    upper: now()
  },
  {
    label: "Last Week",
    lower: dateAdd("week", dateDiff("week", 0, -1), 0),
    upper: dateAdd("week", dateDiff("week", 0), 0)
  },
  {
    label: "This Month",
    lower: dateAdd("month", dateDiff("month", 0), 0),
    upper: now()
  },
  {
    label: "Last Month",
    lower: dateAdd("month", dateDiff("day", 0, -1), 0),
    upper: dateAdd("month", dateDiff("day", 0), 0)
  },
  {
    label: "Last 7 Days",
    lower: dateAdd("day", dateDiff("day", 0, -7), 0),
    upper: now()
  },
  {
    label: "Last 30 Days",
    lower: dateAdd("day", dateDiff("day", 0, -30), 0),
    upper: now()
  },
  {
    label: "This Quarter",
    lower: dateAdd("quarter", dateDiff("quarter", 0), 0),
    upper: now()
  },
  {
    label: "Last Quarter",
    lower: dateAdd("quarter", dateDiff("quarter", 0, -1), 0),
    upper: dateAdd("quarter", dateDiff("quarter", 0), 0)
  },
  {
    label: "Year To Date",
    lower: dateAdd("year", dateDiff("year", 0), 0),
    upper: now()
  },
  {
    label: "Last Year",
    lower: dateAdd("year", dateDiff("year", 0, -1), 0),
    upper: dateAdd("year", dateDiff("year", 0), 0)
  }
]
export default relativeTimeFilters
