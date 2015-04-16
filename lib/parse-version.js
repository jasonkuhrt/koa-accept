
/* Regular Expression Patterns
[1] Interact with the pattern here: http://regexr.com/3ar12 */

var patternVersion = 'v(\\d[\\d|\\.]*)'
var patternVersionPath = '\\/' + patternVersion + '(?:\\/.*)*'
var patternAcceptHeader = 'application\\/vnd\\.[^.]+\\.' + patternVersion + '\\+(.+)$' // [1]



/* Regular Expressions Instances */

var versionRegExp = RegExp(patternVersion)
var versionPathRegExp = RegExp(patternVersionPath)
var acceptHeaderRegExp = RegExp(patternAcceptHeader)



/* API
TODO: Docs */

function maybeReadFromPath(path) {
  let v = path.match(versionPathRegExp)
  if (!(v && v[1])) return null
  return { version: v }
}

function maybeReadFromAcceptHeader (acceptHeader) {
  let result = acceptHeader.match(acceptHeaderRegExp)
  if (!result) return null
  let v = result[1], t = result[2]
  if (!v && !t) return null
  let data = {}
  if (v) data.version = v
  if (t) data.fileType = t
  return data
}

function stripVersionFromPath(path) {
  return path.replace(RegExp('/' + patternVersion), '')
}



/* Expose API */

exports.maybeReadFromPath = maybeReadFromPath
exports.maybeReadFromAcceptHeader = maybeReadFromAcceptHeader
exports.stripVersionFromPath = stripVersionFromPath

// The following are exposed for testing purposes.

exports.patternAcceptHeader = patternAcceptHeader
exports.patternVersion = patternVersion
exports.patternVersionPath = patternVersionPath

exports.versionRegExp = versionRegExp
exports.versionPathRegExp = versionPathRegExp
exports.acceptHeaderRegExp = acceptHeaderRegExp
