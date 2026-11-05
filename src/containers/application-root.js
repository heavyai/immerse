// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Provider } from "react-redux"
import React from "react"
import CustomStylesOverride from "components/custom-styles-override/custom-styles-override"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import HeavyServicesProvider from "./heavy-services-provider"
import Routes from "../routes"
import history from "services/history"
import AppContainer from "containers/application-container"
import SVGIcons from "components/svg-icons"
import store from "store/store"
import { NavigationSync } from "services/navigation"
import ImmerseUIProvider from "services/immerse-ui-provider/ImmerseUIProvider"

const AppRoot = () => (
  <React.Fragment>
    <SVGIcons />
    <ImmerseUIProvider>
      <Provider store={store}>
        <NavigationSync history={history}>
          <HeavyServicesProvider services={store.services}>
            <React.Fragment>
              <>
                <AppContainer>
                  <Routes />
                </AppContainer>
              </>
              <CustomStylesOverride />
            </React.Fragment>
          </HeavyServicesProvider>
        </NavigationSync>
      </Provider>
    </ImmerseUIProvider>
  </React.Fragment>
)

export default function Application() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AppRoot />
    </DndProvider>
  )
}
