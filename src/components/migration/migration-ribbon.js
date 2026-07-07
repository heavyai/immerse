// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
// import PropTypes from "prop-types"
import { connect } from "react-redux"
import { SecondaryButton } from "widgets/button/Button"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { DUMP_CHART_JSON } = available_feature_flags

import MigrationContainer from "./migration-container"
import * as actions from "./snapshots-action-creators"

import "./migration-ribbon.scss"

const MigrationRibbon = ({
  id,
  hasSnapshots,
  loadSnapshot,
  discardAllSnapshots,
  saveSnapshot
}) => {
  const [showMigrationContainer, setShowMigrationContainer] = useState(false)
  return (
    <>
      <div className="migration-ribbon" data-testid="migration-ribbon">
        {id && (
          <>
            {hasSnapshots && (
              <>
                <SecondaryButton onClick={() => discardAllSnapshots(id)}>
                  Discard snapshots
                </SecondaryButton>
                <SecondaryButton onClick={() => loadSnapshot(id)}>
                  Load snapshot
                </SecondaryButton>
              </>
            )}
            <SecondaryButton onClick={() => saveSnapshot(id)}>
              Save snapshot
            </SecondaryButton>
          </>
        )}
        {getFeatureFlag(DUMP_CHART_JSON) && (
          <SecondaryButton
            onClick={() => setShowMigrationContainer(!showMigrationContainer)}
          >
            Open JSON inspector
          </SecondaryButton>
        )}
      </div>
      <MigrationContainer
        closeCallback={() => setShowMigrationContainer(false)}
        hidden={!showMigrationContainer}
      />
    </>
  )
}

const mapStateToProps = ({ snapshots }, { id }) => ({
  hasSnapshots: Boolean(snapshots.chart[id] && snapshots.chart[id].length)
})

export default connect(mapStateToProps, {
  saveSnapshot: actions.saveSnapshot,
  loadSnapshot: actions.loadSnapshot,
  discardAllSnapshots: actions.discardAllSnapshots
})(MigrationRibbon)
