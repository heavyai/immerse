# HeavyAI Immerse
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/heavyai/immerse/blob/main/LICENSE)
[![Security](https://img.shields.io/badge/Security-Report%20a%20Vulnerability-red.svg)](https://github.com/heavyai/immerse/blob/main/SECURITY.md)
[![GitHub Discussions](https://img.shields.io/badge/GitHub-Discussions-blue?logo=github)](https://github.com/orgs/heavyai/discussions)



Immerse is a lightning fast visual analytics for the HeavyDB database and SQL engine

# Screenshots

#### Quick Insights With Crossfiltering

![immerse2](https://cloud.githubusercontent.com/assets/9220038/25758713/6cb0aa9e-3184-11e7-822a-69b2cdabb7cd.gif)

# Getting Started

### Requirements

- npm@11.15.0 or higher
- node 24.11.0

```bash
npm install
```

### Local Development

#### Mapbox Token

To use map charts, you must setup a mapbox token first

- Create a Mapbox API token
- Create a .env file with contents:

```
MAPBOX_TOKEN=<mapbox token here>
```

To start Immerse normally, use this command:

```bash
npm run start
```

The build will automatically launch Immerse as http://localhost:8002 in your default browser, then stay running watching for file changes and automatically recompile those files.

The server configuration (what host to connect to and credentials to use) is determined by src/servers.json - this can be overridden locally by copying it to src/servers.local.json and modifying.

#### servers.local.json management scripts

To use these, you need a src/servers.local.json first (copy src/servers.json over for a good starting point).

#### Debugging

If you use VS Code as your editor, you can enable remote debugging in Chrome by starting Chrome with this command:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9229
```

Then setting `.vscode/launch.json` inside the Immerse directory to this (or adding the configuration to your existing launch.json):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to Chrome",
      "type": "chrome",
      "request": "attach",
      "port": 9229,
      "url": "http://localhost:8002*",
      "webRoot": "${workspaceRoot}"
    }
  ]
}
```

And then launching the 'Attach to Chrome' configuration in the Debugger pane with Immerse running as http://localhost:8002 in an open tab.

#### Fast builds

If you'd like to experience faster webpack builds, you can use the command

```bash
npm run start:fast
```

to start **immerse** without `source-maps` or `redux-logger`

#### Custom webpack configs

To override the Webpack config settings for your local environment, add a file called `webpack.config.custom.js` (this will be `.gitignore`'d) with the settings you prefer.
For example to enable full source maps on your local build:

```js
const devtool = "source-map"
module.exports = { devtool }
```

#### Prod build

If you'd like to start up the prod build, first generate an SSL certificate and private key pair (`cert.pem` and `key.pem`), such as outlined here: https://certsimple.com/blog/localhost-ssl-fix (Note, must select both the certificate and the private key in Keychain Access for the export step)

Then, run

```bash
npm run start:prod
```

#### Validation Scripts

All pull requests must have passing linting and unit tests. There are automatic builds that check these once pushed, but to avoid finding out until then, it is a good idea to run these scripts yourself before checking in. The scripts are:

- `npm run lint` - Run the linters
- `npm run lint:fix` - Run the linters and automatically change files for fixable lint issues and Prettier formatting
- `npm run test:unit` - Run the unit tests
- `npm run test` - Run both the linters and the unit tests

Some githooks are available to automate linting, add the Jira ticket ID to commit messages, etc. Documentation for the githooks can be found [here](githooks).

#### Feature Flags

From time to time we will add new features behind a feature flag. These features can be configured on development builds by adding `/control-panel` to the end of the URL.

# Serving from sub-paths

Immerse will serve the application from the root path (`/`) by default. For serving the application from a sub-path, modify the `app-config.js` file to change the `IMMERSE_PATH_PREFIX` value. Value _must_ start w/ a `/`.

# Unit, Component and UI Testing

For release 5.0 and beyond, we will use a new testing system that relies on Jest as a base, and then tools that use Jest as a platform. Please see the [testing matrix](https://docs.google.com/spreadsheets/d/12ASWpulqz48P-Iz32JIwP2UbnwsYt-g5oinwOkF-L3g/edit#gid=0) for more information.

- For Utility functions, Actions and Reducers, just use [Jest](https://jestjs.io/)
- For testing React Hooks, we will be using the [React Hooks Testing Library](https://github.com/testing-library/react-hooks-testing-library).
- For component testing, use [React Testing Library](https://github.com/testing-library/react-testing-library)
- For UI testing ("end to end"), use [Jest Puppeteer](https://github.com/smooth-code/jest-puppeteer)

| Command           | Description                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `test:jest`       | Run all jest tests                                                                              |
| `test:only`       | Run only tests with "Only" in the test description                                              |
| `test:coverage`   | Run all test suites with a coverage report                                                      |
| `test:unit`       | Run all unit test suites (test file extension `.unit.test.js` / `.unit.test.ts`)                |
| `test:component`  | Run all component test suites (test file extension `.component.test.js` / `.component.test.ts`) |
| `test:ui`         | Run all UI test suites\* (test file extension `.ui.test.js` / `.ui.test.ts`)                    |
| `test:playwright` | Run all playwright tests (`/ui-tests/playwright`).                                              |

- UI tests require connection to a server with data sets used in the tests. See
  `src/README-Puppeteer-UI-tests.md` for details.
- For details on playwright tests see [Playwright README](src/ui-tests/playwright/README-playwright.md)

# Continuous Integration

# Third-party vendor licenses

A full list of third-party npm packages and their licenses is maintained in [`third_party_licenses/THIRD_PARTY_LICENSES.md`](third_party_licenses/THIRD_PARTY_LICENSES.md). To regenerate it after dependency changes, run:

```sh
npx github:heavyai/js-license-list
```

This requires `node_modules` to be installed (`npm install`). The script is maintained in the [heavyai/js-license-list](https://github.com/heavyai/js-license-list) repo.

Every third-party module from npm that gets includes in the final, distributed bundle has its license verified and license text (if provided) or license type shipped in licenses.txt with the bundle. Licenses must be in the pre-approved list of permissive open-source licenses. If it's necessary to override a license for a module because it's missing or improperly tagged in its package.json, add an entry in license-overrides.json.

License descriptions and public license URLs are maintained in licenses.json as well, but they are not verified and might not be up to date.

## Pre-approved licenses

These licenses are pre-approved for any third-party package. Refer to https://spdx.org/licenses/ with license name as Identifier for more information on each one.

- Apache-2.0
- BSD-0-Clause
- BSD-2-Clause
- BSD-3-Clause
- ISC
- MIT
- Unlicense
- Zlib

*Variables and function names are used as convention and do not reference any commercial product.*

## Security
> [!WARNING]
> **Do not report security vulnerabilities through public GitHub issues!**

NVIDIA takes security seriously. If you discover a vulnerability in useWhisper, **DO NOT open a public issue**. Use one of the private reporting channels described in [SECURITY.md](https://github.com/heavyai/immerse/blob/main/SECURITY.md).

## Support
Join the [HeavyAI GitHub Discussions](https://github.com/orgs/heavyai/discussions) to ask questions, share feedback, and report issues. HeavyAI maintainers review issues, discussions, and pull requests on a best effort basis without guaranteed response timelines.
  
## License
Apache 2.0. See [LICENSE](https://github.com/heavyai/immerse/blob/main/LICENSE).

