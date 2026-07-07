// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useRef } from "react"
import { Icon as RMWCIcon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"

import IconReplayGif from "components/svg-icons/icon-replay-gif"
import IconReplayLoop from "components/svg-icons/icon-replay-loop"
import IconReplayPlay from "components/svg-icons/icon-replay-play"
import IconReplayPause from "components/svg-icons/icon-replay-pause"
import IconReplayRestart from "components/svg-icons/icon-replay-restart"

import CustomSelector from "components/custom-selector/custom-selector"

import { TextField } from "widgets/text-field/TextField"
import { SecondaryButton } from "widgets/button/Button"

import Slider from "@material-ui/core/Slider"

import { registerChartAddon } from "chart-addons/chart-addon-registry"
import { useChartAddon } from "chart-addons/utils/hooks"
import { useChartTitles } from "charts/utils/hooks"

import { CrossFilterReplayIcon } from "chart-addons/crossfilter-replay/CrossFilterReplayIcon"
import { TimeSelector } from "./TimeSelector"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { ENABLE_CROSSFILTER_REPLAY } = available_feature_flags

import {
  useChartAddonSetters,
  useDownloadFrameProcessor,
  usePlayFunction,
  useRecalculateFrames,
  useReplayAnimator,
  useUpdateInternalFilter,
  useUpdateAnimationInfo,
  useSetReplayCrossFilter,
  useUpdateFlags,
  useUpdateCurrentFrame
} from "./crossfilter-replay-hooks"

import { useDashboardInitialRenderDone } from "hooks"

import ChartAddonContainer from "chart-addons/ChartAddonContainer"

import "./crossfilter-replay.scss"

const insertAtIndex = (array, idx, val) => {
  const copy = [...array]
  while (idx >= copy.length) {
    copy[idx] = undefined
  }
  copy[idx] = val

  return copy
}

// Thank you, Stackoverflow!
// https://stackoverflow.com/questions/2998784/how-to-output-numbers-with-leading-zeros-in-javascript
function pad(num, size, padder = "0") {
  num = num.toString()
  while (num.length < size) {
    num = `${padder}${num}`
  }
  return num
}

const defaultCalculateFrames = ({ frames }) => frames

const UnMemoizedCrossFilterReplay = ({
  updateFilterAtFrame,
  filter,
  setCrossFilter,
  defaultFrames = 10,
  defaultDuration = 12000,
  lockCrossFilter = false,
  calculateFrames = defaultCalculateFrames,
  userGeneratedFilter = false,
  camera = false,
  chartId,
  chartAddonId,
  availableAdvanceByUnits = [],
  defaultAdvanceByUnit = ""
}) => {
  const [locked, setLocked] = useState(false)
  const [looping, setLooping] = useState(false)
  const [downloadId, setDownloadId] = useState(chartId)

  const [playing, setPlaying] = useState(false)
  const animationInfo = useRef({})
  const skipFrames = false

  const chartTitles = useChartTitles()
  const chartTitlesArray = Object.entries(chartTitles).reduce(
    (bucket, [value, label]) => {
      return [...bucket, { value, label }]
    },
    []
  )

  const {
    duration = defaultDuration,
    currentFrame = 1,
    frames = defaultFrames,
    crossfilter: internalCrossFilter = [],
    advanceBy = 1,
    advanceByUnits = defaultAdvanceByUnit
  } = useChartAddon(chartAddonId)

  const initialRenderDone = useDashboardInitialRenderDone()

  const {
    setDuration,
    setCurrentFrame,
    setInternalFilter,
    setFrames,
    setAdvanceBy,
    setAdvanceByUnits
  } = useChartAddonSetters({ chartAddonId })

  if (camera) {
    updateFilterAtFrame = ({ filter: f, frame }) => {
      return f[frame - 1]
    }
  }

  const recalculatedFrames = calculateFrames({
    filter,
    frames,
    advanceBy,
    advanceByUnits,
    duration
  })

  // these flags are used in the effect hooks down below to udpate the frames or filter, as necessary
  const { needsToSetFrames, needsToUpdateCrossfilter } = useUpdateFlags({
    recalculatedFrames,
    locked,
    camera,
    userGeneratedFilter,
    filter,
    internalCrossFilter
  })

  // will update the frames to the recalculated ones, if necessary
  useRecalculateFrames({ setFrames, recalculatedFrames, needsToSetFrames })

  // will update our personal crossfilter settings, if necessary
  useUpdateInternalFilter({
    filter,
    setInternalFilter,
    needsToUpdateCrossfilter
  })

  // will update our animation info with changes in playing or looping
  // and will internally update if the redrawAll state changes.
  useUpdateAnimationInfo({
    animationInfo,
    playing,
    looping
  })

  // get a function to set our internal crossfilter, if necessary
  const internalSetCrossFilter = useSetReplayCrossFilter({
    setCrossFilter,
    updateFilterAtFrame
  })

  // builds a function to update our internal frame
  const updateCurrentFrame = useUpdateCurrentFrame({
    setCurrentFrame,
    internalSetCrossFilter,
    duration,
    frames,
    internalCrossFilter
  })

  const downloadProcessor = useDownloadFrameProcessor({
    downloadId,
    looping
  })

  // returns a function used by requestAnimationFrame while animating
  const animator = useReplayAnimator({
    animationInfo,
    duration,
    frames,
    internalSetCrossFilter,
    internalCrossFilter,
    setCurrentFrame,
    skipFrames,
    setPlaying
  })

  // function to use when the play button is clicked.
  const playFunction = usePlayFunction({
    animationInfo,
    animator,
    currentFrame,
    duration,
    frames,
    internalCrossFilter,
    internalSetCrossFilter,
    looping,
    playing,
    setCurrentFrame,
    setPlaying,
    downloadProcessor
  })

  const currentTimestamp =
    (duration * ((currentFrame - 1) / (frames - 1))) / 1000 // current timestamp in s.

  const currentMinutes = Math.floor(currentTimestamp / 60)
  const currentSeconds = currentTimestamp % 60
  const wholeSeconds = Math.floor(currentSeconds)
  const fractionalSeconds = currentSeconds % 1

  const frameTimestamp = `${pad(currentMinutes, 2)}:${pad(wholeSeconds, 2)}${
    fractionalSeconds ? `.${Math.floor(fractionalSeconds * 100)}` : ""
  }`

  return (
    <ChartAddonContainer>
      <div className="crossfilter-replay-container">
        <div className="crossfilter-replay-control">
          <div className="crossfilter-replay-control">
            Controlling:
            <CustomSelector
              currentValue={downloadId}
              onChange={(v) => setDownloadId(v)}
              options={chartTitlesArray}
            />
          </div>
        </div>
        <div className="crossfilter-replay-control">
          <div className="crossfilter-replay-timestamp">{frameTimestamp}</div>
          <Slider
            min={1}
            max={Math.max(frames, 1)}
            value={currentFrame}
            step={1}
            onChange={(_e, v) => {
              updateCurrentFrame({ target: { value: v } })
            }}
            discrete
            displayMarkers
          />

          <TimeSelector
            duration={duration / 1000}
            callback={(v) => setDuration(v * 1000)}
          />
        </div>
        <div className="crossfilter-replay-control">
          <div className="crossfilter-replay-second-line-grid">
            {availableAdvanceByUnits.length > 0 && (
              <div className="crossfilter-replay-advance-by-grid">
                Units:
                <Tooltip content="advance by" enterDelay={500}>
                  <TextField
                    type="number"
                    autoComplete="off"
                    value={advanceBy}
                    onChange={(e) => setAdvanceBy(e.target.value)}
                    style={{ width: "55px" }}
                  />
                </Tooltip>
                <Tooltip content="advance by units" enterDelay={500}>
                  <CustomSelector
                    currentValue={advanceByUnits}
                    onChange={(v) => setAdvanceByUnits(v)}
                    options={availableAdvanceByUnits}
                  />
                </Tooltip>
              </div>
            )}

            <div className="crossfilter-replay-button-grid">
              {camera && (
                <SecondaryButton
                  onClick={() => {
                    setInternalFilter(
                      insertAtIndex(
                        internalCrossFilter,
                        currentFrame - 1,
                        filter
                      )
                    )
                  }}
                >
                  <RMWCIcon icon={"photo_camera"} className="icon" />
                </SecondaryButton>
              )}
              {lockCrossFilter && (
                <SecondaryButton
                  onClick={() => {
                    const newLocked = !locked
                    setLocked(newLocked)
                  }}
                >
                  <RMWCIcon
                    icon={locked ? "lock_outline" : "lock_open"}
                    className="icon"
                  />
                </SecondaryButton>
              )}

              <IconReplayGif
                onClick={() => {
                  if (downloadId) {
                    setLooping(false)
                    playFunction(1, "download")
                  }
                }}
              />

              <IconReplayRestart
                onClick={() => {
                  if (initialRenderDone) {
                    playFunction(1)
                  }
                }}
              />

              {playing ? (
                <IconReplayPause
                  onClick={() => {
                    if (initialRenderDone) {
                      playFunction()
                    }
                  }}
                />
              ) : (
                <IconReplayPlay
                  onClick={() => {
                    if (initialRenderDone) {
                      playFunction()
                    }
                  }}
                />
              )}

              <IconReplayLoop
                onClick={() => {
                  setLooping(!looping)
                }}
                style={{ fill: looping ? "#006600" : undefined }}
              />
            </div>
          </div>
        </div>
      </div>
    </ChartAddonContainer>
  )
}

export const CrossFilterReplay = React.memo(UnMemoizedCrossFilterReplay)

if (getFeatureFlag(ENABLE_CROSSFILTER_REPLAY)) {
  registerChartAddon({
    type: "CHART_ADDON_CROSSFILTER_REPLAY",
    label: "CrossFilter Replay",
    component: CrossFilterReplay,
    icon: <CrossFilterReplayIcon />
  })
}
