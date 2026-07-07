// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { submitIQFeedback } from "services/iq"
import classNames from "classnames"
import { Tooltip } from "@rmwc/tooltip"

import { IconThumbsUp } from "components/svg-icons/icon-thumbs-up"
import { IconThumbsDown } from "components/svg-icons/icon-thumbs-down"
import { FeedbackDialog } from "./feedback-dialog"
import "./feedback-buttons.scss"

export const FeedbackButtons = ({ feedbackId }: { feedbackId: string }) => {
  const [submitted, setSubmitted] = useState(false)
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [comment, setComment] = useState("")

  // Assumption of success here, it only matters if they have clicked or not
  // There's nothing the user can do if it fails, but we should figure out how
  // to alert ourselves.
  const submitFeedback = async (sendComment = true) => {
    setShowCommentDialog(false)

    // Don't submit twice
    if (submitted || feedbackScore === null) {
      return
    }
    try {
      setShowTooltip(true)
      setTimeout(() => {
        setShowTooltip(false)
      }, 1000)
      const response = await submitIQFeedback({
        feedback_id: feedbackId,
        score: feedbackScore,
        comment: sendComment ? comment : ""
      })
      if (!response.ok) {
        throw new Error("Failed to submit feedback.")
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(error)
    } finally {
      setSubmitted(true)
    }
  }

  const onClickFeedback = (score: number) => {
    if (!submitted) {
      setShowCommentDialog(true)
      setFeedbackScore(score)
    }
  }

  return (
    <>
      <Tooltip open={showTooltip} content="🎉 Thank you for the feedback!">
        <div className={classNames("feedback-buttons", { submitted })}>
          <div
            className={classNames("feedback-button", {
              selected: feedbackScore === 1.0
            })}
            onClick={() => {
              onClickFeedback(1.0)
            }}
          >
            <IconThumbsUp />
          </div>

          <div
            className={classNames("feedback-button", {
              selected: feedbackScore === 0.0
            })}
            onClick={() => {
              onClickFeedback(0.0)
            }}
          >
            <IconThumbsDown />
          </div>
        </div>
      </Tooltip>
      {showCommentDialog && !submitted && (
        <FeedbackDialog
          setInputValue={setComment}
          inputValue={comment}
          onSubmit={submitFeedback}
          // Canceling out of this dialog submits feedback score without a comment
          onCancel={() => submitFeedback(false)}
        />
      )}
    </>
  )
}
