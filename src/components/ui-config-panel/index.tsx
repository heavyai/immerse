// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useState } from "react"
import { connect, ConnectedProps } from "react-redux"
import { AnyAction } from "redux"
import { ThunkDispatch } from "redux-thunk"
import { isEmpty, isEqual } from "lodash"
import cx from "classnames"

import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import { Tooltip } from "@rmwc/tooltip"
import { Icon } from "@rmwc/icon"
import { CollapsibleList } from "@rmwc/list"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import {
  setPreviewStyles,
  saveDatabaseStyles,
  resetToThemeDefaults,
  resetDashboardStyles
} from "actions/user-configurable-ui-action-creators"
import { hideWarningModal, showWarningModal } from "actions/ui-action-creators"
import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"

import SectionTitle from "components/dashboard-config-panel/components/section-title"
import { DEFAULT_DB_CONFIG_USER_ROLE } from "components/ui-config-panel/constants"
import { toggleHighContrastColorClasses } from "components/ui-config-panel/utils"
import TextSection from "components/ui-config-panel/TextSection"
import ChartSection from "components/ui-config-panel/ChartSection"
import ColorPaletteSection from "components/ui-config-panel/ColorPaletteSection"
import { UserConfig, PreviewStyles } from "components/ui-config-panel/types"
import { AppState } from "vega/charts/types"

import "./UIConfig.scss"

const {
  SHOW_UI_CONFIG_PANEL_AXIS_TRUNC,
  SHOW_UI_CONFIG_PANEL_COLOR_PALETTES,
  SHOW_UI_CONFIG_PANEL_CHART_MARGIN
} = available_feature_flags

