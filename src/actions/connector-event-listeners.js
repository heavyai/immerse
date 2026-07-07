// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  handleErrorLogout,
  setIdleTimeout
} from "actions/session-action-creators"
import { destroySession } from "../services/session"

const connectorErrorEventHandler = (dispatch, connector) => (e) => {
  if (connector.isTimeoutError(e)) {
    dispatch(handleErrorLogout(destroySession))
  }
}

export function initConnectorErrorListener() {
  return (dispatch, getState, services) => {
    const connector = services.get("DbCon")
    connector.events.on(
      connector.EVENT_NAMES.ERROR,
      connectorErrorEventHandler(dispatch, connector)
    )
  }
}

export const initConnectorMethodCalledListener = () => (
  dispatch,
  getState,
  services
) => {
  const connector = services.get("DbCon")
  connector.events.on(connector.EVENT_NAMES.METHOD_CALLED, () =>
    dispatch(setIdleTimeout())
  )
}
