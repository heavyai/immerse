// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { PrimaryButton } from "widgets/button/Button"
import releaseCard from "assets/imgs/release-card.png"

import "./styles.scss"
import {
  retrieveFromLocalStorage,
  storeInLocalStorage
} from "utils/local-storage"
import { RELEASE_NOTES } from "constants/hyperlinks"

const RELEASE_CARD_STORAGE_KEY = "dismissedReleaseCardVersion"

const ReleaseCard = () => {
  const currentVal = retrieveFromLocalStorage(RELEASE_CARD_STORAGE_KEY, {
    defaultValue: null,
    asJSON: false
  })

  const releaseVersion = "6.2"
  const [showCard, setShowCard] = useState(currentVal !== releaseVersion)

  const onDismiss = () => {
    storeInLocalStorage(RELEASE_CARD_STORAGE_KEY, releaseVersion)
    setShowCard(false)
  }

  return showCard ? (
    <div className="release-card">
      <img className="release-card__image" src={releaseCard} />
      <div className="release-card__content">
        <div>
          <h3>New Heavy.AI {releaseVersion} has landed!</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat
          </p>
        </div>
        <footer>
          <span onClick={onDismiss}>Dismiss</span>
          <a href={RELEASE_NOTES} target="_blank" rel="noreferrer">
            <PrimaryButton onClick={null} label="See Change Log" />
          </a>
        </footer>
      </div>
    </div>
  ) : null
}

export default ReleaseCard
