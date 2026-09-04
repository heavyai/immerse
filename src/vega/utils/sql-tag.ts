import moment from "moment"

import { DATETIME_FORMAT } from "constants/magic-variables"

// Adapted from https://github.com/clhenrick/single-line-string, author Chris Henrick

// Tagged template function for ES6 string templates, meant to be used like: sql``
const sql = (strings: TemplateStringsArray, ...values: string[]): string => {
  // Build the template string with its substitution expressions
  let input = ""
  // Values list will always be exactly one element shorter than string
  for (let i = 0; i < values.length; i += 1) {
    input += strings[i] + values[i]
  }
  input += strings[values.length]

  // Trim and then split on newlines (skip whitespace-only lines)
  const lines = input.trim().split(/[\r\n\s]*[\r\n]+[\r\n\s]*/)

  // Trim surrounding whitespace from lines and combine them
  // into one, space-separated
  let output = ""
  for (let i = 0; i < lines.length - 1; i += 1) {
    output += `${lines[i].trim()} `
  }
  output += lines[lines.length - 1].trim()

  return output
}

const clauseIfNonempty = (clause: string) => (expression?: string): string => {
  if (typeof expression === "undefined") {
    return ""
  } else {
    const trimmedExpression = expression.trim()

    if (trimmedExpression) {
      return clause + trimmedExpression
    } else {
      return ""
    }
  }
}

const numberClauseIfNonempty = (clause: string) => (
  expression?: number
): string => {
  if (typeof expression === "undefined") {
    return ""
  } else if (isNaN(expression)) {
    throw new Error("Valid number expected but got NaN")
  } else {
    return clause + String(expression)
  }
}

const interpolator = (separator: string, prepend = "", append = "") => (
  ...expressions: Array<string | string[]>
): string => {
  const flatExpressions = []

  for (const expression of expressions) {
    if (Array.isArray(expression)) {
      for (const innerExpression of expression) {
        const trimmedExpression = innerExpression.trim()

        if (trimmedExpression) {
          flatExpressions.push(trimmedExpression)
        }
      }
    } else {
      const trimmedExpression = expression.trim()

      if (trimmedExpression) {
        flatExpressions.push(trimmedExpression)
      }
    }
  }

  if (flatExpressions.length === 0) {
    return ""
  } else if (flatExpressions.length === 1) {
    return flatExpressions[0]
  } else {
    return prepend + flatExpressions.join(separator) + append
  }
}

const commaInterpolator = interpolator(", ")

const commaInterpolatedClause = (clause: string) => {
  const clauseFn = clauseIfNonempty(clause)

  return (...expressions: Array<string | string[]>) =>
    clauseFn(commaInterpolator(...expressions))
}

sql.escape = (value: string | number | Date): string => {
  if (typeof value === "string") {
    return `'${value.replace(/'/g, "''")}'`
  } else if (value instanceof Date) {
    return `TIMESTAMP(3) '${moment.utc(value).format(DATETIME_FORMAT)}'`
  }
  return String(value)
}

sql.with = (subqueries: Record<string, string>) =>
  commaInterpolatedClause("WITH ")(
    Object.entries(subqueries).map(
      ([alias, subquery]) => `${alias} AS (${subquery})`
    )
  )

// Can take in any number of string or string array parameters
// Will interpolate all strings with ', ', and
// only output clause if there's at least one nonempty string
sql.select = commaInterpolatedClause("SELECT ")
sql.from = commaInterpolatedClause("FROM ")
sql.groupBy = commaInterpolatedClause("GROUP BY ")
sql.orderBy = commaInterpolatedClause("ORDER BY ")

// Takes single string parameter
// Will only output clause if parameter is nonempty
sql.where = clauseIfNonempty("WHERE ")
sql.having = clauseIfNonempty("HAVING ")

// Can take in any number of string or string array parameters
// Will interpolate all strings with ' AND ' or ' OR ', and
// wrap output with '( ... )'  if there is more than one nonempty string
sql.and = interpolator(" AND ", "(", ")")
sql.or = interpolator(" OR ", "(", ")")

// Takes single number parameter
// Will only output clause if parameter is nonempty
sql.limit = numberClauseIfNonempty("LIMIT ")
sql.offset = numberClauseIfNonempty("OFFSET ")

export default sql

export const ASC = "asc"
export const DESC = "desc"
