// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import FeaturesGroupCard from "components/settings/settings-sections/features/features-group-card"
import { featureGroups } from "components/settings/settings-sections/features/mock-features-groups"

const FeaturesGroupScroller = () => {
  return (
    <div className="features-group-scroller">
      {featureGroups.map((group) => (
        <FeaturesGroupCard {...group} key={group.value} />
      ))}
    </div>
  )
}

export default FeaturesGroupScroller
