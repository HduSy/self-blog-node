const express = require('express')
const app = express()
app.get('/', function (req, res) {
    res.send('GET request to the homepage')
})
app.post('/', function (req, res) {
    res.send('POST request to the homepage')
})
//GET, POST, PUT, DELETE
app.all('/secret', (req, res, next) => {
    res.send('Accessing the secret section ...')
    next() // pass control to the next handler
})
//route与正则表达式
app.delete('/ab*cd', function (req, res) {
    res.send('matching routes /ab*cd')
})
app.put(/a/, function (req, res) {
    res.send('只要含a就能匹配')
})
app.put(/.*fly$/, function (req, res) {
    res.send('butterfly')
})
app.get('/users/:userId/books/:bookId', (req, res) => {
    res.send(req.params)
})
//. -
app.get('/flights/:from-:to', (req, res) => {
    res.send(req.params)
})
app.get('/plantae/:genus.:species', (req, res) => {
    res.send(req.params)
})
//route handlers
app.get('/example/b', function (req, res, next) {
    console.log('the response will be sent by the next function ...')
    next()
}, function (req, res) {
    res.send('Hello from B!')
})
const cb0 = function (req, res, next) {
    console.log('CB0')
    next()
}
const cb1 = function (req, res, next) {
    console.log('CB1')
    next()
}
const cb2 = function (req, res, next) {
    res.send('Hello from C!')
}
app.get('/example/c', [cb0, cb1, cb2])
app.get('/example/d', [cb0, cb1], function (req, res, next) {
    console.log('the response will be sent by the next function ...')
    next()
}, function (req, res) {
    res.send('Hello from D!')
})
app.route('/book')
    .get((req, res) => {
        res.send('get a book')
    })
    .post((req, res) => {
        res.send('add a book')
    })
    .put((req, res) => {
        res.send('update a book')
    })
    .delete((req, res) => {
        res.send('delete a book')
    })
//middleware
const myLogger = function (req, res, next) {
    console.log('LOGGED')
    next()
}
app.use(myLogger)
app.get('/myLogger', (req, res) => {
    res.send('Middleware of myLogger')
})
const requestTime = function (req, res, next) {
    req.requestTime = Date.now()
    next()
}
app.use(requestTime)
app.get('/requestTime', (req, res) => {
    res.send(`<small>middleware of requestTime ${new Date(req.requestTime)}</small>`)
})
/**
 * application-level middleware
 */
app.use(function (req, res, next) {
    console.log(`Time:${Date.now()}`)
    next() // !important
})
app.get('/application-level-middleware', (req, res) => {
    res.send('application-level-middleware')
})
app.use('/user/:id', function (req, res, next) {
    console.log('Request URL:', req.originalUrl)
    next()
}, function (req, res, next) {
    console.log('Request Type:', req.method)
    next()
})
app.get('/user/:id', function (req, res, next) {
    res.send('USER')
})
/**
 * router-level middleware
 */
const router = express.Router()
// router.use(function (req, res, next) {
//     console.log('Time:', Date.now())
//     next()
// })
// a middleware sub-stack shows request info for any type of HTTP request to the /user/:id path
// router.use('/stu/:id', function (req, res, next) {
//     console.log('Request URL:', req.originalUrl)
//     next()
// }, function (req, res, next) {
//     console.log('Request Type:', req.method)
//     next()
// })
/**
 * next('route')跳过剩余middleware functions
 */
// a middleware sub-stack that handles GET requests to the /user/:id path
router.get('/stu/:id', function (req, res, next) {
    // if the user ID is 0, skip to the next router
    //To skip the rest of the router’s middleware functions, call next('router') to pass control back out of the router instance.
    if (req.params.id === '0') return next('route')
    // otherwise pass control to the next middleware function in this stack
    else next()
}, function (req, res, next) {
    res.send('render a regular page')
})

// handler for the /user/:id path, which renders a special page
router.get('/stu/:id', function (req, res, next) {
    console.log(req.params.id)
    res.send('render a special page')
})

// mount the router on the app
app.use('/', router)
/**
 * error-handling middleware
 * must cast 4 parameters
 * err,req,res,next
 */
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})
app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
/**
 * built-in middleware
 * express.static\express.json\express.urlencoded
 */
/**
 * third-party middleware
 */
const cookieParser = require('cookie-parser')
app.use(cookieParser())
/**
 * error-handling
 * synchronous & asynchronous errors
 * 若是同步错误直接抛出Express会捕获并处理
 * 若是异步错误需要将err传给next否则Express不会处理
 */
