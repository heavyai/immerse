// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch } from "react-redux"
import { sqlNotebookSetFastforward } from "components/sql-notebook/redux/sql-notebook-action-creators"
import { SendIcon } from "components/svg-icons/icon-send"
import { useShouldFastforward } from "../hooks/useShouldFastforward"
import { VariantButton } from "../components/variant-button"

enum SubmitOptions {
  GENERATE = "generate",
  GENERATE_SQL = "generate-sql"
}

const toggleMenuOptions = [
  { label: "All", value: SubmitOptions.GENERATE },
  { label: "SQL", value: SubmitOptions.GENERATE_SQL }
]

export const SqlNotebookAnalysisInputCellSubmit = ({
  cellIndex,
  generateAnalysis,
  runDisabled
}: {
  cellIndex: number
  generateAnalysis: () => void
  runDisabled: boolean
}) => {
  const dispatch = useDispatch()
  const fastforward = useShouldFastforward(cellIndex)

  const setFastforward = (shouldFastforward: boolean) => {
    dispatch(sqlNotebookSetFastforward(shouldFastforward, cellIndex))
  }

  const onSelectOption = (option: string) => {
    setFastforward(option === SubmitOptions.GENERATE)
  }

  return (
    <VariantButton
      onSelectOption={onSelectOption}
      disabled={runDisabled}
      options={toggleMenuOptions}
      selectedOption={
        fastforward ? SubmitOptions.GENERATE : SubmitOptions.GENERATE_SQL
      }
      menuHeader="Specify generation type"
      primaryButtonProps={{
        onClick: () => {
          // Needs to be invoked with no args to use current redux input
          generateAnalysis()
        },
        label: fastforward ? "Generate" : "Generate SQL",
        trailingIcon: <SendIcon />
      }}
    />
  )
}
