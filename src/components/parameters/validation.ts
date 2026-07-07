// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isEmpty } from "lodash"
import { ParameterTypes } from "components/parameters/parameters-types"
import { NUMBER_STEP_PRECISIONS } from "components/parameters/constants"

// Allows alphanumeric characters, underscores, hyphens, and spaces, but no spaces at the beginning of the string.
// Should be both beginning and end of the string, but as mentioned below, Safari poops on zero-width assertions.
// This is what I wanted to use:
// const paramNameString = "(?! )\\w+[\\w ]*(?<! )"
//
// This is just extra insurance anyway, as Parameter Manager already trims parameter names before submitting.
export const paramNameString = "(?! )[-\\w]+[-\\w ]*"
const paramNameRegex = new RegExp(`^${paramNameString}$`)

// Custom sources use parameters under the hood but have the addition restriction of no spaces
export const sourceNameRegex = new RegExp("^(?! )\\w+[\\w]*$")

// this is the regex we -should- use, if Safari supported zero-width assertions.
// const varFinderRegexPattern = `(?<!\\\\)\\\${(${paramNameString})}`
export const varFinderRegexPattern = `(.)?\\\${(${paramNameString})}`
export const varExtractRegex = new RegExp(`\\\${(${paramNameString})}`)

export const isValidName = (name) => Boolean(name.match(paramNameRegex))

export const isValidRequiredValue = (defaultValue) => Boolean(defaultValue)

const PARAMETER_TYPE_VALIDATORS = {
  [ParameterTypes.TEXT]: {
    defaultValue: [
      {
        isValid: (parameter) => isValidRequiredValue(parameter.defaultValue),
        error: "Default value is required"
      }
    ]
  },
  [ParameterTypes.TABLE]: {
    defaultValue: [
      {
        isValid: (parameter) => isValidRequiredValue(parameter.defaultValue),
        error: "Default value is required"
      }
    ]
  },
  [ParameterTypes.NUMBER]: {
    defaultValue: [
      {
        isValid: (parameter) => isValidRequiredValue(parameter.defaultValue),
        error: "Default value is required"
      },
      {
        isValid: (parameter) => !isNaN(parameter.defaultValue),
        error: "Default value should be a number"
      },
      {
        isValid: (parameter) =>
          !parameter.min ||
          Number(parameter.defaultValue) >= Number(parameter.min),
        error: "Default value should be greater than the minimum"
      },
      {
        isValid: (parameter) =>
          !parameter.max ||
          Number(parameter.defaultValue) <= Number(parameter.max),
        error: "Default value should be less than the maximum"
      }
    ],
    min: [
      {
        isValid: (parameter) => !isNaN(parameter.min),
        error: "Minimum should be a number"
      },
      {
        isValid: (parameter) =>
          !(parameter.min && parameter.max) ||
          Number(parameter.min) < Number(parameter.max),
        error: "Minimum should be less than maximum"
      }
    ],
    max: [
      {
        isValid: (parameter) => !isNaN(parameter.max),
        error: "Maximum should be a number"
      },
      {
        isValid: (parameter) =>
          !(parameter.min && parameter.max) ||
          Number(parameter.min) < Number(parameter.max),
        error: "Minimum should be less than maximum"
      }
    ],
    stepPrecision: [
      {
        isValid: (parameter) => {
          return Object.values(NUMBER_STEP_PRECISIONS).includes(
            parameter.stepPrecision === NUMBER_STEP_PRECISIONS.AUTO
              ? parameter.stepPrecision
              : parameter.stepPrecision.toString()
          )
        },
        error: "Slider Step Size must be valid."
      }
    ]
  },
  [ParameterTypes.COLUMN]: {
    source: [
      {
        isValid: (parameter) => isValidRequiredValue(parameter.source),
        error: "Source is required"
      }
    ],
    defaultValue: [
      {
        isValid: (parameter) => isValidRequiredValue(parameter.defaultValue),
        error: "Default column is required"
      }
    ]
  },
  [ParameterTypes.COLUMN_VALUE]: {
    source: [
      {
        isValid: (parameter) => isValidRequiredValue(parameter.source),
        error: "Source is required"
      }
    ],
    column: [
      {
        isValid: (parameter) => isValidRequiredValue(parameter.column),
        error: "Column is required"
      }
    ],
    defaultValue: [
      {
        isValid: (parameter) => isValidRequiredValue(parameter.defaultValue),
        error: "Default column value is required"
      }
    ]
  },
  [ParameterTypes.COORDINATE]: {
    defaultValue: [
      {
        isValid: (parameter) => isValidRequiredValue(parameter.defaultValue),
        error: "Default value is required"
      }
    ],
    parentChartId: [
      {
        isValid: (parameter) => !isNaN(parameter.parentChartId),
        error: "Parent chart ID is required"
      }
    ],
    shape: [
      {
        isValid: (parameter) => isValidRequiredValue(parameter.shape),
        error: "Shape type is required"
      }
    ],
    index: [
      {
        isValid: (parameter) => !isNaN(parameter.index),
        error: "Index is required"
      }
    ]
  }
}

export const getParameterPropertyError = (parameter, property) => {
  const validatorsForType =
    PARAMETER_TYPE_VALIDATORS[parameter.type || ParameterTypes.TEXT]

  const invalidProperty = validatorsForType[property].find(
    (propertyValidator) => !propertyValidator.isValid(parameter)
  )

  return invalidProperty?.error
}

export const getParameterErrors = (parameter) => {
  const validatorsForType =
    PARAMETER_TYPE_VALIDATORS[parameter.type || ParameterTypes.TEXT]

  const parameterErrors = Object.keys(validatorsForType).reduce(
    (errors, property) => {
      const invalidProperty = validatorsForType[property].find(
        (propertyValidator) => !propertyValidator.isValid(parameter)
      )

      if (invalidProperty) {
        errors[property] = invalidProperty.error
      }

      return errors
    },
    {}
  )

  return parameterErrors
}

export const isValidParameter = (parameter) =>
  isValidName(parameter.name) && isEmpty(getParameterErrors(parameter))
