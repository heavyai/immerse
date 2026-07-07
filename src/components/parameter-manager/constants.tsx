// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import CodeIcon from "components/svg-icons/icon-code"
import NumberIcon from "components/svg-icons/icon-number"
import ColumnIcon from "components/svg-icons/icon-column"
import ColumnValueIcon from "components/svg-icons/icon-column-value"

import { ParameterTypes } from "components/parameters/parameters-types"
import { NUMBER_STEP_PRECISIONS } from "../parameters/constants"
import { Icon } from "@rmwc/icon"

export const PENDING_PARAMETER_PROPERTIES = {
  name: "",
  defaultValue: "",
  desc: "",
  type: ParameterTypes.COLUMN,
  pending: true,
  min: "",
  max: "",
  source: "",
  column: "",
  stepPrecision: NUMBER_STEP_PRECISIONS.AUTO
}

export const PENDING_PARAMETER_DISPLAY_ROW = {
  pending: true,
  name: "Untitled",
  defaultValue: "",
  type: ""
}

export const PARAMETER_TYPE_PROPERTIES = {
  [ParameterTypes.COLUMN]: {
    label: "Column",
    icon: <ColumnIcon />
  },
  [ParameterTypes.COLUMN_VALUE]: {
    label: "Column value",
    icon: <ColumnValueIcon />
  },
  [ParameterTypes.NUMBER]: {
    label: "Number",
    icon: <NumberIcon />
  },
  [ParameterTypes.TEXT]: {
    label: "Custom",
    icon: <CodeIcon />
  },
  [ParameterTypes.COORDINATE]: {
    label: "Coordinate",
    icon: <Icon icon="location_on" />
  }
}

if (getFeatureFlag(available_feature_flags.TABLE_PARAMS_IN_PARAMS_MANAGER)) {
  PARAMETER_TYPE_PROPERTIES[ParameterTypes.TABLE] = {
    label: "Custom Table Source",
    icon: <CodeIcon />
  }
}

export const UNSAVED_INDICATOR = "* "

export const WARNING_TYPE_UNSAVED = "unsaved"
export const WARNING_DIALOG_CONTENT = {
  [WARNING_TYPE_UNSAVED]: {
    title: "Unapplied Changes",
    message:
      "You have unapplied changes. Are you sure you want to discard your changes and exit?",
    buttonLabel: "Discard changes"
  }
}
