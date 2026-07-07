// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import moment from "moment"
import "moment-duration-format"

const SECOND_IN_MS = 1000

// Threshold close to a second, at which we'll skip it and go to the next instead
const SKIP_THRESHOLD = 150

// Round the time off to the nearest whole second
const formatTime = (milliseconds: number | undefined): string =>
  moment
    .duration(Math.round(milliseconds / SECOND_IN_MS) * SECOND_IN_MS)
    .format("hh:*mm:ss")

interface Props {
  startTime: string
}

interface State {
  time?: number
}

// Class to manage a second-interval timeout for a smooth, clock-like elapsed-time update
class ImportElapsedTime extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)

    this.timeoutId = undefined

    this.startTime = props.startTime

    this.state = {
      time: undefined
    }
  }

  componentDidMount() {
    this.tick()
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.startTime !== nextProps.startTime) {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
      }

      this.startTime = nextProps.startTime

      this.tick()
    }
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }

  startTime: string
  timeoutId: number

  tick() {
    // Duration since start in milliseconds
    const time = Math.max(Date.now() - new Date(this.startTime).getTime(), 0)

    this.setState({ time })

    if (time > 0) {
      // Try to time the next tick for the next new whole second
      const nextWholeSecond = SECOND_IN_MS - (time % SECOND_IN_MS)
      const nextTick =
        nextWholeSecond < SKIP_THRESHOLD
          ? nextWholeSecond + SECOND_IN_MS
          : nextWholeSecond

      this.timeoutId = window.setTimeout(() => this.tick(), nextTick)
    }
  }

  render() {
    const time = this.state.time

    return time > 0 ? (
      <div className="timer">Elapsed time: {formatTime(time)}</div>
    ) : null
  }
}

export default ImportElapsedTime
