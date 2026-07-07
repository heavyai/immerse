// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

module.exports = {
  rules: {
    // And why they're best practice (alphabetized).
    "array-callback-return": "error", // omission is usually by mistake.
    "arrow-parens": "error", // require parens for arrow function arguments regardless of arity
    "block-scoped-var": "error", // can behave unexpectedly due to variable hoisting.
    "callback-return": ["error", ["callback", "cb", "next"]], // usually returns control to cb, so best to return out of function as well.
    "consistent-return": "error", // reduces ambiguity about what gets returned.
    "consistent-this": ["error", "context"], // enforces a standard var for capturing context (which should be done sparingly).
    "constructor-super": "error", // catches runtime syntax errors.
    curly: "error", // reduces ambiguity around blocks and line breaks.
    "default-case": "error", // not having default (and break) lead to unexpected results.
    "dot-notation": "error", // easier to read.
    eqeqeq: "error", // avoids unexpected type coercion.
    "func-names": "error", // having named functions makes following stack traces much easier.
    "global-require": "error", // avoid unexpected sync file load.
    "guard-for-in": "error", // protects against looping over props up prototype chain.
    "handle-callback-err": ["error", "^.*(e|E)rr"], // often omitted in error.
    "init-declarations": "error", // not assigning an initialized variable should be explicit, not a mistake.
    "no-alert": "error", // alerts are annoying.
    "no-array-constructor": "error", // can do surprising things; better to use [].
    "no-bitwise": "error", // these are usually typos; can be difficult to reason about.
    "no-caller": "error", // deprecated.
    "no-catch-shadow": "error", // causes a bug in IE8.
    "no-console": "error", // for debugging only; shouldn't be committed.
    "no-continue": "error", // makes reasoning about loops more difficult.
    "no-duplicate-imports": "error", // should be consolidated for brevity.
    "no-eq-null": "error", // use strict equality.
    "no-eval": "error", // eval is often unsafe and performs poorly.
    "no-extend-native": "error", // can cause unexpected behavior for other devs.
    "no-extra-bind": "error", // removes useless code.
    "no-extra-label": "error", // don't use labels
    "no-implicit-coercion": "error", // avoids fancy coercion tricks that inhibit readability.
    "no-implied-eval": "error", // eval is often unsafe and performs poorly.
    "no-inner-declarations": "error", // avoids unexpected behavior.
    "no-iterator": "error", // this feature is obsolete and not widely supported.
    "no-label-var": "error", // a bad feature related to loop control flow, like GOTO.
    "no-labels": "error", // a bad feature related to loop control flow, like GOTO.
    "no-lone-blocks": "error", // unless in es6, these are just useless clutter.
    "no-lonely-if": "error", // extra-verbose and unusual.
    "no-loop-func": "error", // functions in loops are difficult to reason about.
    "no-mixed-requires": "error", // group requires and seperate from other init for clearer code.
    "no-multi-str": "error", // use newline chars or template strings instead.
    "no-native-reassign": "error", // can cause unexpected behavior for other devs.
    "no-negated-in-lhs": "error", // reduces ambiguity and typos.
    "no-new": "error", // using new for side effects is bad because side effects are bad and OO is bad.
    "no-new-func": "error", // eval is often unsafe and performs poorly.
    "no-new-object": "error", // use more concise {} instead.
    "no-new-require": "error", // unusual; just use require.
    "no-new-wrappers": "error", // does not do what it looks like it does.
    "no-path-concat": "error", // breaks for non-unix system.
    "no-process-exit": "error", // too drastic; almost always better to throw and handle.
    "no-proto": "error", // deprecated.
    "no-prototype-builtins": "off",
    "no-return-assign": ["error", "always"], // can cover up typos.
    "no-script-url": "error", // eval is often unsafe and performs poorly.
    "no-self-compare": "error", // usually a typo; better to use isNaN.
    "no-sequences": "error", // usually a typo; obscures side effects.
    "no-shadow": "error", // difficult to read, limits access to higher scope vars.
    "no-sync": "error", // blocks single thread; use async.
    "no-throw-literal": "error", // be consistent about only throwing Error objects.
    "no-underscore-dangle": "error", // should not rely on variable name to reason about scoping, as it may change.
    "no-unmodified-loop-condition": "error", // possible infinite loop; probably a mistake.
    "no-unneeded-ternary": "error", // improves consistency and readability.
    "no-unused-expressions": ["error", { allowShortCircuit: true }], // usually a typo; has o effect.
    "no-use-before-define": ["error", { functions: false }], // avoids temporal dead zone; functions below can improve readability.
    "no-useless-call": "error", // slower than normal invocation.
    "no-useless-computed-key": "error", // unnecessary; can cause confusion.
    "no-useless-concat": "error", // slower than static combination.
    "no-useless-constructor": "error", // unnecessary.
    "no-var": "error", // const is best, and let is useful for counters, but they eclipse var's uses. #ES6only
    "no-void": "error", // unusual and unnecessary.
    "object-shorthand": "error", // increases consistency. #ES6only
    "one-var": ["error", "never"], // grouped statement types are more consistent and readable.
    "prefer-const": "error", // better to be explicit about what is expected to change.
    "prefer-rest-params": "error", // easier to read than slicing args. #ES6only
    "prefer-template": "error", // string concatenation is slow and error-prone. #ES6only
    "prettier/prettier": "error",
    quotes: [
      "error",
      "double",
      { avoidEscape: true, allowTemplateLiterals: true }
    ],
    radix: "error", // should be explicit about what kind of int is being parsed.
    "react/jsx-boolean-value": "error", // better to be explicit about a boolean value.
    "react/jsx-pascal-case": "error", // improves consistency and readability.
    "react/no-danger": "error", // protects against  html injection vulnerabilities.
    "react/no-did-mount-set-state": "error", // will cause a multiple render calls.
    "react/no-did-update-set-state": "error", // will cause a multiple render calls.
    "react/no-multi-comp": ["error", { ignoreStateless: true }], // improves readability.
    "react/prefer-es6-class": ["warn", "always"], // should use stateless functional components whenever possible.
    "react/prefer-stateless-function": "error", // should use stateless functional components whenever possible.
    "react/prop-types": "off", // needs many updates first before enabling
    "react/react-in-jsx-scope": "error", // catches typos.
    "react/require-render-return": "error", // catches omission mistakes.
    "react/self-closing-comp": "error", // improves consistency and readability.
    "react/sort-comp": "error", // improves consistency, readability.
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "react/display-name": "off",
    "@typescript-eslint/ban-types": "off", // new rule - needs many updates first before enabling
    "@typescript-eslint/explicit-function-return-type": "off", // match existing eslint rule
    "@typescript-eslint/explicit-module-boundary-types": "off", // new rule -- needs many updates first before enabling
    "@typescript-eslint/interface-name-prefix": "off", // purely stylistic
    "@typescript-eslint/no-empty-function": "off", // match existing eslint rule
    "@typescript-eslint/no-explicit-any": "off", // too restrictive
    "no-unused-vars": "off", // off so it doesn't interfere with @typescript-eslint same rule
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }
    ], // match existing eslint rule
    "@typescript-eslint/no-use-before-define": ["error", { functions: false }], // match existing eslint rule
    "@typescript-eslint/no-var-requires": "off", // used legitimately in various config/setup Node files
    "spaced-comment": "error", // improves consistency.
    "vars-on-top": "error", // best to have code agree with hoisting.
    yoda: "error" // improves readability and consistency.
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "react/prop-types": "off" // handled by typescript now
      }
    },
    {
      // Allows unit test files to declare variables without initializing
      // https://github.com/facebook/jest/issues/3553
      files: ["*.unit.test.js", "*.component.test.js", "*.ui.test.*"],
      rules: {
        "init-declarations": 0, // off
        "@typescript-eslint/no-unused-vars": ["warn"]
      }
    }
  ],
  env: {
    es6: true,
    browser: true,
    node: true,
    jasmine: true,
    jest: true
  },
  plugins: [
    "@typescript-eslint",
    "babel",
    "prettier",
    "react",
    "react-hooks",
    "css-modules"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    comment: true,
    ecmaVersion: 6,
    ecmaFeatures: {
      arrowFunctions: true,
      binaryLiterals: true,
      blockBindings: true,
      classes: true,
      defaultParams: true,
      destructuring: true,
      forOf: true,
      generators: true,
      jsx: true,
      objectLiteralComputedProperties: true,
      objectLiteralDuplicateProperties: true,
      objectLiteralShorthandMethods: true,
      objectLiteralShorthandProperties: true,
      octalLiterals: true,
      regexUFlag: true,
      regexYFlag: true,
      restParams: true,
      spread: true,
      superInFunctions: true,
      templateStrings: true,
      unicodeCodePointEscapes: true,
      globalReturn: true,
      experimentalObjectRestSpread: true
    },
    sourceType: "module"
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/@typescript-eslint",
    "prettier/babel",
    "prettier/react",
    "plugin:css-modules/recommended"
  ],
  globals: {
    Generator: true,
    page: true,
    browser: true,
    context: true,
    jestPuppeteer: true
  },
  settings: {
    react: {
      version: "detect"
    }
  }
}
