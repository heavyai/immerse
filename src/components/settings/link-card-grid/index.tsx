// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { SecondaryButton } from "widgets/button/Button"
import "./styles.scss"

type LinkCardMeta = {
  icon: React.ReactNode
  label: string
  description: string
  url: string
  linkText: string
}

const LinkCardGrid = ({ linkMeta }: { linkMeta: LinkCardMeta[] }) => (
  <div className="link-card-grid">
    {linkMeta.map(({ icon, label, description, url, linkText }) => (
      <div className="link-card settings-link-card" key={label}>
        <div>{icon}</div>
        <h3>{label}</h3>
        <p>{description}</p>
        <a href={url} target="_blank" rel="noreferrer">
          <SecondaryButton icon="launch" label={linkText} onClick={() => {}} />
        </a>
      </div>
    ))}
  </div>
)

export default LinkCardGrid
