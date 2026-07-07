// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useRef, CSSProperties } from "react"
import ReactTestUtils from "react-dom/test-utils"

import "./parameter-selector-input.scss"
import { PortalProps, OPEN_PARAM_REGEX, InputProps } from "./constants"

import ParameterSelectorInputPopover from "components/parameter-selector-input/parameter-selector-input-popover"
import ParameterSelectorInputField from "components/parameter-selector-input/parameter-selector-input-field"
import { ParameterDefinition } from "components/parameters/parameters-types"

export interface ParameterSelectorInputProps {
  onSelectParameter: (newValue: string) => void
  style?: CSSProperties
  inputProps: InputProps
  portalProps?: PortalProps
  popupRef?: HTMLInputElement | null
  useRmwcInput?: boolean
}

const ParameterSelectorInput = ({
  onSelectParameter,
  style,
  inputProps = {},
  portalProps,
  popupRef,
  useRmwcInput,
  filterParameters,
  showCreateNewParameter,
  emptyState
}: ParameterSelectorInputProps) => {
  const [parameterSelectorOpen, setParameterSelectorOpen] = useState(false)
  const [lastOpenParamMatch, setLastOpenParamMatch] = useState(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dataTableRef = useRef()

  const parameterTableOptions = {
    dataTableRef,
    filterText: (lastOpenParamMatch?.[0] || "").replace("${", "")
  }

  const navigateParameterSelector = (e: KeyboardEvent) => {
    // If user is navigating the parameter selector with up/down arrow keys,
    // don't lose position of the cursor
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault()
    }

    // If the user moves the cursor outside of the open parameter, close the parameter selector
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const cursorPosition = (e.target as HTMLInputElement).selectionStart

      if (
        !(e.target as HTMLInputElement).value
          .substring(0, cursorPosition)
          .match(OPEN_PARAM_REGEX)
      ) {
        setParameterSelectorOpen(false)
      }
    }

    if (dataTableRef.current) {
      // This is some black magic to trigger the parameter table's keydown when
      // a user uses arrow keys in the chart title.
      //
      // See this stackoverflow for why we're using ReactTestUtils.Simulate instead
      // of the native `dispatchEvent(new KeyboardEvent("keydown"))`
      // https://stackoverflow.com/questions/39065010/why-react-event-handler-is-not-called-on-dispatchevent
      ReactTestUtils.Simulate.keyDown(dataTableRef.current, {
        keyCode: e.keyCode
      })
    }
  }

  const updateValueWithParameter = (parameter: ParameterDefinition) => {
    const newValueStart = inputProps.value.slice(0, lastOpenParamMatch.index)
    const newValueEnd = inputProps.value.slice(
      lastOpenParamMatch.index + lastOpenParamMatch[0].length
    )
    const insertedParameter = `\${${parameter.name}${
      newValueEnd.startsWith("}") ? "" : "}"
    }`
    const newValue = `${newValueStart}${insertedParameter}${newValueEnd}`

    onSelectParameter(newValue)

    setLastOpenParamMatch(null)
    setParameterSelectorOpen(false)
  }

  return (
    <div className="parameter-selector-input">
      <ParameterSelectorInputPopover
        setParameterSelectorOpen={setParameterSelectorOpen}
        parameterSelectorOpen={parameterSelectorOpen}
        portalProps={portalProps}
        updateValueWithParameter={updateValueWithParameter}
        parameterTableOptions={parameterTableOptions}
        inputRef={inputRef}
        style={style}
        popupRef={popupRef}
        setLastOpenParamMatch={setLastOpenParamMatch}
        filterParameters={filterParameters}
        showCreateNewParameter={showCreateNewParameter}
        emptyState={emptyState}
      />
      <ParameterSelectorInputField
        setLastOpenParamMatch={setLastOpenParamMatch}
        navigateParameterSelector={navigateParameterSelector}
        inputProps={inputProps}
        inputRef={inputRef}
        parameterSelectorOpen={parameterSelectorOpen}
        setParameterSelectorOpen={setParameterSelectorOpen}
        useRmwcInput={useRmwcInput}
      />
    </div>
  )
}

export default ParameterSelectorInput
