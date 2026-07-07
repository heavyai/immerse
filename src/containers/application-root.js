// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Provider } from "react-redux"
import { hot } from "react-hot-loader/root"
import React from "react"
import CustomStylesOverride from "components/custom-styles-override/custom-styles-override"
import { DragDropContext } from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"
import HeavyServicesProvider from "./heavy-services-provider"
import { Router } from "react-router-dom"
import Routes from "../routes"
import history from "services/history"
import AppContainer from "containers/application-container"
import SVGIcons from "components/svg-icons"
import "react-dates/initialize"
import "react-dates/lib/css/_datepicker.css"
import store from "store/store"
import { ConnectedRouter } from "connected-react-router"
import ImmerseUIProvider from "services/immerse-ui-provider/ImmerseUIProvider"

const AppRoot = () => (
  <React.Fragment>
    <SVGIcons />
    <ImmerseUIProvider>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <HeavyServicesProvider services={store.services}>
            <React.Fragment>
              <Router history={history}>
                <AppContainer>
                  <Routes />
                </AppContainer>
              </Router>
              <CustomStylesOverride />
            </React.Fragment>
          </HeavyServicesProvider>
        </ConnectedRouter>
      </Provider>
    </ImmerseUIProvider>
  </React.Fragment>
)

export default hot(DragDropContext(HTML5Backend)(AppRoot))
