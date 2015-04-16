'use strict'
let parser = require('./parse-version')
let assign = require('object.assign')



module.exports = function (config) {

  if (!Array.isArray(config.availableVersions) && config.availableVersion.length > 0) {
    throw new Error('Must supply availableVersions setting as an array with at least one value.')
  }

  if (!Array.isArray(config.availableFileTypes) && config.availableFileTypes.length > 0) {
    throw new Error('Must supply availableFileTypes setting as an array with at least one value.')
  }

  let assignDefaults = assign.bind(null, {}, {
    version: last(config.availableVersions),
    fileType: last(config.availableFileTypes)
  })

  return function* doParseVersion(next) {

    /* Parse the version from the request. First try extracting the value URI meaning to get the version value
     * and rewrite the URI to not have it thereafter. If the URI does not have a version value in it skip URI
     * rewriting and instead try reading the Accept header. If no version is specified there, default to the latest
     * version of the API. Take the resolved version and assign it to the koa context. */

    let maybeData = parser.maybeReadFromPath(this.path)

    if (maybeData) {
      this.path = parser.stripVersionFromPath(this.path)
    } else if (hasAcceptHeaderContent(this)) {
      maybeData = parser.maybeReadFromAcceptHeader(this.headers.accept)
    }

    /* If the request contained explicit data (we parsed something) then validate it, otherwise we just
    fallback to the default accept data. If the request contained partially explicit data then we only
    validate _that_ and provide defaults for the rest.

    TODO: Refactor validation system; Clearly duplicated logic.

    TODO: We _could_ optimize the validation and default assignment to work together and avoid duplicated
    effort (we don't need to provide defaults for what was validated). */

    if (maybeData) {
      if (maybeData.version && !contains(maybeData.version, config.availableVersions)) {
        this.throw(400, messageBadVersion(maybeData.version, config.availableVersions))
      }
      if (maybeData.fileType && !contains(maybeData.fileType, config.availableFileTypes)) {
        this.throw(400, messageBadFileType(maybeData.fileType, config.availableFileTypes))
      }
    }

    /* Expose the accept data on request so that downstream middleware may use it. */

    this.accept = assignDefaults(maybeData)

    yield next
  }
}






function messageBadVersion (actual, valid) {
  return `Invalid API version requested ("${actual}"). Available versions are: ${valid.join(', ')}`
}

function messageBadFileType (actual, valid) {
  return `Invalid API file type requested ("${actual}"). Available versions are: ${valid.join(', ')}`
}

function contains (item, array) {
  return !!~array.indexOf(item)
}

function hasAcceptHeaderContent (request) {
  return request && request.headers && typeof request.headers.accept === 'string' && request.headers.accept
}

function last (array) {
  return array && array.length > 0 ? array[array.length - 1] : null
}
