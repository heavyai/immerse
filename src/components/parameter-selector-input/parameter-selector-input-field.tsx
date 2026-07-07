// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { CSSProperties, MutableRefObject } from "react"
import {
  InputProps,
  OPEN_PARAM_REGEX,
  PortalProps
} from "components/parameter-selector-input/constants"
import TextField from "widgets/text-field/TextField"

const mergeRefs = (
  refs: (Function | MutableRefObject<HTMLInputElement | null>)[]
) => (value: HTMLInputElement) => {
  refs.forEach((ref) => {
    if (typeof ref === "function") {
      ref(value)
    } else if (ref) {
      ref.current = value
    }
  })
}

interface ParameterSelectorInputFieldProps {
  style?: CSSProperties
  portalProps?: PortalProps
  popupRef?: HTMLInputElement | null
  inputRef: MutableRefObject<HTMLInputElement | null>
  setParameterSelectorOpen: (open: boolean) => void
  parameterSelectorOpen: boolean
  setLastOpenParamMatch: (match: any) => void
  inputProps: InputProps
  useRmwcInput?: boolean
  navigateParameterSelector: (e: KeyboardEvent) => any
}

const ParameterSelectorInputField = ({
  parameterSelectorOpen,
  setParameterSelectorOpen,
  setLastOpenParamMatch,
  navigateParameterSelector,
  inputProps,
  inputRef,
  useRmwcInput
}: ParameterSelectorInputFieldProps) => {
  const {
    value,
    onKeyDown: onKeyDownProp = () => {},
    onChange: onChangeProp = () => {},
    ref,
    ...restInputProps
  } = inputProps

  const detectParameterSyntax = (e) => {
    const cursorPosition = e.target.selectionStart

    const openParameterMatch = e.target.value
      .substring(0, cursorPosition)
      .match(OPEN_PARAM_REGEX)
    setParameterSelectorOpen(Boolean(openParameterMatch))
    setLastOpenParamMatch(openParameterMatch)
  }

  const onChange = (e) => {
    detectParameterSyntax(e)
    onChangeProp(e)
  }

  const onKeyDown = (e) => {
    if (parameterSelectorOpen) {
      if (e.key === "Escape") {
        setParameterSelectorOpen(false)
      }

      navigateParameterSelector(e)
    } else if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault()
      e.currentTarget.blur()
    }

    onKeyDownProp(e)
  }

  const mergedRefs = ref ? mergeRefs([inputRef, ref]) : inputRef

  return useRmwcInput ? (
    <TextField
      value={value}
      inputRef={mergedRefs}
      onChange={onChange}
      onKeyDown={onKeyDown}
      {...restInputProps}
    />
  ) : (
    <input
      type="text"
      autoComplete="off"
      value={value}
      ref={mergedRefs}
      onChange={onChange}
      onKeyDown={onKeyDown}
      {...restInputProps}
    />
  )
}

export default ParameterSelectorInputField
