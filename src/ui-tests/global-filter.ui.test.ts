// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export {}

xdescribe("Global Filters", () => {
  xit("TODO", () => {
    expect(true).toBe(false)
  })
})

// TODO: Redo in Puppeteer
// browser
//   .click("#filter-panel-toggle") // to activate filter panel
//   .pause(800)
//   .applyFilter(1, {
//     dataSource: "flights",
//     column: "dest",
//     predicate: "contains",
//     value: "LA"
//   })
// .pause(800)
// .click(".row._0")

// TODO: Redo in Puppeteer
// .elements("css selector", ".chart-container rect", function(results) {
//   results.value.forEach(function(v, index) {
//     browser.assert.attributeEquals(
//       `.row._${index} > rect`,
//       "class",
//       index === 0 ? "selected" : "deselected"
//     )
//   })
// })

// TODO: Redo in Puppeteer

// const MAX_ROWS_TO_TEST = 5

// module.exports = {
//   "@tags": ["filters"],
//   before(browser) {
//     browser
//       .url(browser.globals.DASHBOARD_V2_URL[browser.globals.ENV])
//       .setCookie({ name: "EULA", value: "true" })
//       .resizeWindow(1280, 800)

//     browser
//       .createDashboard("flights_donotmodify")
//       .createChart("pie", {
//         dataSource: "flights",
//         dimensions: ["dest"],
//         measures: ["# Records"]
//       })
//       .click(".save")
//       .createChart("table", {
//         dataSource: "flights",
//         dimensions: ["distance"],
//         measures: ["# Records"]
//       })
//       .click(".dimensions-container>div:nth-child(1)")
//       .pause(300)
//       .click(".react-toggle-track")
//       .click(".chart-editor-left-panel .chart-editor-label")
//       .click(".save")
//       .pause(1000)

//     browser.click("#filter-panel-toggle").pause(500)
//   },
//   after(browser) {
//     browser.end()
//   },
//   "Applying Contains String Filter"(browser) {
//     browser.assert
//       .elementNotPresent(".filter-number")
//       .applyFilter(1, {
//         dataSource: "flights",
//         column: "dest",
//         predicate: "contains",
//         value: "LA"
//       })
//       .pause(500)

//     browser.expect.element(".custom-modal").to.not.be.present
//     browser.assert.containsText(".filter-number", "1")
//     browser.assert.containsText(".pie-wrapper", "LAS")
//     browser.assert.containsText(".pie-wrapper", "LAX")
//     browser.expect.element(".pie-wrapper").text.to.not.contain("ATL")
//   },
//   "Removing Contains String Filter"(browser) {
//     browser
//       .removeFilter(1)
//       .pause(500)
//       .assert.elementNotPresent(".filter-number")
//   },
//   "Applying Not Contains String Filter"(browser) {
//     browser
//       .applyFilter(1, {
//         dataSource: "flights",
//         column: "dest",
//         predicate: "not contains",
//         value: "LA"
//       })
//       .pause(500)

//     browser.expect.element(".custom-modal").to.not.be.present
//     browser.expect.element(".pie-wrapper").text.to.not.contain("LAS")
//     browser.expect.element(".pie-wrapper").text.to.not.contain("LAX")
//     browser.expect.element(".pie-wrapper").text.to.contain("ATL")
//   },
//   "Removing Not Contains String Filter"(browser) {
//     browser
//       .removeFilter(1)
//       .pause(500)
//       .assert.elementNotPresent(".filter-number")
//       .pause(500)
//   },
//   "Applying Not Equals String Filter"(browser) {
//     browser
//       .applyFilter(1, {
//         dataSource: "flights",
//         column: "dest",
//         predicate: "not equals",
//         value: "LAX"
//       })
//       .pause(500)

//     browser.expect.element(".custom-modal").to.not.be.present
//     browser.expect.element(".pie-wrapper").text.to.not.contain("LAX")
//     browser.expect.element(".pie-wrapper").text.to.contain("ATL")
//   },
//   "Removing Not Equals String Filter"(browser) {
//     browser
//       .removeFilter(1)
//       .pause(500)
//       .assert.elementNotPresent(".filter-number")
//       .pause(500)
//   },
//   "Applying Equals Numerical Filter"(browser) {
//     browser
//       .applyFilter(1, {
//         dataSource: "flights",
//         column: "distance",
//         predicate: "=",
//         value: "337"
//       })
//       .pause(500)

//     browser.expect.element(".custom-modal").to.not.be.present
//     browser.expect.element(".table-row > td").text.to.contain("337")
//   },
//   "Removing Equals Numerical Filter"(browser) {
//     browser
//       .removeFilter(1)
//       .pause(500)
//       .assert.elementNotPresent(".filter-number")
//       .pause(500)
//   },
//   "Applying Greater Numerical Filter"(browser) {
//     browser
//       .applyFilter(1, {
//         dataSource: "flights",
//         column: "distance",
//         predicate: ">",
//         value: "400"
//       })
//       .pause(500)

//     browser.expect.element(".custom-modal").to.not.be.present
//     browser.expect.element(".table-row > td").text.to.contain("403")
//     browser.expect.element(".table-row > td").text.to.not.contain("337")
//   },
//   "Removing Greater Numerical Filter"(browser) {
//     browser
//       .removeFilter(1)
//       .pause(500)
//       .assert.elementNotPresent(".filter-number")
//       .pause(500)
//   },
//   "Applying Less Than Numerical Filter"(browser) {
//     browser
//       .applyFilter(1, {
//         dataSource: "flights",
//         column: "distance",
//         predicate: "<",
//         value: "400"
//       })
//       .pause(500)

//     browser.expect.element(".custom-modal").to.not.be.present
//     browser.expect.element(".table-row > td").text.to.not.contain("403")
//     browser.expect.element(".table-row > td").text.to.contain("337")
//   },
//   "Removing Less Than Numerical Filter"(browser) {
//     browser
//       .removeFilter(1)
//       .pause(500)
//       .assert.elementNotPresent(".filter-number")
//       .pause(500)
//   },
//   "Applying Less Than Numerical Filter"(browser) {
//     browser
//       .applyFilter(1, {
//         dataSource: "flights",
//         column: "distance",
//         predicate: "!=",
//         value: "337"
//       })
//       .pause(500)

//     browser.expect.element(".custom-modal").to.not.be.present
//     browser.expect.element(".table-row > td").text.to.not.contain("337")
//     browser.expect.element(".table-row > td").text.to.contain("109")
//   },
//   "Applying Date Range Filter"(browser) {
//     browser.expect.element(".table-row > td").text.to.contain("337")
//     browser
//       .applyDateRangeFilter(1, {
//         dataSource: "flights",
//         column: "arr_timestamp"
//       })
//       .pause(500)

//     browser.expect.element(".custom-modal").to.not.be.present
//     browser.expect.element(".table-row > td").text.to.not.contain("337")
//     browser.expect.element(".table-row > td").text.to.contain("2,556")
//   }
// }
