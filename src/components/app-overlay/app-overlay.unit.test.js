// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, waitFor, screen } from "@testing-library/react"

import {
  AppOverlay,
  getErrorMessageAndAction,
  getLoadingMessage
} from "./app-overlay"
import * as allErrorMsgs from "constants/error-messages"
import {
  DANGER as DANGER_MODAL_TYPE,
  WARNING as WARNING_MODAL_TYPE,
  INFO as INFO_MODAL_TYPE,
  CUSTOM_MODAL_TYPES_SET
} from "constants/modal-types"

describe("AppOverlay Component", () => {
  describe("render", () => {
    it("should not render if shouldRenderOverlay is false", () => {
      const { container } = render(
        <AppOverlay shouldRenderOverlay={false} modal={{}} />
      )
      expect(container.firstChild).toBeNull()
    })

    it("should show LoadingWidget if shouldShowLoading prop is true", () => {
      const { getByTestId } = render(
        <AppOverlay shouldShowLoading modal={{}} />
      )
      expect(getByTestId("loading-widget")).toBeInTheDocument()
    })

    it("should show CustomModal if shouldShowModal prop is true and type is a CustomModal type", () => {
      test.each(CUSTOM_MODAL_TYPES_SET, async (customModalType) => {
        render(
          <AppOverlay
            shouldShowModal
            modal={{
              type: customModalType
            }}
          />
        )
        await waitFor(() => {
          expect(screen.getByTestId("custom-modal")).toBeInTheDocument()
        })
      })
    })

    it("should show use a generic simpleDialog if shouldShowModal prop is true and no type is passed", async () => {
      render(<AppOverlay shouldShowModal modal={{}} />)
      await waitFor(() => {
        expect(screen.getByTestId("simple-dialog")).toBeInTheDocument()
      })
    })

    it("should show use Heavydb-Ui Dialog of the correct type if shouldShowModal prop is true and type is info, warning, or danger", () => {
      const modalTypes = [
        [DANGER_MODAL_TYPE, "simple-danger-dialog"],
        [WARNING_MODAL_TYPE, "simple-warning-dialog"],
        [INFO_MODAL_TYPE, "simple-info-dialog"]
      ]
      test.each(modalTypes, ([modalType, testId]) => {
        render(
          <AppOverlay
            shouldShowModal
            modal={{
              type: modalType
            }}
          />
        )
        expect(screen.getByTestId(testId)).toBeInTheDocument()
      })
    })
  })

  describe("getLoadingMessage", () => {
    let state

    beforeEach(() => {
      state = {
        tables: {
          loading: false
        },
        dashboards: {
          dashboardLoading: false,
          loading: false
        },
        importer: {
          loading: false
        },
        connection: {
          loading: false
        },
        settings: {
          users: [],
          roles: []
        }
      }
    })

    it("should return Loading Table", () => {
      state.tables.loading = true
      const message = getLoadingMessage(state)
      expect(message).toBe("Loading")
    })

    it("should return Loading Dashboard", () => {
      state.dashboards.dashboardLoading = true
      const message = getLoadingMessage(state)
      expect(message).toBe("Loading Dashboard")
    })

    it("should return Loading Dashboards", () => {
      state.dashboards.loading = true
      const message = getLoadingMessage(state)
      expect(message).toBe("Loading Dashboards")
    })

    it("should return Loading Data Preview", () => {
      state.importer.loading = true
      const message = getLoadingMessage(state)
      expect(message).toBe("Loading Data Preview")
    })

    it("should return Connecting", () => {
      state.connection.loading = true
      const message = getLoadingMessage(state)
      expect(message).toBe("Connecting")
    })

    it("should return Nadda", () => {
      const message = getLoadingMessage(state)
      expect(message).toBe("")
    })
  })

  describe("errorMsg", () => {
    const state = {
      tables: { error: false },
      dashboards: {
        delete: { error: false },
        error: false
      },
      dashboard: {
        saveLinkState: { error: false },
        saveState: { error: false },
        loadState: { error: false },
        copyState: { error: false }
      },
      dc: {
        initialRender: {
          error: false
        },
        renderAll: {
          error: false
        },
        redrawAll: {
          error: false
        }
      }
    }

    it("should display get tables error", () => {
      const tablesError = "tablesError"
      const error = getErrorMessageAndAction({
        ...state,
        tables: { error: tablesError }
      })
      expect(error.heading).toEqual(allErrorMsgs.GET_TABLES_ERROR_HEADING)
      expect(error.content).toEqual(tablesError)
    })

    it("should display get dashboards error", () => {
      const dashboardsError = "dashboardsError"
      const error = getErrorMessageAndAction({
        ...state,
        dashboards: { error: dashboardsError }
      })
      expect(error.heading).toEqual(allErrorMsgs.GET_DASHBOARDS_ERROR_HEADING)
      expect(error.content).toEqual(dashboardsError)
    })

    it("should display save dashboard error", () => {
      const saveErrorMessage = "saveError"
      const error = getErrorMessageAndAction({
        ...state,
        dashboard: {
          saveState: { error: saveErrorMessage },
          loadState: { error: false }
        }
      })
      expect(error.heading).toEqual(allErrorMsgs.SAVE_DASHBOARD_ERROR_HEADING)
      expect(error.content).toEqual(saveErrorMessage)
    })

    it("should show load dashboard error", () => {
      const loadErrorMessage = "loadError"
      const error = getErrorMessageAndAction({
        ...state,
        dashboard: {
          saveState: { error: false },
          loadState: { error: loadErrorMessage }
        }
      })
      expect(error.heading).toEqual(allErrorMsgs.LOAD_DASHBOARD_ERROR_HEADING)
      expect(error.content).toEqual(loadErrorMessage)
    })

    it("should show delete dashboard error", () => {
      const id = 123
      const error = getErrorMessageAndAction({
        ...state,
        dashboards: {
          error: false,
          delete: { error: true, id }
        }
      })
      expect(error.heading).toEqual(allErrorMsgs.DELETE_DASHBOARD_ERROR_HEADING)
      expect(error.content).toEqual(
        `${allErrorMsgs.DELETE_DASHBOARD_ERROR_CONTENT} ${id}`
      )
    })
  })
})
