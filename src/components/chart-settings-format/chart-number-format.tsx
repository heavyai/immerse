// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
import PropTypes from "prop-types"
import { SimpleSelect } from "react-selectize"
import { contains } from "ramda"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { CUSTOM_FORMATTER_TYPE } from "utils/auto-formatter"

ChartNumberFormat.propTypes = {
  measures: PropTypes.array,
  onValueChangeWithFormat: PropTypes.func
}

export const numberFormatOptions = [
  {
    label: "Basic",
    example: "1,234",
    hint: "",
    value: "custom-basic"
  },
  {
    label: "Imperial",
    example: "12B",
    hint: "",
    value: "custom-imperial"
  },
  {
    label: "Float",
    example: "1,234.57",
    hint: ",.2f",
    value: ",.2f"
  },
  {
    label: "Integer",
    example: "1,235",
    hint: ",.0f",
    value: ",.0f"
  },
  { label: "SI", example: "1.2K", hint: ".2s", value: ".2s" },
  {
    label: "Currency",
    example: "-$1234.57",
    hint: "-$.2f",
    value: "-$.2f"
  },
  {
    label: "Currency with ( )",
    example: "($1234.57)",
    hint: "($.2f",
    value: "($.2f"
  },
  {
    label: "Force SI suffix",
    example: "1,234.57K",
    hint: ",.2s|K",
    value: ",.2s|K"
  },
  {
    label: "Percent float",
    example: "123,457.00%",
    hint: ",.2%",
    value: ",.2%"
  },
  {
    label: "Percent",
    example: "1,234.57%",
    hint: "{,.2f}%",
    value: "{,.2f}%"
  },
  {
    label: "km/h unit",
    example: "1,234.57km/h",
    hint: "{,.2f}km/h",
    value: "{,.2f}km/h"
  },
  {
    label: "Bytes",
    example: "1234MiB",
    hint: "1024B=1KiB",
    value: CUSTOM_FORMATTER_TYPE.BYTES
  },
  {
    label: "Bytes",
    example: "1234MB",
    hint: "1024B=1KB",
    value: CUSTOM_FORMATTER_TYPE.BYTES_COMMON_SUFFIX
  }
]

const getFormatName = (format) => {
  const optionMatched = numberFormatOptions.filter(
    (option) => option.value === format
  )[0]
  return optionMatched ? optionMatched.label : format
}

export default function ChartNumberFormat({
  measures,
  onValueChangeWithFormat
}) {
  return (
    <div className="chart-editor-section">
      {Boolean(measures.length) && (
        <div>
          <div className="chart-editor-label sub-section">
            Measure Number Formatting
          </div>
          {measures.map((measure, idx) => (
            <div
              className="format-selector-wrapper"
              key={idx}
              id={`number-format-${idx}`}
            >
              <div className="format-selector-label">
                <span className="format-selector-label-agg">
                  {measure.aggType ? `${measure.aggType} ` : ""}
                </span>
                <span className="format-selector-label-name">
                  {process(measure.label, { useDisplayName: true })}
                </span>
              </div>
              <SimpleSelect
                theme="format-selector"
                value={
                  measure.numberFormat
                    ? {
                        label: getFormatName(measure.numberFormat),
                        example: "",
                        value: measure.numberFormat
                      }
                    : null
                }
                options={numberFormatOptions}
                restoreOnBackspace={function restoreOnBackspace(option) {
                  return option.label.slice(0, -1) // enter edit mode and remove last character on backspace
                }}
                placeholder={"Enter a format or select a preset"}
                filterOptions={function filterOptions(options, search) {
                  const lowercaseSearch = search.toLowerCase()
                  return options.filter(
                    (option) =>
                      option.hint.includes(search) ||
                      option.label.toLowerCase().includes(lowercaseSearch)
                  )
                }}
                renderOption={function renderOption(option) {
                  if (option.newOption) {
                    return (
                      <div className="simple-option new">
                        <span className="option-label-new">
                          Use custom format{" "}
                          <span className="label-text">{option.value}</span>
                        </span>
                      </div>
                    )
                  } else {
                    return (
                      <div className="simple-option">
                        <span className="option-label">{option.label}</span>
                        <span className="option-format-string">
                          {option.hint}
                        </span>
                        <span className="option-value">{option.example}</span>
                      </div>
                    )
                  }
                }}
                createFromSearch={function createFromSearch(options, search) {
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
                }}
                onValueChange={function onValueChange(option) {
                  const value = option && option.value
                  onValueChangeWithFormat(value, measure.index)
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
