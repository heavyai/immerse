// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from "react"

export const useReplayAnimator = ({
  animationInfo,
  duration,
  frames,
  internalSetCrossFilter,
  internalCrossFilter,
  setCurrentFrame,
  skipFrames,
  setPlaying
}) => {
  const animator = useCallback(
    async (time) => {
      if (!animationInfo.current.startTime) {
        animationInfo.current.startTime = time
      }

      const frameAtThisTime =
        Math.floor(
          ((time - animationInfo.current.startTime) / duration) * frames
        ) + animationInfo.current.startFrame

      // if we're skipping frames, then it's the frame at this time.
      const thisFrame = skipFrames
        ? frameAtThisTime
        : Math.min(frameAtThisTime, animationInfo.current.frame + 1)
      // if we're NOT skipping frames, then it's the next frame OR the current frame
      // if we haven't advanced far enough yet.

      if (
        thisFrame > animationInfo.current.frame &&
        thisFrame <= frames &&
        animationInfo.current.redrawDone
      ) {
        if (animationInfo.current.frameProcessor) {
          await animationInfo.current.frameProcessor(
            animationInfo.current,
            duration,
            frames
          )
        }
        animationInfo.current.frame = thisFrame
        setCurrentFrame(thisFrame)
        internalSetCrossFilter({
          filter: internalCrossFilter,
          frame: thisFrame,
          frames,
          duration
        })
      }

      if (thisFrame <= frames && animationInfo.current.playing) {
        requestAnimationFrame(animator)
      } else if (
        thisFrame > frames &&
        animationInfo.current.looping &&
        animationInfo.current.playing
      ) {
        animationInfo.current.frame = 0
        animationInfo.current.startFrame = 1
        delete animationInfo.current.startTime

        requestAnimationFrame(animator)
      } else {
        if (animationInfo.current.frameProcessor) {
          await animationInfo.current.frameProcessor(
            animationInfo.current,
            duration,
            frames
          )
        }
        animationInfo.current = {}
        setPlaying(false)
      }
    },
    [
      animationInfo,
      duration,
      frames,
      internalSetCrossFilter,
      internalCrossFilter,
      setCurrentFrame,
      skipFrames,
      setPlaying
    ]
  )
  return animator
}
