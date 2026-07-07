// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import DbCon, { TPixel } from "@heavyai/connector/dist/browser-connector"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { createMockableConnector } from "./ConnectorWithMocks"
import APP_CONFIG from "constants/app-config"

const { SQLLogging, USE_BINARY_THRIFT } = available_feature_flags

// heavyai-charting requires this
window.TPixel = TPixel

const Connector = new DbCon()

export const spoofDbConnector = (config) => {
  // Spoof connector into thinking we called .connectAsync() so that it'll
  // just merrily make calls to thrift endpoints through OWS proxy where
  // authentication now takes place for Immerse
  // eslint-disable-next-line no-underscore-dangle
  Connector._protocol = [config.protocol]
  // eslint-disable-next-line no-underscore-dangle
  Connector._host = [config.host]
  // eslint-disable-next-line no-underscore-dangle
  Connector._port = [config.port]
  // eslint-disable-next-line no-underscore-dangle
  Connector._dbName = [config.database]
  // connector complains if we don't at least put arrays on username and password
  // eslint-disable-next-line no-underscore-dangle
  Connector._user = []
  // eslint-disable-next-line no-underscore-dangle
  Connector._password = []
  Connector.xhrWithCredentials(true)
  Connector.initClients()
  // initClients() wipes out _sessionId, so we do this after
  // eslint-disable-next-line no-underscore-dangle
  Connector._sessionId = ["IMMERSE_FAKE_SESSION_ID"]
  Connector.invertDatumTypes()
}

spoofDbConnector(APP_CONFIG)

if (getFeatureFlag(SQLLogging)) {
  Connector.logging(true)
}
if (getFeatureFlag(USE_BINARY_THRIFT)) {
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  Connector.useBinaryProtocol(true)
}

export default createMockableConnector(Connector)
