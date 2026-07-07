// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
import { SimpleSelect } from "react-selectize"
import { contains } from "ramda"
import { Dimension, Measure } from "constants/prop-types"

export interface DateOption {
  value: string
  example: string
  label: string
}

const dateFormatOptions: DateOption[] = [
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

interface Props {
  label: string
  selector?: Dimension | Measure
  placeholder?: string
  onValueChange: (option: DateOption) => void
}

function restoreOnBackspace(option) {
  return option.label.slice(0, -1) // enter edit mode and remove last character on backspace
}

function renderOption(option) {
  if (option.newOption) {
    return (
      <div className="simple-option new">
        <span className="option-label-new">
          Use <span className="label-text">{option.label}</span>
        </span>
      </div>
    )
  } else {
    return (
      <div className="simple-option">
        <span className="option-label">{option.label}</span>
        <span className="option-value">{option.example}</span>
      </div>
    )
  }
}
const defaultSelector = {}
function createFromSearch(options, search) {
  if (
    search.length === 0 ||
    contains(
      options.map((option) => option.label),
      search
    )
  ) {
    return null
  } else {
    return { label: search, value: search, example: "" }
  }
}

const getDefaultValue = (selector: Dimension | Measure) =>
  selector.dateFormat
    ? {
        label: selector.dateFormat,
        example: "",
        value: selector.dateFormat
      }
    : null

const ChartDateFormatter = ({
  label,
  selector = defaultSelector,
  onValueChange
}: Props) => (
  <div className="chart-editor-section">
    <div>
      <div
        className="format-selector-wrapper"
        id={`date-format-${selector.value}`}
      >
        <div className="format-selector-label">
          <span className="format-selector-label-agg">
            {selector.timeBin ? `${selector.timeBin} ` : ""}
          </span>
          <span className="format-selector-label-name">{label}</span>
        </div>
        <SimpleSelect
          theme="format-selector"
          value={getDefaultValue(selector)}
          options={dateFormatOptions}
          restoreOnBackspace={restoreOnBackspace}
          placeholder={"Enter a format or select a preset"}
          renderOption={renderOption}
          createFromSearch={createFromSearch}
          onValueChange={onValueChange}
        />
      </div>
    </div>
  </div>
)

export default ChartDateFormatter
