// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import cx from "classnames"
import { Icon } from "@rmwc/icon"
import { InputLabel, TextField } from "@material-ui/core"
import { PrimaryButton, SecondaryButtonNoBorder } from "widgets/button/Button"
import { SimpleDialog } from "widgets/dialog/Dialog"
import { ColumnMetadata } from "constants/prop-types"
import MultiSelect from "widgets/multi-select/Multi-select"
import { useColumnOptions } from "hooks/use-column-options"
import IconHorizontalSwap from "components/svg-icons/icon-horizontal-swap"
import JoinTypePicker from "components/join-manager/join-type-picker"
import JoinKeyPreview from "components/join-manager/join-key-preview"
import IconArrows from "components/svg-icons/icon-join-arrows"
import { JoinDataSource, JoinType } from "./join-manager-types"
import { ParameterTypes } from "components/parameters/parameters-types"
import { AppState } from "vega/charts/types"
import IconTooltip from "components/icon-with-tooltip"
import { makeIsParameterInUse } from "components/parameters/selectors"
import { closeJoinManager } from "./join-manager-actions"
import {
  createJoinDataSource,
  updateJoinDataSource
} from "./join-manager-thunks"
import "./styles.scss"
import IconBeta from "components/svg-icons/icon-beta"
import { hasParamSyntax } from "utils/parameters"
import { JoinConditionSelector } from "components/join-condition-selector/join-condition-selector"
import { isGeo } from "constants/data-types"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

enum JoinKeyId {
  A = "A",
  B = "B"
}

enum ColumnStatus {
  UNINITIALIZED = "UNINITIALIZED"
}

