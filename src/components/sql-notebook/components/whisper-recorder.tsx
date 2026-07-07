// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import useWhisper from "useWhisper"
import cx from "classnames"
import { IconRecord } from "components/svg-icons/icon-record"
import { IconStop } from "components/svg-icons/icon-stop"
import APP_CONFIG from "constants/app-config"
import "./whisper-recorder.scss"

interface WhisperState {
  recording: boolean
  transcript?: string // transcript can be undefined
  startRecording: () => void
  stopRecording: () => void
}

interface WhisperRecorderProps {
  onTranscriptUpdate: (transcript: string) => void
}

export const WhisperRecorder: React.FC<WhisperRecorderProps> = ({
  onTranscriptUpdate
}) => {
  const { recording, transcript, startRecording, stopRecording } = useWhisper({
    endpoint: `${APP_CONFIG.url}/transcribe`,
    fetchConfig: { credentials: "include" }
  }) as WhisperState

  React.useEffect(() => {
    if (transcript) {
      onTranscriptUpdate(transcript)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript])

  return (
    <div
      className={cx("recorder-button", { recording })}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
    >
      {recording ? (
        <IconStop className="recording-icon recording" />
      ) : (
        <IconRecord className="recording-icon" />
      )}
    </div>
  )
}
