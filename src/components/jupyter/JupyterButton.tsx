// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { connect } from "react-redux"
import { SecondaryButtonNoBorder } from "widgets/button/Button"

import JupyterIcon from "components/svg-icons/icon-jupyter"
import { DEFAULT_JUPYTER_ROLE } from "./constants"
import "./JupyterButton.scss"

const mapStateToProps = (state) => ({
  showButton: Boolean(
    state.connection &&
      state.connection.user &&
      state.connection.user.enableJupyter &&
      (state.connection.isSuperuser ||
        state.connection.roles.includes(
          state.connection.user.jupyterRole || DEFAULT_JUPYTER_ROLE
        ))
  )
})

type StateProps = ReturnType<typeof mapStateToProps>

interface OwnProps {
  iconOnly: boolean
  sql?: string
}

type Props = StateProps & OwnProps

const JupyterButton: FC<Props> = ({ iconOnly, showButton = true, sql }) => {
  if (!showButton) {
    return <></>
  }

  let url = `${
    (window as any).IMMERSE_PATH_PREFIX || ""
  }/jupyter/hub/login?newnotebook=true`
  let buttonText = "Open Jupyter"
  let title = "Open Jupyter"
  if (sql) {
    url += `&sql=${encodeURIComponent(sql)}`
    buttonText = "Send to Jupyter"
    title = "Send SQL query to a Jupyter notebook"
  }

  if (iconOnly) {
    return (
      <a
        href={url}
        title={title}
        className="jupyter-icon-button"
        target="_blank"
        rel="noopener noreferrer"
      >
        <JupyterIcon />
      </a>
    )
  }

  return (
    <a
      href={url}
      className="jupyter-button"
      title={title}
      target="_blank"
      rel="noopener noreferrer"
    >
      <SecondaryButtonNoBorder icon={<JupyterIcon />}>
        {buttonText}
      </SecondaryButtonNoBorder>
    </a>
  )
}

export default connect(mapStateToProps)(JupyterButton)