export const JoinManagerModal = () => {
  const dispatch = useDispatch()
  const geoJoinsEnabled = getFeatureFlag(
    available_feature_flags.ENABLE_GEO_JOINS
  )

  // Use the currently selected database, fallback to the database used to log in
  const currentDatabase = useSelector(
    (state: AppState) =>
      state.connection?.sessionInfo?.database ?? state.connection.user.database
  )

  const sourcesList = useSelector(
    (state: {
      tables: {
        list: {
          name: string
          type: string
        }[]
      }
    }) =>
      state.tables.list
        .filter(
          // Filter out join types and custom sources
          ({ type, name }) =>
            type !== ParameterTypes.JOIN && !hasParamSyntax(name)
        )
        .map(({ name }) => ({ label: name, value: name }))
  )

  const initialState = useSelector<AppState, JoinDataSource>(
    (state: AppState) => state.ui.joinManagerProps.joinDefinition
  )

  const firstJoin = initialState?.joins?.[0]

  const joinIsInUse = useSelector((state) => {
    const isParameterInUse = makeIsParameterInUse(state)
    return isParameterInUse(initialState?.parameter)
  })

  const dashboardTitle = useSelector((state) => state.dashboard.title)

  const [sourceA, setSourceA] = useState<string | undefined>(
    firstJoin?.leftTable
  )
  const [sourceB, setSourceB] = useState<string | undefined>(
    firstJoin?.rightTable
  )
  const [name, setName] = useState<string | undefined>(initialState?.name)
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false)

  const columnOptionsA: ColumnMetadata[] = useColumnOptions(sourceA, {
    includeCustom: true,
    resetValue: null
  })

  const columnOptionsB: ColumnMetadata[] = useColumnOptions(sourceB, {
    includeCustom: true,
    resetValue: null
  })

  const [columnMetadataA, setColumnMetadataA] = useState<
    ColumnMetadata | null | ColumnStatus
  >(
    firstJoin?.leftJoinKey
      ? columnOptionsA.find((col) => col.value === firstJoin.leftJoinKey) ||
          ColumnStatus.UNINITIALIZED
      : ColumnStatus.UNINITIALIZED
  )

  const [columnMetadataB, setColumnMetadataB] = useState<
    ColumnMetadata | null | ColumnStatus
  >(
    firstJoin?.rightJoinKey
      ? columnOptionsB.find((col) => col.value === firstJoin.rightJoinKey) ||
          ColumnStatus.UNINITIALIZED
      : ColumnStatus.UNINITIALIZED
  )

  const [joinCondition, setJoinCondition] = useState<string | null>(
    firstJoin?.joinCondition ?? null
  )

  const setInitialColumnMetadata = (
    options: ColumnMetadata[],
    setMetadata: (meta: ColumnMetadata) => void,
    selectedKey?: string
  ) => {
    if (options && selectedKey) {
      const matchingOption = options.find((col) => col.value === selectedKey)
      if (matchingOption) {
        setMetadata(matchingOption)
      }
    }
  }

  const [joinType, setJoinType] = useState(
    firstJoin?.joinType ?? JoinType.INNER
  )

  // Finds/sets  selected join keys when the modal is opened
  useEffect(() => {
    // If it's uninitialized, try and grab it from the existing join
    // After that always use local state
    const selectedColumnA =
      columnMetadataA === ColumnStatus.UNINITIALIZED
        ? firstJoin?.leftJoinKey
        : columnMetadataA?.value
    setInitialColumnMetadata(
      columnOptionsA,
      setColumnMetadataA,
      selectedColumnA
    )
    const selectedColumnB =
      columnMetadataB === ColumnStatus.UNINITIALIZED
        ? firstJoin?.rightJoinKey
        : columnMetadataB?.value
    setInitialColumnMetadata(
      columnOptionsB,
      setColumnMetadataB,
      selectedColumnB
    )
  }, [
    firstJoin?.leftJoinKey,
    firstJoin?.rightJoinKey,
    columnOptionsA,
    columnOptionsB,
    columnMetadataA,
    columnMetadataB
  ])

  const swapKeys = () => {
    if (!sourceA && !sourceB) {
      return
    }

    setSourceB(sourceA)
    setColumnMetadataB(columnMetadataA)
    setSourceA(sourceB)
    setColumnMetadataA(columnMetadataB)
  }

  const { chartId, layerId } = useSelector((state: AppState) => {
    const { chartId: cid, layerId: lid } = state.ui?.joinManagerProps

    return {
      chartId: cid,
      layerId: lid
    }
  })

  const showJoinOptions =
    isGeo(columnMetadataA?.type) &&
    isGeo(columnMetadataB?.type) &&
    geoJoinsEnabled

  const formIsValid = () => {
    // No name
    if (!name?.length) {
      return false
    }

    // No column or table values
    if (
      !sourceA ||
      !sourceB ||
      !columnMetadataA?.value ||
      !columnMetadataB?.value
    ) {
      return false
    }

    if (showJoinOptions && !joinCondition) {
      return false
    }
    return true
  }

  const submitJoin = () => {
    // Modal should do form validation when this is flipped
    setFormSubmitted(true)
    if (!formIsValid()) {
      return
    }

    const joinUpdates = {
      joinType,
      leftJoinKey: columnMetadataA?.value,
      rightJoinKey: columnMetadataB?.value,
      leftTable: sourceA,
      rightTable: sourceB,
      leftDatabase: currentDatabase,
      rightDatabase: currentDatabase
    }

    if (showJoinOptions) {
      joinUpdates.joinCondition = joinCondition
    }

    if (initialState) {
      // Do updates if we are updating
      dispatch(
        updateJoinDataSource({
          joinDataSourceId: initialState.id,
          joinId: firstJoin.id,
          joinUpdates,
          chartId,
          layerId,
          name,
          rightColumnType: columnMetadataB.type,
          leftColumnType: columnMetadataA.type
        })
      )
    } else {
      dispatch(
        createJoinDataSource({
          joins: [joinUpdates],
          name,
          chartId,
          layerId,
          rightColumnType: columnMetadataB.type,
          leftColumnType: columnMetadataA.type
        })
      )
    }

    dispatch(closeJoinManager())
  }

  const nameError = !name?.length && formSubmitted

  const onJoinConditionSelect = (selectedOption: string) => {
    setJoinCondition(selectedOption)
  }

  return (
    <div className="join-manager-modal">
      <SimpleDialog
        open
        title={
          <div className="join-manager-modal__title__wrapper">
            <div
              className="join-manager-modal__title"
              data-testid="join-manager-modal-title"
            >
              {`${initialState ? "Update" : "Create a New"} Join`}
              <div className="title-badge">
                <IconBeta />
              </div>
            </div>
            <div
              className="join-manager-modal__subtitle"
              data-testid="join-manager-modal-subtitle"
            >
              {`Select sources (tables) and common keys (columns) to ${
                initialState ? " update " : " create a new "
              } join source.`}
            </div>
          </div>
        }
        onClose={() => dispatch(closeJoinManager())}
        footer={
          <>
            <SecondaryButtonNoBorder
              onClick={() => dispatch(closeJoinManager())}
              data-testid="join-manager-modal-secondary-action"
            >
              Cancel
            </SecondaryButtonNoBorder>
            <>
              <PrimaryButton
                onClick={submitJoin}
                disabled={!formIsValid()}
                data-testid="join-manager-modal-primary-action"
              >
                {`${initialState ? "Update" : "Create"} Join`}
              </PrimaryButton>
            </>
          </>
        }
      >
        <div className="join-manager">
          <div className="join-manager__name">
            <InputLabel className="join-name-label">JOIN NAME</InputLabel>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter a new join name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              margin="dense"
              error={nameError}
              helperText={nameError ? "Name is required" : ""}
              inputProps={{
                "data-testid": "join-manager-name-input"
              }}
            />
          </div>
          <div className="join-manager-name-border" />
          {joinIsInUse && (
            <div className="join-manager__warning">
              <div>
                <Icon icon="warning" />
                <h4>Source can’t be changed. Join is currently in use.</h4>
              </div>
              <p>
                {`One or more charts are using this join${
                  dashboardTitle ? " in" : "."
                } `}
                {dashboardTitle && <span> {`"${dashboardTitle}". `}</span>}
                To be able to change join sources remove the join from all
                charts using
                <span>{` "${initialState.name}" `}</span> as the source.
              </p>
            </div>
          )}
          <div
            className={cx("join-manager__sources", {
              "join-manager__sources--disabled": joinIsInUse
            })}
          >
            <div className="join-manager__sources__selector-wrapper">
              <div className="join-manager__sources__header">
                <p>
                  SOURCE {JoinKeyId.A}
                  <IconTooltip
                    tooltipText="The primary or left data table used when creating a join."
                    enterDelay={500}
                    icon="info_outlined"
                  />
                </p>
              </div>
              <MultiSelect
                options={sourcesList}
                value={sourceA ? { label: sourceA, value: sourceA } : null}
                onChange={(e: { value: string }) => {
                  setSourceA(e.value)
                  setColumnMetadataA(null)
                }}
                placeholder={sourceA ? undefined : "Select Source"}
                noLabel
              />
            </div>
            <div
              className="join-manager__sources__swap-icon"
              onClick={swapKeys}
            >
              <IconHorizontalSwap />
            </div>
            <div className="join-manager__sources__selector-wrapper">
              <div className="join-manager__sources__header-wrapper">
                <div className="join-manager__sources__header">
                  <p>
                    SOURCE {JoinKeyId.B}
                    <IconTooltip
                      tooltipText="The secondary or right data table used when creating a join."
                      enterDelay={500}
                      icon="info_outlined"
                    />
                  </p>
                </div>
              </div>
              <MultiSelect
                options={sourcesList}
                value={sourceB ? { label: sourceB, value: sourceB } : null}
                onChange={(e: { value: string }) => {
                  setSourceB(e.value)
                  setColumnMetadataB(null)
                }}
                placeholder={sourceB ? undefined : "Select Source"}
                noLabel
              />
            </div>
          </div>
          <div className="join-picker-wrapper">
            <div className="join-manager-arrows">
              <IconArrows />
            </div>
            <JoinTypePicker
              selectedJoinType={joinType}
              setJoinType={setJoinType}
            />
          </div>
          <div className="join-manager__previews">
            <JoinKeyPreview
              key={`${sourceA}-${JoinKeyId.A}`}
              source={sourceA}
              selectColumn={setColumnMetadataA}
              selectedColumnValue={columnMetadataA?.value}
              label={JoinKeyId.A}
              dataTypeFilter={columnMetadataB?.type}
              columnOptions={columnOptionsA}
            />
            <JoinKeyPreview
              key={`${sourceB}-${JoinKeyId.B}`}
              source={sourceB}
              selectColumn={setColumnMetadataB}
              selectedColumnValue={columnMetadataB?.value}
              label="B"
              dataTypeFilter={columnMetadataA?.type}
              columnOptions={columnOptionsB}
            />
          </div>
          {showJoinOptions && (
            <div className="join-manager__options">
              <div className="join-manager__options__title">
                <h2>Select spatial join condition</h2>
                <span>Join options based on geometry types: </span>
                <strong>
                  {`${columnMetadataA?.type ?? "Unknown"} to ${
                    columnMetadataB?.type ?? "Unknown"
                  }`}
                </strong>
              </div>
              <JoinConditionSelector
                onSelect={onJoinConditionSelect}
                selectedValue={joinCondition}
                leftType={columnMetadataA?.type}
                rightType={columnMetadataB?.type}
              />
            </div>
          )}
        </div>
      </SimpleDialog>
    </div>
  )
}
