// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/no-did-update-set-state */

import React, { PureComponent } from "react"
import { connect, ConnectedProps } from "react-redux"
import { SimpleDialog } from "widgets/dialog/Dialog"
import { bindActionCreators, Dispatch } from "redux"

// Sections
import TableSection from "./components/table-section"
import SearchSection from "./components/search-section"
import SelectedCategorySection from "./components/selected-category-section"

import {
  hideCategorySelectionModal,
  makeCategorySelection,
  OnApplyAction
} from "actions/category-selection-modal-action-creators"
import { getDistinctColumnValues } from "actions/column-values-action-creators"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { CATEGORY_MODAL_LIMIT } = available_feature_flags

interface ColumnData {
  col: string
  num: number
}

export interface Category {
  id: string
  label: string
  num: number
  selected: boolean
}

interface StateProps {
  dataSource: string
  column: string
  onApplyAction: OnApplyAction
  previousSelections: string[]
  columnData: ColumnData[]
  loadingData: boolean
  error: boolean
  errorMessage: string
  modalTitle: string
}

interface State {
  categories: Category[]
  filterText: string
  hitQueryLimit: boolean
}

export class CategorySelectionModal extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      categories: [],
      selectedCategoryValues: props.previousSelections || [],
      filterText: "",
      hitQueryLimit: false
    }
  }
  componentDidMount = () => {
    const limit = getFeatureFlag(CATEGORY_MODAL_LIMIT)
    this.props.actions.getDistinctColumnValues({
      dataSource: this.props.dataSource,
      column: this.props.column,
      searchTerm: this.state.filterText,
      limit,
      excludeNulls: true,
      ignoredDashboardFilters: [this.props?.onApplyAction?.filterName]
    })
    document.addEventListener("keypress", this.listenForEnter)
  }
  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.loadingData && !this.props.loadingData) {
      const limit = getFeatureFlag(CATEGORY_MODAL_LIMIT)
      this.setState({
        categories: this.props.columnData.map((row: ColumnData) => ({
          id: row.col,
          label: String(row.col),
          num: row.num
        })),
        hitQueryLimit: this.props.columnData.length >= limit
      })
    }
  }
  componentWillUnmount = () => {
    document.removeEventListener("keypress", this.listenForEnter)
  }
  listenForEnter = (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      this.done()
    }
  }
  toggleCategory = (categoryId, isSelected) => {
    if (isSelected) {
      this.setState({
        selectedCategoryValues: [
          ...this.state.selectedCategoryValues,
          categoryId
        ]
      })
    } else {
      this.setState({
        selectedCategoryValues: this.state.selectedCategoryValues.filter(
          (categoryValue) => categoryValue !== categoryId
        )
      })
    }
  }
  deselectCategory = (categoryId: Category["id"]) => {
    this.setState({
      selectedCategoryValues: this.state.selectedCategoryValues.filter(
        (categoryValue) => categoryValue !== categoryId
      )
    })
  }
  selectAllCategories = () => {
    // Add all categories in state if not already present in selected values
    this.setState({
      selectedCategoryValues: [
        ...this.state.selectedCategoryValues,
        ...this.state.categories
          .filter(
            (category) =>
              !this.state.selectedCategoryValues.includes(category.id)
          )
          .map((category) => category.id)
      ]
    })
  }
  deselectAllCategories = () => {
    // Note that this won't deselect values that weren't in the table
    this.setState({
      selectedCategoryValues: this.state.selectedCategoryValues.filter(
        (selectedCategory) =>
          !this.state.categories
            .map((category) => category.id)
            .includes(selectedCategory)
      )
    })
  }
  setFilter = (text = "") =>
    this.setState({ filterText: text }, () => {
      const limit = getFeatureFlag(CATEGORY_MODAL_LIMIT)
      this.props.actions.getDistinctColumnValues({
        dataSource: this.props.dataSource,
        column: this.props.column,
        searchTerm: this.state.filterText,
        limit,
        excludeNulls: true,
        ignoredDashboardFilters: [this.props.onApplyAction?.filterName]
      })
    })
  done = () => {
    this.props.actions.makeCategorySelection(
      this.state.selectedCategoryValues,
      this.props.onApplyAction
    )
    this.props.actions.hideCategorySelectionModal()
  }
  render() {
    return (
      <SimpleDialog
        title={this.props.modalTitle}
        footer={
          <>
            <SecondaryButton
              onClick={this.props.actions.hideCategorySelectionModal}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={this.done}>Done</PrimaryButton>
          </>
        }
        open
        onClose={this.props.actions.hideCategorySelectionModal}
        className={"category-selection-modal"}
        data-testid="category-selection-modal"
      >
        {this.props.error ? (
          <div className="csm-error-message">
            <div className="csm-error-message-header">
              Error loading column information
            </div>
            <div className="csm-error-message-body">
              {this.props.errorMessage}
            </div>
          </div>
        ) : (
          <React.Fragment>
            <SearchSection
              setFilter={this.setFilter}
              filterText={this.state.filterText}
              loading={this.props.loadingData}
            />
            <SelectedCategorySection
              selectedCategories={this.state.selectedCategoryValues}
              deselectCategory={this.deselectCategory}
            />
            {this.state.hitQueryLimit && (
              <p className="csm-query-limit-message">
                Showing the top {getFeatureFlag(CATEGORY_MODAL_LIMIT)} values.
                Use search if your desired value is not found below.
              </p>
            )}
            <TableSection
              categories={this.state.categories}
              selectedCategoryValues={this.state.selectedCategoryValues}
              toggleCategory={this.toggleCategory}
              selectAllCategories={this.selectAllCategories}
              deselectAllCategories={this.deselectAllCategories}
            />
          </React.Fragment>
        )}
      </SimpleDialog>
    )
  }
}

const mapStateToProps = (state): StateProps => {
  const { ui, columnValues } = state
  const {
    dataSource,
    column,
    onApplyAction,
    previousSelections = [],
    modalTitle = "Category Selector"
  } = ui.modal
  const columnData =
    (columnValues[dataSource] && columnValues[dataSource][column]) || {}

  return {
    dataSource,
    column,
    onApplyAction,
    loadingData: columnData.loading,
    error: columnData.error,
    errorMessage: columnData.errorMessage?.error_msg || "",
    columnData: columnData.distinctValues || [],
    previousSelections,
    modalTitle
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: bindActionCreators(
    {
      hideCategorySelectionModal,
      getDistinctColumnValues,
      makeCategorySelection
    },
    dispatch
  )
})

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector>

export default connector(CategorySelectionModal)
