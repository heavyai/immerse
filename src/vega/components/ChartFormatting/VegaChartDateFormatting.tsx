// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

type DateOption = {
  value: string
  example: string
  label: string
}

export const dateFormatOptions: DateOption[] = [
  {
    label: "%Y-%m-%d",
    example: "2018-04-12",
    value: "%Y-%m-%d"
  },
  {
    label: "%m/%d/%Y",
    example: "04/12/2018",
    value: "%m/%d/%Y"
  },
  {
    label: "%H:%M:%S",
    example: "15:46:25",
    value: "%H:%M:%S"
  },
  {
    label: "%H:%M:%S.%L",
    example: "15:46:25.146",
    value: "%H:%M:%S.%L"
  },
  {
    label: "%B %d, %Y",
    example: "April 12, 2018",
    value: "%B %d, %Y"
  },
  {
    label: "%y",
    example: "18",
    value: "%y"
  },
  { label: "%B", example: "April", value: "%B" },
  { label: "%A", example: "Thursday", value: "%A" },
  {
    label: "%c",
    example: "4/12/2018, 3:48:44 PM",
    value: "%c"
  },
  {
    label: "%Lms",
    example: "740ms",
    value: "%Lms"
  },
  {
    label: "%H:%M:%S:%L",
    example: "15:46:25:740",
    value: "%H:%M:%S:%L"
  }
]
