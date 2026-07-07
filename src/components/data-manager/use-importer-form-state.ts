// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react"
import { FieldKey, Field } from "./field-types"

const useImporterFormState = (fields: Field[]) => {
  const [formValues, setFormValues] = useState({})
  const [formErrors, setFormErrors] = useState<Record<FieldKey, string> | {}>(
    {}
  )

  const setFieldError = (fieldKey: FieldKey, error: string) => {
    setFormErrors((errs) => ({ ...errs, [fieldKey]: error }))
  }

  const setValue = (fieldKey: FieldKey, value: any) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [fieldKey]: value
    }))

    setFormErrors((errs) => ({ ...errs, [fieldKey]: "" }))
  }

  const validateFields = () => {
    let formHasError = false

    fields.forEach((field) => {
      const error = field.getError
        ? field.getError(field.key, formValues, field.label)
        : ""

      setFieldError(field.key, error)

      if (error) {
        formHasError = true
      }
    })

    return !formHasError
  }

  return {
    formValues,
    setValue,
    validateFields,
    formErrors
  }
}

export default useImporterFormState
