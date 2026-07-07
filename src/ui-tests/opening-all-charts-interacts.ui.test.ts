// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export {}

xdescribe("Dashboard Filters + Crossfilter Placeholder", () => {
  xit("Please change awkward filename <3", () => {
    expect(true).toBe(false)
  })
})

// TODO: Redo in Puppeteer
// "Dashboard Filters"(browser) {
//   browser
//     .waitForElementVisible(".filter-number", 10000)
//     .assert.containsText(".filter-number", "4", "Filter count is correct")
//     .click("#filter-panel-toggle")
//     .applyFilter(2, {
//       dataSource: "contributions",
//       column: "committee_name",
//       predicate: "equals",
//       value: "Republican Party of California"
//     })
//     .pause(1000)
//     .getText("table", function(result) {
//       if (browser.globals.CAPABILITY === "firefox") {
//         browser.assert.equal(
//           result.value.split("\n")[1],
//           "Republican Party of California 62"
//         )
//       } else {
//         browser.assert.equal(
//           result.value,
//           "Republican Party of California 62"
//         )
//       }
//     })
//     .removeFilter(2)
//     .pause(1000)
//     .getText("table", function(result) {
//       if (browser.globals.CAPABILITY === "firefox") {
//         browser.assert.equal(
//           result.value.split("\n")[1] === "Republican Party of California 62",
//           false
//         )
//       } else {
//         browser.assert.equal(
//           result.value === "Republican Party of California 62",
//           false
//         )
//       }
//     })
// },
// "Can Crossfilter By Brush and Zooming"(browser) {
//     browser
//       .pause(5000)
//       .waitForElementVisible(".count-all", 10000)
//       .getNumRecords(records => {
//         savedNumRecords = records
//       })
//       .pause(1000)
//       .moveToElement(".chart-type-line .brush", 75, 50, function(result) {
//         if (result.status === -1) {
//           return this
//         } else {
//           return this.mouseButtonDown(0)
//             .moveToElement(".chart-type-line .brush", 150, 50)
//             .mouseButtonUp(0)
//             .pause(5000)
//             .getNumRecords(records => {
//               browser.assert.equal(
//                 savedNumRecords === records,
//                 false,
//                 "Count widget redraws with new number of records"
//               )
//               savedNumRecords = records
//             })
//           // TODO: Redo in Puppeteer
//           // .assert.containsText(
//           //   ".filter-number",
//           //   "4",
//           //   "Filter count is correct"
//           // )
//         }
//       })
//   },
//   "Can Delete Chart"(browser) {
//     browser.moveToElement(
//       ".react-grid-layout > div:nth-child(8) .chart-dropdown-button",
//       0,
//       0,
//       function() {
//         browser
//           .pause(1500)
//           .click(".react-grid-layout > div:nth-child(8) .chart-dropdown-button")
//           .pause(500)
//           .click(".react-grid-layout > div:nth-child(8) .chart-delete-button")
//           .pause(3000)
//           .waitForElementNotPresent(
//             ".chart-type-pointmap .mapboxgl-canvas",
//             10000
//           )
//           .expect.element(".chart-type-pointmap .mapboxgl-canvas").to.not.be
//           .present
//         browser.moveToElement(
//           ".react-grid-layout > div:nth-child(9) .chart-dropdown-button",
//           0,
//           0,
//           function() {
//             browser
//               .pause(1500)
//               .click(
//                 ".react-grid-layout > div:nth-child(9) .chart-dropdown-button"
//               )
//               .pause(500)
//               .click(
//                 ".react-grid-layout > div:nth-child(9) .chart-delete-button"
//               )
//               .waitForElementNotPresent("tr", 2000)
//               .expect.element("tr").to.not.be.present
//           }
//         )
//       }
//     )
//   },
//   "Can Add New Chart"(browser) {
//     browser
//       .createChart("table", {
//         dataSource: "contributions",
//         dimensions: ["committee_name"],
//         measures: ["# Records"]
//       })
//       .click(".save")
//       .assert.chartElementsPresent("tr", "table")
//   }
