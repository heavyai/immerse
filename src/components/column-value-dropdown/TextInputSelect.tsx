// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, useState } from "react"
import { TextField } from "widgets/text-field/TextField"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import { MenuSurfaceAnchor, MenuSurface } from "@rmwc/menu"
import {
  ResponsiveVirtualizedList,
  ListOption
} from "components/responsive-virtualized-list/ResponsiveVirtualizedList"
import { CommonInputProps } from "components/parameter-widget/parameter-widget-types"
import { useScrollRecalculate } from "utils/positioning-helpers"

const getPositionStyle = (
  anchor: HTMLInputElement | null,
  shouldSetPosition: boolean
) => {
  if (!anchor || !shouldSetPosition) {
    return undefined
  }

  const { top, left, height } = anchor.getBoundingClientRect()

  return {
    top: top + height,
    left
  }
}

type PopoverPosition = {
  top: number
  left: number
}

const TextInputSelect = ({
  value,
  setValue,
  options,
  label,
  isOptionsListOpen,
  setIsOptionsListOpen,
  inputValue,
  setInputValue,
  showReset,
  showErrors,
  resetToDefaultValue,
  dropdownWidth,
  disabled,
  renderPopoversToPortal,
  getOptionTooltip = (option) => option.label,
  getOptionLabel = (option) => option.label,
  getOptionValue = (option) => option.value
}: CommonInputProps & {
  options: ListOption[]
  label: string
  isOptionsListOpen: boolean
  setIsOptionsListOpen: (openState: boolean) => void
  inputValue: string
  setInputValue: (value: string) => void
  dropdownWidth?: number
  disabled?: boolean
  renderPopoversToPortal?: boolean
  showErrors: boolean
  getOptionTooltip: (option: ListOption) => any
  getOptionLabel: (option: ListOption) => any
  getOptionValue: (option: ListOption) => any
}) => {
  const textInput = useRef(null)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1)
  const [popoverPosition, setPopoverPosition] = useState<
    PopoverPosition | undefined
  >(undefined)

  useEffect(() => {
    if (renderPopoversToPortal) {
      setPopoverPosition(getPositionStyle(textInput.current, isOptionsListOpen))
    }
  }, [isOptionsListOpen, renderPopoversToPortal])

  useEffect(() => {
    if (!isOptionsListOpen) {
      setInputValue(value)
      if (textInput?.current) {
        textInput.current.blur()
      }
    } else if (textInput?.current) {
      textInput.current.select()
    }
  }, [value, isOptionsListOpen, setInputValue])

  useEffect(() => {
    setSelectedOptionIndex(-1)
  }, [isOptionsListOpen, options])

  const submitValue = (option: ListOption) => {
    setIsOptionsListOpen(false)
    const optionvalue = getOptionValue(option)
    if (optionvalue !== value) {
      setValue(optionvalue)
    }
  }

  const handleEnter = () => {
    if (selectedOptionIndex >= 0 && options[selectedOptionIndex]) {
      submitValue(options[selectedOptionIndex])
      return
    }

    const matchingOption = options.find((option) => option.label === inputValue)

    if (matchingOption) {
      submitValue(matchingOption)
    } else {
      setIsOptionsListOpen(false)
    }
  }

  const incrementSelectedOptionIndex = () => {
    if (selectedOptionIndex + 1 < options.length) {
      setSelectedOptionIndex(selectedOptionIndex + 1)
    }
  }

  const decrementSelectedOptionIndex = () => {
    if (selectedOptionIndex > 0) {
      setSelectedOptionIndex(selectedOptionIndex - 1)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleEnter()
    } else if (e.key === "ArrowDown") {
      incrementSelectedOptionIndex()
    } else if (e.key === "ArrowUp") {
      decrementSelectedOptionIndex()
    }
  }

  useScrollRecalculate(() => {
    setPopoverPosition(
      getPositionStyle(
        textInput.current,
        Boolean(isOptionsListOpen && renderPopoversToPortal)
      )
    )
  }, [document.getElementById("dashboard-container")])

  return (
    <MenuSurfaceAnchor>
      <MenuSurface
        open={isOptionsListOpen}
        onClose={() => setIsOptionsListOpen(false)}
        anchorCorner="bottomLeft"
        style={popoverPosition}
        hoistToBody={renderPopoversToPortal}
      >
        <ResponsiveVirtualizedList
          onSelect={submitValue}
          options={options}
          width={dropdownWidth || 208}
          selectedIndex={selectedOptionIndex}
          maxVisibleRows={4}
          getOptionLabel={getOptionLabel}
          getOptionTooltip={getOptionTooltip}
          showTooltip
        />
      </MenuSurface>
      <form autoComplete="off">
        <TextField
          outlined
          invalid={showErrors}
          value={isOptionsListOpen ? inputValue : value}
          inputRef={textInput}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          label={label}
          onClick={() => {
            setIsOptionsListOpen(true)
          }}
          trailingIcon={
            showReset && (
              <Tooltip content="Reset to default" enterDelay={500}>
                <Icon icon="replay" onClick={resetToDefaultValue} />
              </Tooltip>
            )
          }
          disabled={disabled}
        />
      </form>
    </MenuSurfaceAnchor>
  )
}

export default TextInputSelect
