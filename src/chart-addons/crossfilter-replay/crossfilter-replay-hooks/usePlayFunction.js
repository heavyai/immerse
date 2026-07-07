// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from "react"

export const usePlayFunction = ({
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
}) =>
  useCallback(
    (frameArg, shouldDownload) => {
      if (playing && !frameArg) {
        setPlaying(false)
      } else {
        setPlaying(true)

        const newFrame = frameArg || (currentFrame < frames ? currentFrame : 1)
        setCurrentFrame(newFrame)

        animationInfo.current = {
          startTime: undefined,
          frame: newFrame,
          startFrame: newFrame,
          playing: true,
          looping,
          frameProcessor: shouldDownload ? downloadProcessor : undefined
        }

        internalSetCrossFilter({
          filter: internalCrossFilter,
          frame: animationInfo.current.frame,
          frames,
          duration
        })
        requestAnimationFrame(animator)
      }
    },
    [
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
    ]
  )
