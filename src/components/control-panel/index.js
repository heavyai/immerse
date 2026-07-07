// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useCallback, useMemo } from "react"
import cx from "classnames"
import { Redirect } from "react-router-dom"
import { TextField } from "widgets/text-field/TextField"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import { SimpleListItem } from "@rmwc/list"
import { List } from "widgets/list/List"
import { Icon } from "@rmwc/icon"
import { RenderTypeInput } from "components/control-panel/feature-flag-inputs"
import "@rmwc/list/collapsible-list.css"

import FEATUREFLAG_DEFINITIONS from "./featureflag-definitions.json"
import {
  getFeatureFlag,
  setFeatureFlag,
  getAllFeatureFlagGroups,
  getFeatureFlagsInGroup,
  getFeatureFlagDefinition,
  groupForFlag
} from "./featureflags"

import "./control-panel.scss"

/*
  Simple UI to allow configuration of feature flags.

  Limitations are that it only reads from the single featureflag_definitions file, but
  it could easily be extended to accept multiple different files, or potentially even
  multiple storage options. It could also stand to be prettied up.
*/

const icons = {
  combo: "show_chart",
  dev: "code",
  ui: "computer",
  vinzclortho: "bug_report",
  zuul: "bug_report",
  performance: "flash_on"
}

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
        candidates[groupForFlag(flag.key)] = true
      }
    })
  }

  setSearch(search)
  setCandidates(candidates)
}

const ControlPanel = ({ permission = "dev" }) => {
  const [flagValues, setFlagValues] = useState(
    FEATUREFLAG_DEFINITIONS.reduce(
      (flags, def) => ({ ...flags, [def.key]: getFeatureFlag(def.key) }),
      defaultState
    )
  )

  const [selectedGroups, setSelectedGroups] = useState({})
  const [search, setSearch] = useState("")
  const [candidates, setCandidates] = useState({})
  const [localChanges, setLocalChanges] = useState(false)

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

  const groups = getAllFeatureFlagGroups()
  const flags = useMemo(
    () =>
      groups
        .filter((group) => selectedGroups[group] || candidates[group])
        .reduce(
          (f, group) => [...f, ...getFeatureFlagsInGroup(group, permission)],
          []
        )
        .sort()
        .map((flag) => getFeatureFlagDefinition(flag))
        .filter(
          (def) => !def.hidden && (search.length === 0 || candidates[def.key])
        ),
    [groups, selectedGroups, candidates, search, permission]
  )

  if (!getFeatureFlag("ui/enable_control_panel")) {
    return <Redirect to="/" />
  } else {
    return (
      <div className="control-panel">
        <List className="groups-list" nonInteractive>
          {groups
            .filter((group) => getFeatureFlagsInGroup(group, permission).length)
            .map((group) => (
              <SimpleListItem
                key={group}
                text={group}
                graphic={icons[group]}
                className={cx({
                  activated: selectedGroups[group],
                  "search-candidate": candidates[group]
                })}
                onClick={() =>
                  setSelectedGroups({
                    ...selectedGroups,
                    [group]: !selectedGroups[group]
                  })
                }
              />
            ))}
        </List>

        <div className="right-pane">
          <div className="search-box">
            <TextField
              label="Search for Feature Flag"
              value={search}
              onChange={(e) => {
                searchForFlag(e.target.value, setSearch, setCandidates)
              }}
              style={{ width: "100%" }}
            />
          </div>

          <List className="flags-list">
            {flags.length === 0 && (
              <div className="no-flags">
                Please select one or more groups from the list on the left to
                see available flags.
              </div>
            )}
            {flags.map((def) => (
              <div
                key={def.key}
                className={cx("feature-flag-control", {
                  "search-candidate": candidates[def.key]
                })}
              >
                <div className="control-panel-key">
                  {def.beta && <Icon icon={{ icon: "warning" }} />}
                  {def.key}
                </div>
                <div className="control-panel-type">
                  <RenderTypeInput
                    def={def}
                    values={flagValues}
                    callback={updateState}
                  />
                </div>
                <div className="control-panel-description">
                  {def.description}
                </div>
              </div>
            ))}
          </List>
          {false && localChanges && permission === "super" && (
            <SecondaryButton
              label="Apply Changes to Database"
              onClick={() => location.reload()}
            />
          )}
          {localChanges && (
            <PrimaryButton
              label="Reload and Apply Changes"
              onClick={() => location.reload()}
            />
          )}
        </div>
      </div>
    )
  }
}

export default ControlPanel
