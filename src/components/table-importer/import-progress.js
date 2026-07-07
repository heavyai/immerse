// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { all, sum, takeLast } from "ramda"
import moment from "moment"
import { importStatusShape } from "constants/prop-types"

import ImportElapsedTime from "./import-elapsed-time"

// The threshold at which we display "a few seconds" remaining instead of the exact value
const FEW_SECONDS_THRESHOLD = 4
moment.relativeTimeThreshold("ss", FEW_SECONDS_THRESHOLD)

// The number of recent samples we use for the ETA rolling average
const ETA_SAMPLES = 5

const isValidEta = (estimatedEndTimes) => {
  const lastEndTimes = takeLast(ETA_SAMPLES, estimatedEndTimes)

  return (
    lastEndTimes.length === ETA_SAMPLES && all((time) => time > 0, lastEndTimes)
  )
}

const getHumanizedEta = (startTime, estimatedEndTimes) => {
  const lastEndTimes = takeLast(ETA_SAMPLES, estimatedEndTimes)

  const averageEndTime = sum(lastEndTimes) / ETA_SAMPLES

  const averageEndMoment = moment(startTime).add(averageEndTime, "seconds")

  const now = moment()

  const humanizedEta = averageEndMoment.isAfter(now)
    ? averageEndMoment.fromNow()
    : "in a few seconds"

  return humanizedEta
}

const ImportProgress = ({
  currentFile,
  status,
  startTime,
  estimatedEndTimes
}) => {
  const validEta = isValidEta(estimatedEndTimes)
  const humanizedEta = validEta && getHumanizedEta(startTime, estimatedEndTimes)

  return (
    <div className="import-table-wrapper import-progress">
      <div className="loading-widget">
        <div className="loading-gfx">
          <div className="main-loading-icon" />
        </div>
        <div className="loading-msg">
          <div>Importing {currentFile ? currentFile : "Data"}</div>
          {status.rows_completed ? (
            <div>{status.rows_completed} rows imported</div>
          ) : null}
          {status.rows_rejected ? (
            <div>{status.rows_rejected} rows rejected</div>
          ) : null}
          {startTime ? <ImportElapsedTime startTime={startTime} /> : null}
          {validEta ? <div>Estimated to complete {humanizedEta}</div> : null}
        </div>
      </div>
    </div>
  )
}

ImportProgress.propTypes = {
  currentFile: PropTypes.string,
  status: importStatusShape,
  startTime: PropTypes.string,
  estimatedEndTimes: PropTypes.arrayOf(PropTypes.number)
}

export default ImportProgress
