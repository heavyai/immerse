// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react"
import { generateIQAnswer } from "services/iq"

export const useSqlToAnswer = ({
  question,
  sql,
  tables
}: {
  question: string
  sql: string
  tables: Array<String>
}) => {
  const [answer, setAnswer] = useState<String | null>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<String | null>()

  useEffect(() => {
    setLoading(true)

    async function getAnswers() {
      try {
        const resp = await generateIQAnswer({ question, query: sql, tables })
        // 4XX/5XX errors
        if (resp.ok) {
          const respJson = await resp.json()
          setAnswer(respJson.answer)
          setError(null)
        } else {
          setAnswer(null)
          const contentType = resp.headers.get("content-type")

          if (contentType && contentType.includes("application/json")) {
            const errJson = await resp.json()
            setError(errJson.error ?? "Unknown error")
          } else {
            const errorText = await resp.text()
            setError(errorText || resp.statusText)
          }
        }
      } catch (e) {
        setError("Unknown Error")
      } finally {
        setLoading(false)
      }
    }

    getAnswers()
  }, [question, sql, tables])

  return [answer, loading, error]
}
