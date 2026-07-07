// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import "./empty-state.scss"

export const EmptyState = ({
  icon,
  title,
  description
}: {
  icon?: JSX.Element
  title?: string | JSX.Element
  description?: string | JSX.Element
}) => {
  return (
    <div className="empty-state">
      {icon && <section>{icon}</section>}
      {title && <section className="empty-state__title">{title}</section>}
      {description && (
        <section className="empty-state__description">{description}</section>
      )}
    </div>
  )
}