const mapStateToProps = (state: AppState) => {
  const isAdminUser =
    state.connection?.isSuperuser ||
    state.connection?.roles?.includes(
      state.connection?.user?.uiConfigRole || DEFAULT_DB_CONFIG_USER_ROLE
    )
  const showAxisTruncation =
    getFeatureFlag(SHOW_UI_CONFIG_PANEL_AXIS_TRUNC) || isAdminUser
  const showColorPalettes =
    getFeatureFlag(SHOW_UI_CONFIG_PANEL_COLOR_PALETTES) || isAdminUser
  const showChartMargin =
    getFeatureFlag(SHOW_UI_CONFIG_PANEL_CHART_MARGIN) || isAdminUser

  return {
    // The current computed styles based on servers.json, saved styles, and
    // preview styles
    settingsFinal: getUserConfigurableUISettings(state),
    // While we use `settingsFinal` to determine what we actually display, we
    // need the following to determine differences between settings and whether
    // save buttons should be enabled/disabled
    settingsDashboard: state.dashboard.userConfigurableUI,
    settingsDatabase: state.userConfigurableUI?.savedDatabaseStyles,
    settingsPreview: state.userConfigurableUI?.previewStyles,
    isAdminUser,
    showAxisTruncation,
    showColorPalettes,
    showChartMargin
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>
) => {
  return {
    actions: {
      setPreviewStyles: (styles: PreviewStyles) => {
        dispatch(setPreviewStyles(styles))
      },
      resetDashboardStyles: () => {
        dispatch(
          showWarningModal({
            title: "Reset Dashboard Settings",
            message: (
              <div>
                <p>
                  Do you want to reset this dashboard&apos;s settings to its
                  original defaults?
                </p>
              </div>
            ),
            primaryAction: {
              action: () => dispatch(resetDashboardStyles()),
              text: "Restore default settings"
            },
            secondaryAction: {
              action: () => dispatch(hideWarningModal()),
              text: "Cancel"
            }
          })
        )
      },
      saveDatabaseStyles: () => {
        dispatch(
          showWarningModal({
            title: "Set Default Theme for Database",
            message: (
              <div>
                <p>
                  This theme will be set as the default for all dashboards on
                  this database.
                </p>
                <p>
                  <b>
                    Dashboards that have saved styles will override this
                    default.
                  </b>
                </p>
                <p>
                  Are you sure you want to set this theme as the default
                  experience?
                </p>
              </div>
            ),
            primaryAction: {
              action: () => dispatch(saveDatabaseStyles()),
              text: "Set as database default"
            },
            secondaryAction: {
              action: () => dispatch(hideWarningModal()),
              text: "Cancel"
            }
          })
        )
      },
      resetToDefaults: () => {
        dispatch(
          showWarningModal({
            title: "Reset to Original Theme Settings",
            message: (
              <div>
                <p>
                  This theme will automatically be applied to all dashboards
                  within the database.
                </p>
                <p>
                  Are you sure you want to reset all dashboards to the original
                  theme?
                </p>
              </div>
            ),
            primaryAction: {
              action: () => dispatch(resetToThemeDefaults()),
              text: "Restore original theme"
            },
            secondaryAction: {
              action: () => dispatch(hideWarningModal()),
              text: "Cancel"
            }
          })
        )
      }
    }
  }
}

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>,
  {},
  AppState
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector>

const UIConfigPanel: FC<Props> = ({
  settingsFinal,
  settingsDashboard,
  settingsDatabase,
  settingsPreview,
  actions,
  isAdminUser,
  showAxisTruncation,
  showColorPalettes,
  showChartMargin
}) => {
  const [showAdminControls, setShowAdminControls] = useState<boolean>(false)

  const setTextSettings = (textSettings: UserConfig["text"]) => {
    actions.setPreviewStyles({
      text: textSettings
    })
  }

  const setLabelSettings = (labelSettings: UserConfig["label"]) => {
    actions.setPreviewStyles({
      label: labelSettings
    })
  }

  const setChartSettings = (chartSettings: UserConfig["chart"]) => {
    actions.setPreviewStyles({
      chart: chartSettings
    })
  }

  const setColorPalettes = (colorPalettes: UserConfig["colorPalettes"]) => {
    actions.setPreviewStyles({
      colorPalettes
    })
  }

  const setHighContrastFontColors = (enabled: boolean) => {
    actions.setPreviewStyles({
      highContrastFontColors: enabled
    })
  }

  useEffect(() => {
    // This block enables previewing high contrast colors.
    toggleHighContrastColorClasses(settingsFinal.highContrastFontColors)
  })

  // If there are no styles saved to the dashboard or styles that the user is
  // currently previewing (unsaved dashboard styles)
  const hasNoCustomSettings =
    isEmpty(settingsPreview) && isEmpty(settingsDashboard)

  // The Reset Dashboard button resets back to the database defaults (or system
  // defaults if database settings don't exist). Disable it if the user hasn't
  // made any changes to the panel (i.e. "preview" settings are empty) or hasn't
  // saved any custom dashboard styles
  const shouldDisableResetDashboard = hasNoCustomSettings

  // Whether there are any settings saved to the dashboard (vs saved to the
  // database, or unsaved changes on the dashboard)
  const hasSavedDashboardSettings = !isEmpty(settingsDashboard)

  // Disable the Save Defaults button if the user hasn't made any changes to the
  // panel or saved any dashboard styles, or those styles are the same as the
  // database defaults (e.g. right after saving)
  const shouldDisableSaveDefaults =
    hasNoCustomSettings || isEqual(settingsFinal, settingsDatabase)

  const shouldDisableResetDefaults = isEmpty(settingsDatabase)

  return (
    <div
      className="dashboard-config-panel ui-config"
      data-testid="ui-config-panel"
    >
      <div className="ui-config__upper">
        <div className="ui-config__title">UI Settings</div>
        <CollapsibleList
          startOpen
          handle={<SectionTitle title="Chart fonts" />}
        >
          <TextSection
            textStyles={settingsFinal.text}
            setTextSettings={setTextSettings}
            highContrastFontColors={settingsFinal.highContrastFontColors}
            setHighContrastFontColors={setHighContrastFontColors}
          />
        </CollapsibleList>
        <CollapsibleList
          startOpen
          handle={<SectionTitle title="Chart settings" />}
        >
          <ChartSection
            showAxisTruncation={showAxisTruncation}
            showChartMargin={showChartMargin}
            userSettings={settingsFinal}
            setChartSettings={setChartSettings}
            setLabelSettings={setLabelSettings}
          />
        </CollapsibleList>
        {showColorPalettes && (
          <CollapsibleList
            startOpen
            handle={<SectionTitle title="Color palettes" />}
          >
            <ColorPaletteSection
              colorPalettes={settingsFinal.colorPalettes}
              setColorPalettes={setColorPalettes}
            />
          </CollapsibleList>
        )}
        <div className="ui-config__actions">
          <PrimaryButton
            onClick={actions.resetDashboardStyles}
            disabled={shouldDisableResetDashboard}
            data-testid="ui-config-action-reset"
          >
            Reset dashboard settings
          </PrimaryButton>
          <Tooltip
            enterDelay={500}
            content={
              <div className="ui-config__reset-tooltip">
                <p>Resets dashboard settings to defaults</p>
                <p>
                  These settings can be saved by
                  <br />
                  saving your dashboard
                </p>
              </div>
            }
          >
            <Icon icon={{ icon: "info", size: "xsmall" }} />
          </Tooltip>
        </div>
        {hasSavedDashboardSettings && (
          <div className="ui-config__help-text">
            This dashboard has saved styles
          </div>
        )}
      </div>

      {isAdminUser && (
        <div className="ui-config__admin">
          <header
            className={cx("ui-config__admin__header", {
              "is-open": showAdminControls
            })}
            onClick={() => setShowAdminControls(!showAdminControls)}
            data-testid="ui-config-action-toggle"
          >
            <span>Configure defaults</span>
            <Icon icon={{ icon: "settings", size: "small" }} />
          </header>
          {showAdminControls && (
            <div className="ui-config__admin__actions">
              {isEmpty(settingsDatabase) && (
                <p className="ui-config__help-text">
                  You currently have no defaults saved.
                </p>
              )}
              <Tooltip
                enterDelay={500}
                content="Saves UI settings as the default for all users logged into this database"
              >
                <PrimaryButton
                  disabled={shouldDisableSaveDefaults}
                  onClick={actions.saveDatabaseStyles}
                  data-testid="ui-config-action-save"
                >
                  Save settings as default
                </PrimaryButton>
              </Tooltip>
              <Tooltip
                enterDelay={500}
                content="Resets UI settings to system defaults"
              >
                <SecondaryButton
                  onClick={actions.resetToDefaults}
                  // Disable the reset button if the database settings are already
                  // the same as the defaults, or there are no database settings
                  disabled={shouldDisableResetDefaults}
                  data-testid="ui-config-action-reset-original"
                >
                  Reset defaults
                </SecondaryButton>
              </Tooltip>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default connector(UIConfigPanel)
