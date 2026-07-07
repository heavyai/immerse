// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from "react"
import Icon from "components/icon/icon"
import { submitIQFeedback } from "services/iq"
import "./sql-editor-query-generator.scss"

const FeedbackPanel = ({ feedbackId }) => {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(Boolean(feedbackId))
    setSubmitted(false)
  }, [feedbackId])

  const submitFeedback = async (score) => {
    setSubmitting(true)

    try {
      const response = await submitIQFeedback({
        feedback_id: feedbackId,
        score,
        comment: ""
      })
      if (!response.ok) {
        throw new Error("Failed to submit feedback.")
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(error)
    } finally {
      setSubmitted(true)
      setSubmitting(false)
    }
  }

  if (!show) {
    return null
  }
  return (
    <div className="sql-editor__generator__feedback">
      {submitting ? (
        <div className="sql-editor__generator__feedback_submitting_text">
          Submitting feedback...
        </div>
      ) : (
        <div className="sql-editor__generator__feedback_text">
          {!submitted
            ? "Did you find the result helpful?"
            : "Thanks for the feedback!"}
        </div>
      )}
      {!submitting ? (
        <div className="sql-editor__generator__feedback_buttons">
          {!submitted ? (
            <>
              <Icon
                name="thumbs-up"
                viewBox="0 0 28 26"
                onClick={() => submitFeedback(1.0)}
              />
              <Icon
                name="thumbs-down"
                viewBox="0 0 28 26"
                onClick={() => submitFeedback(0.0)}
              />
            </>
          ) : (
            <p
              className="sql-editor__generator__feedback_dismiss"
              onClick={() => setShow(false)}
            >
              Dismiss
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default FeedbackPanel
