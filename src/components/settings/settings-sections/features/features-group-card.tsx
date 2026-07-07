// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { FeaturesGroup } from "components/settings/settings-sections/features/types"
import { SecondaryButton } from "widgets/button/Button"

const FeaturesGroupCard = ({
  icon,
  label,
  description,
  value
}: FeaturesGroup) => {
  return (
    <div className="features-group-scroller__card settings-link-card">
      <div className="features-group-scroller__icon">{icon}</div>
      <h3>{label}</h3>
      <p>{description}</p>

      <SecondaryButton
        label="Go to"
        onClick={() => {
          const el = document.getElementById(`features-${value}`)

          if (el) {
            el.scrollIntoView()
          }
        }}
      />
    </div>
  )
}

export default FeaturesGroupCard
