// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * line2-dc-adapter
 *
 * Used for setting up a fake (“dummy”) heavyai-charting
 * chart that we register in the global dc chart registry. We use
 * this chart to send/receive events from other charts (e.g. for
 * crossfiltering).
 *
 * For multi-source, we make each source it’s own dummy chart
 */
import dc from "services/dc"
import { dispatch as d3Dispatch } from "d3-dispatch"
import { getXAxisDimension } from "reducers/charts/helpers/multi-source-helpers"

export interface DcDimension {
  group: () => {
    writeFilter: () => string
  }
  filter: any
  filterAll: any
  dispose: () => void
}

class DataSource {
  dimension: DcDimension | null
  events: any
  dummyChart: any
  chartId: string
  table: string
  multiSourceIndexes: string[]
  constructor(table, chartId, multiSourceIndex) {
    this.dimension = null
    this.events = d3Dispatch("redrawGroup")
    this.dummyChart = dc.baseMixin({})
    this.chartId = chartId
    this.table = table
    this.multiSourceIndexes = [multiSourceIndex]

    // dataAsync is a potential hook for introducing a loading state for the chart
    this.dummyChart.dataAsync = (callback) => callback()
    // eslint-disable-next-line no-underscore-dangle
    this.dummyChart._doRender = this.renderRedraw
    // eslint-disable-next-line no-underscore-dangle
    this.dummyChart._doRedraw = this.renderRedraw
    this.dummyChart.dimension({})
    this.dummyChart.group({})
    this.dummyChart.generatePopup = () => null

    dc.registerChart(this.dummyChart, table)
  }
  getFilterString(): string {
    if (!this.dimension) {
      throw new Error(
        "Calling getfilterString before setting a dimension is not allowed."
      )
    }

    return this.dimension.group().writeFilter()
  }
  renderRedraw = () =>
    this.events.call("redrawGroup", this.dummyChart, this.getFilterString())
  setDimension(newDimension: DcDimension) {
    this.dimension = newDimension
  }
  filter(filter, timeBin, isExtract) {
    if (filter && filter.length) {
      this.dimension.filter(filter, undefined, undefined, undefined, [
        {
          extract: isExtract,
          timeBin: timeBin === "auto" && isExtract ? "isodow" : timeBin
        }
      ])
    } else {
      this.dimension.filterAll()
    }
  }
  filterAll() {
    this.dimension.filterAll()
  }
  redrawGroup() {
    if (dc.startRenderTime()) {
      return dc.redrawAllAsync(this.table)
    } else {
      return dc.renderAllAsync(this.table)
    }
  }
  destroy() {
    if (this.dimension) {
      this.dimension.filterAll()
    }
    this.events.on("redrawGroup", null)
    dc.deregisterChart(this.dummyChart, this.table)
    if (this.dimension) {
      this.dimension.dispose()
    }
  }
  addMultiSourceIndex(multiSourceIndex: string) {
    this.multiSourceIndexes.push(multiSourceIndex)
  }
}

export class DcAdapter {
  chartId: string
  dataSources: {
    [index: string]: DataSource
  }
  ownFilterString: any

  constructor(chartId) {
    this.chartId = chartId
    this.dataSources = {}
  }
  getEvents = (table) => this.dataSources[table].events
  forEachDataSource = (callback) =>
    Object.values(this.dataSources).forEach(callback)
  setDataSource(index, table) {
    if (typeof this.dataSources[table] === "undefined") {
      this.dataSources[table] = new DataSource(table, this.chartId, index)
    } else {
      this.dataSources[table].addMultiSourceIndex(index)
    }
  }
  setDimension(table, dimension) {
    this.dataSources[table].setDimension(dimension)
  }
  filter(filter, timeBin, isExtract) {
    this.forEachDataSource((dataSource: DataSource) => {
      dataSource.filter(filter, timeBin, isExtract)
    })
  }
  filterAll() {
    this.forEachDataSource((dataSource: DataSource) => {
      dataSource.filterAll()
    })
  }
  renderRedraw() {
    this.forEachDataSource((dataSource: DataSource) => {
      dataSource.renderRedraw()
    })
  }
  redrawGroup() {
    this.forEachDataSource((dataSource: DataSource) => {
      dataSource.redrawGroup()
    })
  }
  destroy() {
    this.forEachDataSource((dataSource: DataSource) => {
      dataSource.destroy()
    })
    this.dataSources = {}
  }
  init(dataSources, baseCrossfilter, querySpec, setFilterString: Function) {
    Object.values(dataSources).forEach(({ table, index }) => {
      const xDimension = getXAxisDimension(querySpec.dimensions, index)
      const crossfilter = baseCrossfilter.getCrossfilter(table, querySpec.id)
      const dimension =
        xDimension &&
        xDimension.value &&
        crossfilter.dimension(xDimension.value)

      this.setDataSource(index, table)
      this.setDimension(table, dimension)
      this.getEvents(table).on("redrawGroup.component", (filterString) => {
        if (this.dataSources[table]) {
          this.dataSources[table].multiSourceIndexes.forEach(
            (multiSourceIndex: string) => {
              setFilterString(multiSourceIndex, filterString)
            }
          )
        }
      })
    })
    return this
  }
}
