# Githooks

Githooks are automatically run by [husky], but some of the features can be
enabled or disabled depending on your preference.

## Available Hooks

- **prepare-commit-msg-add-jira-id.sh** Automatically adds the jira ticket id
  to the beginning of your commit message, assuming your branch name is in one
  of the following forms: `name/JIRA-ID_description`; `name/JIRA-ID`; or,
  `JIRA-ID`. Can be enabled with:
  ```bash
  git config --type bool immerse.prepare-commit-msg.add-jira-id true
  ```
- **pre-commit-check-tether-version.sh** Checks the version of tether in
  package-lock.json and ensures that it is 1.4.4 or less. This hook is required
  for everyone since newer tether versions break the build.

- **pre-commit-lint** Run eslint on any files that have been changed and abort
  the commit if any of these linters fail. This feature is opt-in and can be
  enabled with:

[husky]: https://github.com/typicode/husky
