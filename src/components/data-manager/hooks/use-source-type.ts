// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react"
import { TSourceType } from "@heavyai/connector/dist/browser-connector"
import { parseFilenameForSourceType } from "../utils/source-type-heuristics"
import { SOURCE_TYPE_OPTIONS } from "../constants"

type SourceType = {
  label: string
  value: TSourceType
}

export const useSourceType = (path: string) => {
  const [sourceType, setSourceType] = useState<SourceType | null>(null)
  const [disableSourceTypeField, setDisableSourceTypeField] = useState(false)

  useEffect(() => {
    const extensionSourceType = parseFilenameForSourceType(path || "")

    const selectedOption = SOURCE_TYPE_OPTIONS.find(
      ({ value }) => value === extensionSourceType
    )

    if (selectedOption) {
      setSourceType(selectedOption)
      setDisableSourceTypeField(true)
    } else {
      setDisableSourceTypeField(false)
    }
  }, [path])

  return { sourceType, disableSourceTypeField, setSourceType }
}
