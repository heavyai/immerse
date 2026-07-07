// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const selectors = {
  sqlNotebookNav: "#sql-notebook",
  activeCell: ".cell-wrapper--active",
  activeCellTextArea: ".cell-wrapper--active textarea",
  activeCellSubmit:
    ".cell-wrapper--active .notebook-button:not(.variant-button__menu-anchor)",
  activeCellButtonMenuTrigger:
    ".cell-wrapper--active .notebook-button.variant-button__menu-anchor",
  editableTextField: ".editable-text-field",
  analysisResultText: ".analysis-result>div"
}
