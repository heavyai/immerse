// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Popover from "components/popover/popover"
import cx from "classnames"
import {
  PopoverOrientation,
  PopoverStyle,
  PortalProps
} from "components/parameter-selector-input/constants"
import ParameterSelector from "components/parameter-selector"
import React, {
  CSSProperties,
  MutableRefObject,
  useCallback,
  useEffect,
  useState
} from "react"
import Portal from "components/portal/Portal"
import { getDefaultPopoverPosition } from "components/parameter-selector-input/utils"
import { useScrollRecalculate } from "utils/positioning-helpers"
import { ParameterDefinition } from "components/parameters/parameters-types"

const orientationClassMap = {
  [PopoverOrientation.RIGHT]: "parameter-selector-input__popup--align-right",
  [PopoverOrientation.LEFT]: "parameter-selector-input__popup--align-left",
  [PopoverOrientation.TOP]: "parameter-selector-input__popup--align-top",
  [PopoverOrientation.BOTTOM]: "parameter-selector-input__popup--align-bottom"
}

interface ParameterSelectorInputPopoverProps {
  style?: CSSProperties
  portalProps?: PortalProps
  popupRef?: HTMLInputElement | null
  inputRef: MutableRefObject<HTMLInputElement | null>
  setParameterSelectorOpen: (open: boolean) => void
  parameterSelectorOpen: boolean
  updateValueWithParameter: (parameter: ParameterDefinition) => void
  setLastOpenParamMatch: (match: any) => void
  parameterTableOptions: {
    dataTableRef: MutableRefObject<HTMLInputElement | undefined>
    filterText: string
  }
}

const ParameterSelectorInputPopover = ({
  portalProps,
  setParameterSelectorOpen,
  parameterSelectorOpen,
  style,
  popupRef,
  inputRef,
  updateValueWithParameter,
  setLastOpenParamMatch,
  parameterTableOptions,
  filterParameters,
  showCreateNewParameter,
  emptyState
}: ParameterSelectorInputPopoverProps) => {
  const [popoverStyle, setPopoverStyle] = useState<undefined | PopoverStyle>(
    undefined
  )

  const recalculatePopoverStyle = useCallback(() => {
    if (inputRef.current) {
      const getPopoverPosition =
        portalProps?.getPopoverPosition || getDefaultPopoverPosition

      setPopoverStyle(
        getPopoverPosition(
          inputRef.current,
          parameterSelectorOpen,
          portalProps?.popoverOrientation
        )
      )
    }
  }, [
    inputRef,
    parameterSelectorOpen,
    portalProps?.getPopoverPosition,
    portalProps?.popoverOrientation
  ])

  useScrollRecalculate(recalculatePopoverStyle, portalProps?.scrollingElements)

  useEffect(() => {
    if (!portalProps) {
      return
    }

    if (!popoverStyle) {
      recalculatePopoverStyle()
    }
  }, [
    parameterSelectorOpen,
    popoverStyle,
    portalProps,
    recalculatePopoverStyle
  ])

  useEffect(() => {
    if (!portalProps) {
      return
    }

    if (portalProps.layout) {
      recalculatePopoverStyle()
    }
  }, [parameterSelectorOpen, portalProps, recalculatePopoverStyle])

  const selectorPopover = (
    <Popover
      className={cx(
        "parameter-selector-input__popup",
        portalProps?.popoverOrientation
          ? orientationClassMap[portalProps?.popoverOrientation]
          : popoverStyle?.hasOwnProperty("bottom") &&
              orientationClassMap[PopoverOrientation.TOP]
      )}
      isOpened={parameterSelectorOpen}
      onClose={() => {
        setParameterSelectorOpen(false)
        setLastOpenParamMatch(null)
      }}
      style={popoverStyle}
    >
      <ParameterSelector
        style={style}
        parameterTableOptions={parameterTableOptions}
        onSelectParameter={updateValueWithParameter}
        onCreateParameter={() => setParameterSelectorOpen(false)}
        parameterSelectorRef={popupRef}
        filterParameters={filterParameters}
        showCreateNewParameter={showCreateNewParameter}
        customEmptyState={emptyState}
      />
    </Popover>
  )

  return parameterSelectorOpen && portalProps ? (
    <Portal rootId="custom-portal-root">{selectorPopover}</Portal>
  ) : (
    selectorPopover
  )
}

export default ParameterSelectorInputPopover
