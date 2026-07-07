// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyboardEvent, useRef } from "react"

export const useInputKeyboardControls = <T>(
  submit: () => void,
  cancel: () => void,
  submitOnEnter?: boolean
) => {
  const inputRef = useRef<T>(null)
  const onKeyDown = (e: KeyboardEvent<T>) => {
    if (
      e?.key === "Enter" &&
      (submitOnEnter || e?.shiftKey || e?.ctrlKey || e?.metaKey)
    ) {
      submit()
      e.preventDefault() // Don't add line break if submit is disabled
    }
    if (e?.key === "Escape") {
      cancel()
    }
  }

  return { inputRef, onKeyDown }
}
