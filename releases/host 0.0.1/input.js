const express = require("express")
const bodyparser = require("body-parser")
const { Pool } = require('pg')
const pglisten = require("pg-listen")
const EventEmitter = require('events');

class MyEmitter extends EventEmitter { }
const emitter = new MyEmitter();
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;

var app = express()

app.use(bodyparser.urlencoded({
    extended: false
}))

const sub = pglisten({
    connectionString: "postgres://gmiqroalerhzcr:444237bb2007950667b51eac0fddd664266793109f14740744ff28fcdd2ddde2@ec2-75-101-147-226.compute-1.amazonaws.com:5432/def38va64aibak",
    ssl: true,
})

sub.connect()
sub.listenTo("newresponse")

var pgld = false
var pgldtime
var loadingpage = false

sub.notifications.on("newresponse", (payload) => {
    console.log(`Got response: ${payload.data}`)
    pgldtime = payload.data
    pgld = true

})

const pool = new Pool({
    // save the following in an environment variable
    connectionString: "postgres://gmiqroalerhzcr:444237bb2007950667b51eac0fddd664266793109f14740744ff28fcdd2ddde2@ec2-75-101-147-226.compute-1.amazonaws.com:5432/def38va64aibak",
    ssl: true,
})

// async function waitforreply() {

//     let pgld = false

//     let promise = new Promise((resolve, reject) => {

//         while (!pgld) {
//         }

//         resolve("done!")
//     });

//     let result = await promise; // wait till the promise resolves (*)
// }

// async function waitingforreply() {
//     if (!pgld) {
//         setTimeout(waitingforreply, 0)
//     }
// }

app.get("/", (req, res) => {
    loadingpage = false
    pgld = false
    res.sendFile(`${__dirname}/htmlnew.html`)
})

app.get("/loading", (req, res) => {
    if (pgld) {
        res.redirect("/loaded")
    } else {
        //TODO: list of currently loading documents
        res.sendFile(`${__dirname}/loading.html`)
    }
})

app.get("/loaded", (req, resa) => {
    if (pgldtime === undefined) {
        resa.end("404")
        loadingpage = false
        pgld = false
    } else {
        pool.query("SELECT * FROM test WHERE time = " + pgldtime, (err, res) => {
            loadingpage = false
            pgld = false
            if (err) {
                throw err
            }
            if (res.rows[0] !== undefined) {
                // res.set('Content-Type', 'text/html');
                // const dom = new JSDOM(res.rows[0].text)
                resa.end(res.rows[0].text)
                // resa.end(dom.window.document.documentElement.outerHTML)
            } else {
                resa.end("404")
            }
        })
    }
})

app.post("/", (req, res) => {
    pool.query(`NOTIFY newurl, \'{"url":"${req.body.url}"}\';`, (err, res) => {
        if (err) {
            throw err
        }
        console.log(`Sent url: ${req.body.url}`)
    })
    loadingpage = true
    // res.sendFile(`${__dirname}/loading.html`)
    res.redirect("/loading")
})

app.get("/new", (req, res) => { //TODO: change to new
    // console.log(req.query.url)
    // res.send("ur here")

    pool.query(`NOTIFY newurl, \'{"url":"${req.query.url}"}\';`, (err, res) => {
        if (err) {
            throw err
        }
        console.log(`Sent redirected url: ${req.query.url}`)
    })
    // res.sendFile(`${__dirname}/loading.html`)
    res.redirect("/loading")


})

app.listen(8887, () => {
    console.log("Listening on port 8887")
})