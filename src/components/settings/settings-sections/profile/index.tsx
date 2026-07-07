// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import deepEquals from "fast-deep-equal"
import { CircularProgress } from "@material-ui/core"

import { TextField } from "widgets/text-field/TextField"
import { AppState } from "vega/charts/types"
import { UserMetadata } from "components/settings/types"
import ChangesSnackbar from "components/settings/changes-snackbar"
import ReleaseCard from "components/settings/release-card"

import "./styles.scss"

// TODO replace with real call
const mockGetProfile = async (): Promise<UserMetadata> => {
  await new Promise((resolve) => setTimeout(resolve, 20))

  return {
    username: "user.name",
    firstName: "firstname",
    lastName: "lastname",
    title: "middleend dev",
    email: "abc@heavier.pizza",
    roles: []
  }
}

// TODO replace with real call
const mockSaveChanges = async (
  newProfileSettings: UserMetadata,
  _username: string
) => {
  await new Promise((resolve) => setTimeout(resolve, 20))

  return newProfileSettings
}

const ProfileSettings = () => {
  const username = useSelector(
    (state: AppState) => state.connection.user.username
  )

  const [profileFields, setProfileFields] = useState<UserMetadata | null>(null)
  const [
    savedProfileFields,
    setSavedProfileFields
  ] = useState<UserMetadata | null>(null)
  const [profileLoading, setProfileLoading] = useState<boolean>(false)

  const fetchProfileFields = useCallback(async () => {
    setProfileLoading(true)
    const fetchedFields = await mockGetProfile()
    setProfileFields(fetchedFields)
    setSavedProfileFields(fetchedFields)
    setProfileLoading(false)
  }, [])

  useEffect(() => {
    fetchProfileFields()
  }, [fetchProfileFields])

  if (profileLoading || profileFields === null) {
    return <CircularProgress />
  }

  const saveChanges = async () => {
    // TODO: Add validation (requirements TBD)
    const res = await mockSaveChanges(profileFields, username)
    setSavedProfileFields(res)
  }

  return (
    <div className="profile-settings">
      {!deepEquals(savedProfileFields, profileFields) && (
        <ChangesSnackbar
          onReset={() => setProfileFields(savedProfileFields)}
          onSave={saveChanges}
        />
      )}
      <ReleaseCard />
      <header className="settings__content__header">
        <h1>Profile</h1>
        <p>
          General information about yourself such as your display name and
          username.
        </p>
      </header>
      <div className="profile-settings__fields">
        <div className="profile-settings__fields__vitals">
          <div className="profile-settings__input-wrapper">
            <TextField
              data-testid="profile-username-input"
              icon="person"
              label="Username"
              onChange={(e) =>
                setProfileFields({ ...profileFields, username: e.target.value })
              }
              value={profileFields.username}
            />
          </div>
          <div className="profile-settings__input-wrapper">
            <TextField
              data-testid="profile-email-input"
              icon="email"
              label="Email"
              onChange={(e) =>
                setProfileFields({ ...profileFields, email: e.target.value })
              }
              value={profileFields.email}
            />
          </div>
        </div>

        <div className="profile-settings__fields__additional-info">
          <header>
            <h4>Additional Information</h4>
            <p>Tell us more about yourself.</p>
          </header>
          <div className="profile-settings__name-fields">
            <div className="profile-settings__input-wrapper">
              <TextField
                data-testid="profile-title-first-name"
                label="First Name"
                onChange={(e) =>
                  setProfileFields({
                    ...profileFields,
                    firstName: e.target.value
                  })
                }
                value={profileFields.firstName}
              />
            </div>
            <div className="profile-settings__input-wrapper">
              <TextField
                data-testid="profile-title-last-name"
                label="Last Name"
                onChange={(e) =>
                  setProfileFields({
                    ...profileFields,
                    lastName: e.target.value
                  })
                }
                value={profileFields.lastName}
              />
            </div>
          </div>
        </div>
        <div className="profile-settings__input-wrapper">
          <TextField
            data-testid="profile-title-input"
            icon="work"
            label="Title"
            onChange={(e) =>
              setProfileFields({ ...profileFields, title: e.target.value })
            }
            value={profileFields.title}
          />
        </div>
      </div>
    </div>
  )
}
export default ProfileSettings
