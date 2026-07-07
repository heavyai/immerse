// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
const WelcomeSection: FC = () => {
  return (
    <div className="welcome-panel">
      <h1>Welcome!</h1>
      <p>
        Here is your personal workspace. Interact with massive datasets and find
        insights to make data-driven decisions. See the{" "}
        <a href="https://docs.heavy.ai" target="_blank" rel="noreferrer">
          Documentation
        </a>{" "}
        for more information.
      </p>
    </div>
  )
}

export default WelcomeSection
