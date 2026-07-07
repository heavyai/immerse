// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  FunctionComponent,
  ChangeEventHandler,
  FocusEventHandler,
  FormEventHandler,
  KeyboardEventHandler,
  useMemo
} from "react"
import cx from "classnames"

import ParameterSelectorInput from "components/parameter-selector-input"
import { process as processParameters } from "utils/ImmerseSQLPlusPlus/parser"
import { ENTER_KEY_NUM } from "constants/magic-variables"
import {
  DASHBOARD_TITLE_INPUT_ID,
  DASHBOARD_TITLE_PLACEHOLDER_ID
} from "constants/dashboards"
import { isParameterDefinedInSet } from "components/parameters/selectors"
import { PopoverOrientation } from "components/parameter-selector-input/constants"

export interface DashboardTopPanelTitleProps {
  dashboardTitle: string
  dashboardTitleFormatted: string
  parameters: {
    values: any
    definitions: {
      [key: string]: {
        defaultValue: string
        name: string
      }
    }
    sets: {
      [key: string]: {
        id: string
        name: string
      }
    }
  }
  handleUpdateDashboardName: (
    name: string,
    oldName: string,
    nameFormatted?: string
  ) => void
  dashboardTitleValid: boolean
  setDashboardTitleValid: (isValid: boolean) => void
}

const SHARED_PARAM_SET_NAME = "Shared Parameter Set"

const DashboardTopPanelTitle: FunctionComponent<DashboardTopPanelTitleProps> = ({
  dashboardTitle,
  dashboardTitleFormatted,
  parameters = { sets: {}, definitions: {}, values: {} },
  handleUpdateDashboardName,
  dashboardTitleValid,
  setDashboardTitleValid
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const paramSelectorPopupRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [title, setTitle] = useState(dashboardTitle)
  const [titleFormatted, setTitleFormatted] = useState(dashboardTitleFormatted)

  const { sets, definitions, values } = parameters
  const parameterSetIDs = Object.keys(sets)
  const sharedSetId = useMemo(() => {
    return parameterSetIDs.length > 0
      ? parameterSetIDs.reduce((sharedSetID, setID) =>
          sets[setID] && sets[setID].name === SHARED_PARAM_SET_NAME
            ? setID
            : sharedSetID
        )
      : []
  }, [parameterSetIDs, sets])

  const parameterDefinedInSet = isParameterDefinedInSet({ parameters })

  const updateDashboardNameIfValid = useCallback(
    (newTitle: string) => {
      newTitle = newTitle.trim()

      processParameters(newTitle, {
        onProcessComplete: ({
          parametersInUse,
          processedSql
        }: {
          parametersInUse: Set<{}>
          processedSql: string
        }) => {
          // naively finds unlinked params + default values
          const paramNames = parametersInUse.keys()
          const unlinkedParams: Array<{
            target: string
            default: string
          }> = []

          // TODO: abstract this out to a "getUnlinkedParams" method somewhere
          for (const paramName of paramNames) {
            const nonEmptyParams = Object.entries(
              values[paramName as string] || {}
            ).filter(([, p]: any) => p.value && typeof p.value === "string")
            // We have to exclude the "shared" set from the check because params are _always_ in the "shared" set
            const setIDsWithoutSharedID = parameterSetIDs.filter(
              (s) => s !== sharedSetId
            )
            const isParamUnLinkedSomewhere = setIDsWithoutSharedID.reduce(
              (isUnlinked, setID) => {
                // Apparently, a param that IS "defined in a given set" is somehow "unlinked" 🤷‍
                const paramIsUnlinkedForSetID = parameterDefinedInSet(
                  paramName,
                  setID
                )
                return isUnlinked || paramIsUnlinkedForSetID
              },
              false
            )

            if (isParamUnLinkedSomewhere) {
              const unusedKey = nonEmptyParams
                .map(([, p]: any) => ({
                  target: p.value,
                  default: definitions[paramName as string].defaultValue
                }))
                .filter((i) => i.target)

              unlinkedParams.push(...unusedKey)
            }
          }

          // for any unlinked params, replace with defaults in processedSql
          for (const param of unlinkedParams) {
            processedSql = processedSql.replaceAll(param.target, param.default)
          }

          if (titleFormatted !== processedSql) {
            setTitle(newTitle)
            setTitleFormatted(processedSql)
            handleUpdateDashboardName(newTitle, dashboardTitle, processedSql)
          }
        }
      })
    },
    [
      dashboardTitle,
      values,
      definitions,
      titleFormatted,
      parameterSetIDs,
      sharedSetId,
      handleUpdateDashboardName,
      parameterDefinedInSet
    ]
  )

  useEffect(() => updateDashboardNameIfValid(title), [
    parameters,
    title,
    updateDashboardNameIfValid
  ])

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused])

  const onFocus: FocusEventHandler<HTMLInputElement> = () => {
    setIsFocused(true)
    setDashboardTitleValid(true)
  }

  const onBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    const { relatedTarget } = e
    const trimmedTitle = e.target.value.trim()
    setTitle(trimmedTitle)
    if (!trimmedTitle || !trimmedTitle.length) {
      setTitleFormatted("")
      setDashboardTitleValid(false)
      setIsFocused(false)
      return
    }
    updateDashboardNameIfValid(trimmedTitle)
    if (
      paramSelectorPopupRef.current &&
      inputRef.current &&
      relatedTarget &&
      paramSelectorPopupRef.current.contains(relatedTarget as Node)
    ) {
      inputRef.current.focus()
    } else {
      setIsFocused(false)
    }
  }

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setTitle(e.target.value)
    setDashboardTitleValid(true)
  }

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.which === ENTER_KEY_NUM) {
      e.preventDefault()
    }
  }

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    return inputRef.current?.blur()
  }

  const onSelectParameter = (name: string): void => {
    setTitle(name)
    updateDashboardNameIfValid(name)
  }

  return (
    <div
      className={cx("input-with-placeholder", {
        error: !dashboardTitleValid
      })}
    >
      {isFocused ? (
        <form onSubmit={onSubmit}>
          <ParameterSelectorInput
            {...{
              onSelectParameter,
              popupRef: paramSelectorPopupRef,
              portalProps: {
                popoverOrientation: PopoverOrientation.BOTTOM,
                scrollingElements: [
                  document.getElementById("dashboard-container")
                ]
              },
              inputProps: {
                id: DASHBOARD_TITLE_INPUT_ID,
                "data-testid": DASHBOARD_TITLE_INPUT_ID,

                value: title,
                placeholder: dashboardTitleValid
                  ? "Untitled Dashboard"
                  : "Dashboard Title Required",
                ref: inputRef,

                onBlur,
                onChange,
                onFocus,
                onKeyDown
              }
            }}
          />
        </form>
      ) : (
        <div
          onClick={() => setIsFocused(true)}
          id={DASHBOARD_TITLE_PLACEHOLDER_ID}
          data-testid={DASHBOARD_TITLE_PLACEHOLDER_ID}
          className={cx({
            "default-placeholder": title === "" && dashboardTitleValid
          })}
        >
          {title === ""
            ? dashboardTitleValid
              ? "Untitled Dashboard"
              : "Dashboard Title Required"
            : titleFormatted}
        </div>
      )}
    </div>
  )
}

export default DashboardTopPanelTitle
