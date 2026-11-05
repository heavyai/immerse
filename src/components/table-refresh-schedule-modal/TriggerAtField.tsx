// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import moment from "moment"
import { DateTimeField } from "@immerse/ui"

type TriggerAtFieldProps = {
  id: string
  value: Date | null
  onChange: (newDate: Date | null) => void
}
export default function TriggerAtField({
  id,
  value,
  onChange
}: TriggerAtFieldProps) {
  return (
    <DateTimeField
      id={id}
      value={value ? moment(value).format("YYYY-MM-DDTHH:mm:ss.SSS") : ""}
      onChange={(next) =>
        onChange(next && moment(next).isValid() ? moment(next).toDate() : null)
      }
    />
  )
}
