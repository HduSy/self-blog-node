const createError = require('http-errors')
const err = createError(404, 'This video does not exist.')
console.log(err.statusCode)
console.log(err.message)
console.log(err.name)
console.log(err.expose) //status>=500时为false，不发给client
/**
 * http errors object generator
 */
