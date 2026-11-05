// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEventHandlers } from "hooks/use-event-handlers"
import React from "react"
import Autocomplete from "components/autocomplete/autocomplete"
import { KEYCODE } from "constants/keycode"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

const searchFilter = (value = "", alias, options = []) => {
  if (value === "") {
    return options
  } else {
    return options.filter((option) => {
      const searchVal = value.toLowerCase()
      const optionVal = option[alias]?.toLowerCase()
      return optionVal?.includes(searchVal)
    })
  }
}

const getProcessedOptionValue = (option, props) => {
  const valueKey = props.valueAlias || "value"
  return option
    ? option.sharedCustom || option.globalCustom
      ? process(option[valueKey], {
          useDisplayName: true
        })
      : option[valueKey]
    : ""
}

const autocompleteMethods = (props) => {
  const changeOpenState = (open) => {
    props.setOpenState(() => open)
    props.setHighlightIndex(null)
    if (props.onOpenChange) {
      props.onOpenChange(open)
    }
  }

  const submitValue = (option) => {
    changeOpenState(false)
    props.setInputState(() => "blur")
    if (
      !props.forceComplete ||
      (props.forceComplete && props.matchingOptions.length)
    ) {
      props.setSelectedOption(() => option)
      props.setInputValue(getProcessedOptionValue(option, props))
      if (props.updateValue) {
        props.updateValue(option, props.multiSourceIndex)
      }
    } else {
      props.setInputValue(getProcessedOptionValue(props.selectedOption, props))
    }
    if (props.onExit) {
      props.onExit()
    }
  }

  const closeAutocomplete = () => {
    changeOpenState(false)
    props.setInputState(() => "blur")
    if (props.selectedOption[props.valueAlias]) {
      props.setInputValue(getProcessedOptionValue(props.selectedOption, props))
    }
    if (props.onExit) {
      props.onExit()
    }
  }

  const tabInput = () => {
    if (props.isOpen && props.matchingOptions.length) {
      const index = props.highlightIndex || 0
      props.setInputValue(
        getProcessedOptionValue(props.matchingOptions[index], props)
      )
      props.setHighlightIndex(index)
    }
  }

  const nextOption = () => {
    const index =
      props.highlightIndex === null ||
      props.highlightIndex + 1 >= props.matchingOptions.length
        ? 0
        : props.highlightIndex + 1
    changeOpenState(true)
    props.setDidMouseMove(false)
    props.setHighlightIndex(index)
    props.setForceIntoViewIndex(index)
  }
  const prevOption = () => {
    const index =
      props.highlightIndex === null || props.highlightIndex <= 0
        ? props.matchingOptions.length - 1
        : props.highlightIndex - 1
    changeOpenState(true)
    props.setDidMouseMove(false)
    props.setHighlightIndex(index)
    props.setForceIntoViewIndex(index)
  }

  const getValidOption = () => {
    if (props.highlightIndex) {
      return props.matchingOptions[props.highlightIndex]
    } else {
      const matchingIndex = props.matchingOptions
        .map((option) => option.value)
        .indexOf(props.inputValue)
      return props.forceComplete || matchingIndex >= 0
        ? props.matchingOptions[Math.max(matchingIndex, 0)]
        : { value: props.inputValue }
    }
  }

  return Object.assign(
    {},
    {
      submitValue,
      closeAutocomplete,
      searchOptions: (str) =>
        props.setMatchingOptions(() =>
          searchFilter(str, props.valueAlias, getInitialOptions(props))
        ),
      resetOptions: () =>
        props.setMatchingOptions(() => getInitialOptions(props)),
      enterKey: () => submitValue(getValidOption()),
      escKey: closeAutocomplete,
      tabKey: tabInput,
      arrowDownKey: nextOption,
      arrowUpKey: prevOption,
      showEmptyState: !props.matchingOptions.length && props.forceComplete,
      resetInputState: () => props.setInputState(null),
      changeOpenState
    },
    props
  )
}

