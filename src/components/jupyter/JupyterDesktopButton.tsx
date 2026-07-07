// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"

import APP_CONFIG from "constants/app-config"
import { JL_DESKTOP_EXAMPLE_URI } from "constants/services"
import JupyterDesktopIcon from "components/svg-icons/icon-jupyter-desktop"
import "./JupyterButton.scss"

const fetchJupyterLabDesktopAPI = () =>
  fetch(`${APP_CONFIG.url}/jupyter-desktop`)

const JupyterDesktopButton = () => {
  const [showButton, setShowButton] = useState<boolean>()
  const title = "Launch Jupyter Lab Desktop"

  useEffect(() => {
    const checkJupyterAPI = async () => {
      setShowButton(
        await fetchJupyterLabDesktopAPI()
          .then((res) => Boolean(res.ok))
          .catch(() => false)
      )
    }
    checkJupyterAPI()
  }, [])

  if (showButton) {
    return (
      <a
        href={JL_DESKTOP_EXAMPLE_URI}
        title={title}
        className="jupyter-icon-button"
        target="_blank"
        rel="noopener noreferrer"
      >
        <JupyterDesktopIcon />
      </a>
    )
  } else {
    return null
  }
}

export default JupyterDesktopButton
