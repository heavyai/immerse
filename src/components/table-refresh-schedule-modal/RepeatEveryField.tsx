// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect, useMemo } from "react"
import { TextField } from "widgets/text-field/TextField"
import MultiSelect from "widgets/multi-select/Multi-select"

type RepeatEveryFieldProps = {
  idPrefix: string
  value: string | null // nD, nH (n = <number>, D = days, H = hours)
  onChange: (newInterval: string) => void
}

const RepeatEveryField: FC<RepeatEveryFieldProps> = ({
  idPrefix,
  value,
  onChange
}) => {
  const [intervalType, setIntervalType] = useState<"H" | "D">(
    (value || "").includes("H") ? "H" : "D"
  )

  useEffect(() => {
    // if parent happens to change the value, we want to update accordingly
    if (value && !value.includes(intervalType)) {
      setIntervalType(value.includes("H") ? "H" : "D")
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [value])

  const numberVal = useMemo(
    () =>
      value && value.length > 1 ? value.replace(/(^\d+)(.+$)/i, "$1") : "",
    [value]
  )

  return (
    <div className="table-refresh-form-row">
      <div className="table-refresh-form-col">
        <TextField
          id={`${idPrefix}-number`}
          type="number"
          value={numberVal}
          onChange={(e) => {
            const newNumberVal = e.target.value
            if (!newNumberVal || /^\d*$/.test(newNumberVal)) {
              onChange(`${newNumberVal}${intervalType}`)
            }
          }}
        />
      </div>
      <div className="table-refresh-form-col">
        <MultiSelect
          id={`${idPrefix}-type`}
          options={[
            { label: "Hours", value: "H" },
            { label: "Days", value: "D" }
          ]}
          value={{
            label: intervalType === "H" ? "Hours" : "Days",
            value: intervalType
          }}
          onChange={({ value: newIntervalType }: { value: "H" | "D" }) => {
            setIntervalType(newIntervalType)
            onChange(`${numberVal}${newIntervalType}`)
          }}
          selectProps={{ noLabel: true }}
          menuPortalTarget={document.body}
          noLabel
        />
      </div>
    </div>
  )
}

export default RepeatEveryField