const autocompleteEventHandlers = {
  onClickOutside: (props) => (e) => {
    if (props.parentClickOutside) {
      const shouldClose = props.parentClickOutside(e)
      if (shouldClose) {
        props.closeAutocomplete()
      }
    } else {
      props.closeAutocomplete()
    }
  },
  onKeyDown: (props) => (e) => {
    switch (e.keyCode) {
      case KEYCODE.Enter:
        if (props.isFocus) {
          e.preventDefault()
          if (props.stopPropagation) {
            props.stopPropagation()
          }
          props.enterKey()
        }
        break
      case KEYCODE.Esc:
        if (props.isFocus) {
          e.preventDefault()
          if (props.stopPropagation) {
            props.stopPropagation()
          }
          props.escKey()
        }
        break
      case KEYCODE.Tab:
        if (props.isFocus && props.isOpen) {
          e.preventDefault()
          props.tabKey()
        }
        break
      case KEYCODE.ArrowDown:
        if (props.isFocus) {
          e.preventDefault()
          props.arrowDownKey()
        }
        break
      case KEYCODE.ArrowUp:
        if (props.isFocus) {
          e.preventDefault()
          props.arrowUpKey()
        }
        break
      default:
        return
    }
  },
  mouseMove: (props) => () => {
    props.setDidMouseMove(true)
  },
  optionEnter: (props) => (index) => {
    if (props.didMouseMove) {
      props.setHighlightIndex(index)
      props.setForceIntoViewIndex(null)
      if (props.onEnter) {
        props.onEnter(props.matchingOptions[index])
      }
    }
  },
  optionLeave: (props) => (index) => {
    if (index === props.highlightIndex) {
      props.setForceIntoViewIndex(null)
      props.setHighlightIndex(null)

      if (props.onLeave) {
        props.onLeave()
      }
    }
  },
  optionClick: (props) => (option) => {
    props.submitValue(option)
  },
  inputOnChange: (props) => (e) => {
    const value = e.target.value
    if (props.updateInputValue) {
      props.updateInputValue(value)
    }
    props.searchOptions(value)
    props.setInputValue(() => value)
    props.changeOpenState(true)
  },
  inputOnClick: (props) => () => {
    if (props.inputOnClick) {
      props.inputOnClick()
      return
    }
    props.changeOpenState(true)
    props.setInputState(() => "select")
    props.resetOptions()
  },
  inputOnClear: (props) => () => {
    props.changeOpenState(true)
    props.setInputValue(() => "")
    props.setInputState(() => "focus")
    props.resetOptions()
  },
  inputOnFocus: (props) => () => {
    props.setFocus(() => true)
  },
  inputOnBlur: (props) => () => {
    props.setFocus(() => false)
  }
}

function getInitialOptions(props) {
  return props.options || []
}

function useAutocompleteParentProps(incomingProps) {
  let viewProps = incomingProps
  const [didMouseMove, setDidMouseMove] = React.useState(false)
  viewProps = { ...viewProps, didMouseMove, setDidMouseMove }
  const [forceIntoViewIndex, setForceIntoViewIndex] = React.useState(null)
  viewProps = { ...viewProps, forceIntoViewIndex, setForceIntoViewIndex }
  const [highlightIndex, setHighlightIndex] = React.useState(null)
  viewProps = { ...viewProps, highlightIndex, setHighlightIndex }
  const [inputValue, setInputValue] = React.useState(() =>
    getProcessedOptionValue(viewProps.selectedOption, viewProps)
  )
  viewProps = { ...viewProps, inputValue, setInputValue }
  const [inputState, setInputState] = React.useState(() =>
    viewProps.openByDefault || viewProps.selectInputwithoutDropdown
      ? "select"
      : null
  )
  viewProps = { ...viewProps, inputState, setInputState }
  const [matchingOptions, setMatchingOptions] = React.useState(() =>
    getInitialOptions(viewProps)
  )
  viewProps = { ...viewProps, matchingOptions, setMatchingOptions }
  const [selectedOption, setSelectedOption] = React.useState(
    () => viewProps.selectedOption || { value: "" }
  )
  viewProps = { ...viewProps, selectedOption, setSelectedOption }
  const [isFocus, setFocus] = React.useState(null)
  viewProps = { ...viewProps, isFocus, setFocus }
  const [isOpen, setOpenState] = React.useState(
    () => viewProps.openByDefault || false
  )
  viewProps = { ...viewProps, isOpen, setOpenState }
  const [forceComplete, setForceComplete] = React.useState(
    () => viewProps.forceComplete || false
  )
  viewProps = { ...viewProps, forceComplete, setForceComplete }
  const [valueAlias, setValueAlias] = React.useState(
    () => viewProps.valueAlias || "value"
  )
  viewProps = { ...viewProps, valueAlias, setValueAlias }
  viewProps = autocompleteMethods(viewProps)
  const localHandlers = useEventHandlers(autocompleteEventHandlers, viewProps)
  viewProps = { ...viewProps, ...localHandlers }
  const {
    options,
    updateOptionsOnPropsChange,
    inputValue: currentInput,
    valueAlias: currentAlias,
    setMatchingOptions: updateMatches
  } = viewProps
  const previousOptions = React.useRef(options)
  React.useEffect(() => {
    if (updateOptionsOnPropsChange && previousOptions.current !== options) {
      updateMatches(searchFilter(currentInput, currentAlias, options || []))
    }
    previousOptions.current = options
  }, [
    options,
    updateOptionsOnPropsChange,
    currentInput,
    currentAlias,
    updateMatches
  ])
  return viewProps
}

function StatefulAutocompleteParent(incomingProps) {
  const viewProps = useAutocompleteParentProps(incomingProps)
  return React.createElement(Autocomplete, viewProps)
}

export default StatefulAutocompleteParent
