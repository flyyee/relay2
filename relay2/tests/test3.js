const { Pool } = require('pg')
const pglisten = require("pg-listen")
const express = require("express")

const app = express()

const pool = new Pool({
    // user: "gmiqroalerhzcr",
    // host: "ec2-75-101-147-226.compute-1.amazonaws.com",
    // database: "def38va64aibak",
    // password: "444237bb2007950667b51eac0fddd664266793109f14740744ff28fcdd2ddde2",
    // port: "5432",
    // save the following in an environment variable
    connectionString: "postgres://gmiqroalerhzcr:444237bb2007950667b51eac0fddd664266793109f14740744ff28fcdd2ddde2@ec2-75-101-147-226.compute-1.amazonaws.com:5432/def38va64aibak",
    ssl: true,
})

const sub = pglisten({
    connectionString: "postgres://gmiqroalerhzcr:444237bb2007950667b51eac0fddd664266793109f14740744ff28fcdd2ddde2@ec2-75-101-147-226.compute-1.amazonaws.com:5432/def38va64aibak",
    ssl: true,
})

sub.connect()
sub.listenTo("vert")

sub.notifications.on("vert", (payload) => {
    console.log(`received notification in vert: ${payload}`)
    console.log(payload.tom)
})

app.get("/info", (areq, ares) => {
    pool.query('SELECT * FROM test', (err, res) => {
        if (err) {
            throw err
        }
        for (x in res.rows) {
            console.log(res.rows[x])
        }
        ares.send(res.rows)
    })
})

app.get("/add", (areq, ares) => {
    pool.query('INSERT INTO test VALUES (DEFAULT, \'new\')', (err, res) => {
        if (err) {
            throw err
        }
        ares.send(res)
    })
})

app.get("/del", (areq, ares) => {
    pool.query('DELETE FROM test WHERE id >= 1', (err, res) => {
        if (err) {
            throw err
        }
        ares.send(res)
    })
})

app.get("/reset", (areq, ares) => {
    pool.query('ALTER SEQUENCE test_id_seq RESTART WITH 1', (err, res) => {
        if (err) {
            throw err
        }
        ares.send(res)
    })
})

app.get("/listen", (areq, ares) => {
    pool.query('LISTEN vert', (err, res) => {
        if (err) {
            throw err
        }
        ares.send(res)
    })
})

app.get("/notify", (areq, ares) => {
    pool.query('NOTIFY vert, \'{"tom":5}\';', (err, res) => {
        if (err) {
            throw err
        }
        ares.send(res)
    })  
})

app.get("/tell", (areq, ares) => {
    pool.query('SELECT * FROM test WHERE id = 1', (err, res) => {
        if (err) {
            throw err
        }
        ares.send(res.rows[0].text)
    })  
})

app.listen(8885, () => {
    console.log("Listening on port 8885")
})