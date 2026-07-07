// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useCallback, useMemo } from "react"
import { TextField } from "widgets/text-field/TextField"

import {
  getFeatureFlag,
  getAllFeatureFlagGroups,
  setFeatureFlag,
  checkPermission
} from "components/control-panel/featureflags"
import { useIsControlPanelAdmin } from "components/settings/selectors/permissionsSelectors"
import FEATUREFLAG_DEFINITIONS from "components/control-panel/featureflag-definitions.json"
import FeaturesList from "./features-list"

import "./styles.scss"

const defaultState = {
  search: "",
  candidates: {}
}

const searchForFlag = (search, setSearch, setCandidates) => {
  const searchRegex = new RegExp(search, "i")

  const candidates = getAllFeatureFlagGroups().reduce(
    (all, group) => ({ ...all, [group]: false }),
    {}
  )

  if (search.length) {
    FEATUREFLAG_DEFINITIONS.forEach((flag) => {
      if (
        (flag.key || "").match(searchRegex) ||
        (flag.constant || "").match(searchRegex) ||
        (flag.description || "").match(searchRegex)
      ) {
        candidates[flag.key] = true
      }
    })
  }

  setSearch(search)
  setCandidates(candidates)
}

const FeatureSettings = () => {
  const permission = useIsControlPanelAdmin() ? "super" : "user"
  // TODO Replace these groups with user-facing groups (needs definition)
  const [flagValues, setFlagValues] = useState(
    FEATUREFLAG_DEFINITIONS.reduce(
      (flags, def) => ({ ...flags, [def.key]: getFeatureFlag(def.key) }),
      defaultState
    )
  )

  const [search, setSearch] = useState("")
  const [candidates, setCandidates] = useState({})
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [localChanges, setLocalChanges] = useState(false)

  // FIXME: This immediately saves changes in local storage; replace when persistence is added
  const updateState = useCallback(
    (key, value) => {
      setFlagValues({
        ...flagValues,
        [key]: value
      })
      setLocalChanges(true)
      setFeatureFlag(key, value)
    },
    [setFlagValues, flagValues, setLocalChanges]
  )
  const flags = useMemo(
    () =>
      FEATUREFLAG_DEFINITIONS.filter(
        (def) =>
          !def.hidden &&
          (search.length === 0 || candidates[def.key]) &&
          checkPermission(def.permission, permission)
      ),

    [search.length, candidates, permission]
  )

  return (
    <div className="settings__content__main feature-settings">
      <header className="settings__content__header">
        <h1>Feature Flags</h1>
        <p>View your current Immerse settings.</p>
      </header>
      <div className="feature-settings__search">
        <TextField
          placeholder="Search by feature or description"
          value={search}
          onChange={(e) => {
            searchForFlag(e.target.value, setSearch, setCandidates)
          }}
          icon="search"
          trailingIcon={
            search.length
              ? {
                  icon: "close",
                  onClick: () => {
                    searchForFlag("", setSearch, setCandidates)
                  }
                }
              : null
          }
        />
      </div>
      <div className="feature-settings__grouped-list">
        <FeaturesList features={flags} {...{ flagValues, updateState }} />
      </div>
    </div>
  )
}

export default FeatureSettings
