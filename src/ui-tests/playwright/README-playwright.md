# Playwright E2E Testing

Experimental use of [playwright](https://playwright.dev/) to enable our devs to write more and better end to end tests.

# Setup

Playwright requires Node 14.x

> Use nvm to install 14, and to be able to easily switch between node versions to run immerse or playwright

# Running Tests

Switch to node 14 `nvm use 14`

## Locally

There are two convenience scripts setup in package.json:

- `npm run test:playwright` - Runs all playwright tests, produces html report in browser at the end
- `npm run test:playwright:gui` - Opens the browser GUI for playwright. Allows you to view tests running in browser, run single tests, watch for changes, debug, etc.

Other Useful Commands

- `npm run test:playwright -- --debug` - Opens the playwright web interface in debug mode, where you can step through the test one line at a time while observing immerse in the browser.
