# Puppeteer cheatsheet

## Configuration requirements

The UI tests require connecting to a server running a HeavyDB instance with specific data sources:

- flights_donotmodify
- us_states_geo
- tweets_nov_feb

This list of required data sources must be updated if new data sources are incorporated into UI tests.

## How to run in the background

In your `servers.local.json`, specify a server with the required data sources (e.g. Forge).

Start a local server hosting Immerse at `http://localhost:8002`.

Run tests: `npm run test:ui`

## How to watch it run

In your `servers.local.json`, specify a server with the required data sources (e.g. Forge).

Start a local server hosting Immerse at `http://localhost:8002`.

Run tests with `:observe`: `npm run test:ui:observe`

## How to run just one test

Add the string 'debug' (case insensitive) somewhere in the test description:

```js
describe("DEBUG A suite of tests", () => {
  it("DEBUG A single test", async () => {
```

In your `servers.local.json`, specify a server with the required data sources (e.g. Forge).

Start a local server hosting Immerse at `http://localhost:8002`.

Run tests with `:debug`: `npm run test:ui:debug`

This also works for any kind of Jest test from any suite.

For UI tests, the debug mode will also turn off headless mode and run in a visible browser just like `test:ui:observe`, allowing you to see the isolated test(s) run in a browser window.

## Where is the API Documentation?

The Puppeteer documentation (the interface of the `page` object):
https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md

The jest-puppeteer documentation:
https://github.com/smooth-code/jest-puppeteer

The expect-puppeteer documentation (the interface of `expect(page)`'s return):
https://github.com/smooth-code/jest-puppeteer/tree/master/packages/expect-puppeteer

## Common Patterns

### Go to a page.

```js
import BASE_URL from "..."

const url = new URL("/data-manager", BASE_URL).toString()

await page.goto(url, { waitUntil: "load" })
```

### Wait for a routing page transition.

This sets up a wait on the page navigation, then clicks the element that will trigger it. It's important to do it this way to avoid any race conditions.

```js
await Promise.all([
  page.waitForNavigation(),
  expect(page).toClick('[data-testid="new-dashboard-button"]')
])
```

### Wait for an element to exist (to confirm a non-route page transition, for instance).

This waits until the given selector matches an element, for up to 30s (the default expect timeout)

```js
await expect(page).toMatchElement("div.table-picker-container")
```

### Click a button.

Though it looks a bit odd, by using the expect API you automatically wait for the element to exist before acting

```js
await expect(page).toClick('[data-testid="my-button"]')
```

## Troubleshooting

### Why am I getting “UnhandledPromiseRejectionWarning: Error: Navigation failed because browser has disconnected!”?

You are most likely missing an `await` somewhere. Most puppeteer and expect-puppeteer methods return a promise - you almost always want to defer on those promises, both for proper test execution and to make sure the test waits to finish.

### Why is my text not being detected on the page? (e.g. `expectContainsText("Your Text")`)

Puppeteer detects text in an element or on the page based on its pre-CSS value. A CSS rule might be
changing "your text" to "Your Text", and your text argument needs to match the pre-CSS format.

### Why are my tests failing in headless mode but passing when I watch them while debugging?

Puppeteer runs really fast, so you may need to add extra wait time between some operations (e.g. `await page.waitFor(1000)`).

### How do I iterate with async/await?

Many iterating patterns do not work as expected with `async/await`. When transpiling, the expected
pattern for asynchronous execution may not be what is expected. `for...of` execution of
`async/await` functions is the easiest way with some examples included in existing tests.

### Why am I getting a `Evaluation failed: ReferenceError: cov_1cax8innbx is not defined` error when I try to run an `evaluate`-type function?

See this [GitHub issue](https://github.com/GoogleChrome/puppeteer/issues/1855)

Add the following right before the function you pass to `page.evaluate()` (or similar):

```
/* istanbul ignore next */
```

Example:

```js
await page.evaluate(
  /* istanbul ignore next */ () => {
    // ...function stuff
  }
)
```

## Performance

### Tests Per File

Fewer tests per file results in faster overall test running. If a test file has much higher runtime
than other test files, consider breaking it apart.
