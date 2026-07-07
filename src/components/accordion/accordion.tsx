// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import cx from "classnames"
import IconTrash from "components/svg-icons/icon-trash"
import IconLeftArrow from "components/svg-icons/icon-left-arrow"
import {
  DataSelectionPanelFeatures,
  DEFAULT_SUPPORTED_FEATURES
} from "vega/data-selection/constants"

interface AccordionContents {
  label: string
  content: React.ReactNode
  onSelectFold: (foldIndex: number) => void
  onDeleteFold: (foldIndex: number) => void
}

interface AccordionProps {
  contents: AccordionContents[]
  CTALabel: string
  CTAtestid: string
  currentlySelectedFold: number
  onCTAClick: () => void
  shouldShowCTA: boolean
  testid: string
  isSingleLayer?: boolean
  supportedFeatures?: DataSelectionPanelFeatures
}

interface FoldProps {
  content: React.ReactNode
  foldLabel: string
  foldNumber: number
  isActive: boolean
  onDeleteFold?: (n: number) => void
  onSelectFold: (n: number) => void
  isSingleLayer?: boolean
}

const getTestId = (modifer: string) => `accordion-${modifer}`

class Fold extends React.PureComponent<FoldProps, {}> {
  onFoldClick = () => {
    if (!this.props.isActive) {
      this.props.onSelectFold(this.props.foldNumber)
    }
  }

  onDeleteClick = () =>
    this.props.onDeleteFold
      ? this.props.onDeleteFold(this.props.foldNumber)
      : null

  render() {
    const {
      content,
      foldLabel,
      isActive,
      onDeleteFold,
      isSingleLayer
    } = this.props

    const shouldShowDeleteButton =
      isSingleLayer !== undefined
        ? !isSingleLayer && onDeleteFold && isActive
        : onDeleteFold && isActive

    const foldClassNames = cx("fold", {
      open: isActive,
      closed: !isActive
    })

    return (
      <div className={foldClassNames} data-testid={getTestId("fold")}>
        <div
          className={"fold-trigger-container"}
          data-testid={getTestId("label")}
        >
          <div className={"fold-trigger"} onClick={this.onFoldClick}>
            <div className="fold-title">{foldLabel}</div>
            {shouldShowDeleteButton && (
              <div
                data-testid={getTestId("delete")}
                className={"button icon-button fold-remove-button"}
                onClick={this.onDeleteClick}
              >
                <IconTrash />
              </div>
            )}
            <div className={`fold-indicator ${isActive ? "open" : ""}`}>
              <IconLeftArrow />
            </div>
          </div>
        </div>
        <div
          key="content"
          className={`fold-content ${isActive ? "open" : ""}`}
          data-testid={getTestId("content")}
        >
          {content}
        </div>
      </div>
    )
  }
}

interface AccordionCTAProps {
  CTALabel: string
  onCTAClick: () => void
  shouldShowCTA: boolean
  CTAtestid: string
}

const AccordionCTA: FC<AccordionCTAProps> = ({
  shouldShowCTA,
  CTAtestid,
  CTALabel,
  onCTAClick
}) => (
  <div
    className={cx("accordion-cta", {
      hidden: !shouldShowCTA
    })}
  >
    <button className="button" data-testid={CTAtestid} onClick={onCTAClick}>
      {CTALabel}
    </button>
  </div>
)

const Accordion = ({
  contents,
  CTALabel,
  CTAtestid,
  currentlySelectedFold,
  onCTAClick,
  shouldShowCTA,
  testid,
  isSingleLayer,
  supportedFeatures = DEFAULT_SUPPORTED_FEATURES
}: AccordionProps) => (
  <div className={"accordion"} data-testid={testid}>
    {contents.map(({ content, label, onSelectFold, onDeleteFold }, i) => (
      <Fold
        key={`source-${i}`}
        content={content}
        foldLabel={label}
        onSelectFold={onSelectFold}
        onDeleteFold={onDeleteFold}
        isActive={i === currentlySelectedFold}
        foldNumber={i}
        isSingleLayer={isSingleLayer}
      />
    ))}
    {supportedFeatures?.multiLayer && (
      <AccordionCTA
        onCTAClick={onCTAClick}
        shouldShowCTA={shouldShowCTA}
        CTAtestid={CTAtestid}
        CTALabel={CTALabel}
      />
    )}
  </div>
)

export default Accordion
