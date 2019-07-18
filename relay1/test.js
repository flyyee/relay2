const express = require("express")
var fs = require('fs');

var app = express()

app.get("/", (req, res) => {
    var text = ""
    fs.readFile('test2.html', 'utf8', function(err, contents) {
        text = contents
        console.log(text)
        text = text.concat("<b>ilove</b>")
        text = text.concat("\"></iframe></html>")
        res.send(text)
    })
})

app.listen("3000")

console.log("listening on port 3000")