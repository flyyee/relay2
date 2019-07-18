const express = require("express")
const request = require("request")
const bodyparser = require("body-parser")
const aesjs = require('aes-js');
const compression = require("compression")
var escape = require('escape-html');
const fs = require("fs")

var app = express()

app.use(bodyparser.urlencoded({ extended: false }))

// app.use(compression())

app.get("/", (req, res) => {
    console.log("here")
    res.sendFile(`${__dirname}\\login.html`)
})

app.get("/html", (req, res, next) => { //html?url=abc
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    var url = req.query.url
    // console.log(`URL IS ${url}`)
    console.log(`${ip} requested ${url}`)
    var fullUrl = req.protocol + '://' + req.get('host') //+ req.originalUrl;
    // console.log(fullUrl)
    request(url, (error, response, body) => {
        var newbody = body
        if (newbody !== undefined) {

            // newbody = newbody.replace(/action="http/g, `action="${fullUrl}/html?url=http`)
            newbody = newbody.replace(/action="|action='/g, "action=\"a")
            newbody = newbody.replace(/href="\/|href='\//g, `href="${fullUrl}/html?url=${url}/`)
            // newbody = newbody.replace(/href="\//g, `href="${fullUrl}/html?url=${url}/`)
            newbody = newbody.replace(/href="http|href='http/g, `href="${fullUrl}/html?url=http`)
            // newbody = newbody.replace(/src="http/g, `src="${fullUrl}/html?url=http`)
            // newbody = newbody.replace(/src="\//g, `src="${fullUrl}/html?url=${url}/`)
            newbody = newbody.replace(/src="|src='/g, "src=\"a")
            newbody = newbody.replace(/url\(/g, "url(a")
            newbody = newbody.replace(/content="|content='/g, "content=\"a")

            // var text = ""
            // fs.readFile('htmlnew.1.html', 'utf8', function (err, contents) {
            //     text = contents
            //     console.log(newbody)
            //     text = text.concat(escape(newbody))
            //     text = text.concat("\"></iframe></body></html>")
            //     res.send(text)
            // })
            res.end(newbody)
        }

        //TODO: tie up endpoint


    })
})

app.get("/htmlnew", (req, res) => {
    res.sendFile(`${__dirname}\\htmlnew.html`)
})

app.post("/html", (req, res) => { //POST encrypted hex to html
    if (req.body.type === "unencrypted") {
        var url = req.body.urlunencrypted
    } else if (req.body.type == "encrypted") {
        const key = [6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200]
        var encryptedHex = req.body.urlc
        var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
        var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        var decryptedBytes = aesCtr.decrypt(encryptedBytes);
        var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);

        var fullUrl = req.protocol + '://' + req.get('host')
        //res.redirect("/html?url="+decryptedText)
        // var url = req.query.url
        var url = decryptedText
    }

    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    console.log(`${ip} requested ${url}`)
    var fullUrl = req.protocol + '://' + req.get('host') //+ req.originalUrl;
    // console.log(fullUrl)
    request(url, (error, response, body) => {
        // var newbody = body.replace(/action="http/g, `action="${fullUrl}/html?url=http`)
        // newbody = newbody.replace(/href="http/g, `href="${fullUrl}/html?url=http`)
        // newbody = newbody.replace(/href="\//g, `href="${fullUrl}/html?url=${url}/`)
        var newbody = body
        if (newbody !== undefined) {
            // newbody = newbody.replace(/action="http/g, `action="${fullUrl}/html?url=http`)
            newbody = newbody.replace(/action="|action='/g, "action=\"a")
            newbody = newbody.replace(/href="\/|href='\//g, `href="${fullUrl}/html?url=${url}/`)
            // newbody = newbody.replace(/href="\//g, `href="${fullUrl}/html?url=${url}/`)
            newbody = newbody.replace(/href="http|href='http/g, `href="${fullUrl}/html?url=http`)
            // newbody = newbody.replace(/src="http/g, `src="${fullUrl}/html?url=http`)
            // newbody = newbody.replace(/src="\//g, `src="${fullUrl}/html?url=${url}/`)
            newbody = newbody.replace(/src="|src='/g, "src=\"a")
            newbody = newbody.replace(/url\(/g, "url(a")
            newbody = newbody.replace(/content="|content='/g, "content=\"a")

            // var text = ""
            // fs.readFile('htmlnew.1.html', 'utf8', function (err, contents) {
            //     text = contents
            //     // console.log(newbody)
            //     text = text.concat(newbody.replace(/"/g, "&quot;"))
            //     // text = text.concat(escape(newbody))
            //     text = text.concat("\"></iframe></body></html>")
            //     // console.log(text)
            //     fs.writeFile("a.html", text, (err) => {
            //         if (err) console.log(err);
            //         console.log("Successfully Written to File.");
            //     });
            //     res.send(text)
            // })
            res.end(newbody)
        } else {
            res.end("404")
        }

        //TODO: tie up endpoint
    })
})

// app.post("/html/unencrypted", (req, res) => { //POST unencrypted url to html
//     // console.log(req.body)
//     var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
//     var url = req.query.url
//     url = req.body.urlunencrypted
//     console.log(`${ip} requested ${url}`)
//     var fullUrl = req.protocol + '://' + req.get('host') //+ req.originalUrl;
//     // console.log(fullUrl)
//     request(url, (error, response, body) => {
//         // var newbody = body.replace(/action="http/g, `action="${fullUrl}/html?url=http`)
//         // newbody = newbody.replace(/href="http/g, `href="${fullUrl}/html?url=http`)
//         // newbody = newbody.replace(/href="\//g, `href="${fullUrl}/html?url=${url}/`)
//         var newbody = body
//         // newbody = newbody.replace(/action="http/g, `action="${fullUrl}/html?url=http`)
//         newbody = newbody.replace(/action="|action='/g, "action=\"a")
//         newbody = newbody.replace(/href="\/|href='\//g, `href="${fullUrl}/html?url=${url}/`)
//         // newbody = newbody.replace(/href="\//g, `href="${fullUrl}/html?url=${url}/`)
//         newbody = newbody.replace(/href="http|href='http/g, `href="${fullUrl}/html?url=http`)
//         // newbody = newbody.replace(/src="http/g, `src="${fullUrl}/html?url=http`)
//         // newbody = newbody.replace(/src="\//g, `src="${fullUrl}/html?url=${url}/`)
//         newbody = newbody.replace(/src="|src='/g, "src=\"a")
//         newbody = newbody.replace(/url\(/g, "url(a")
//         res.end(newbody)
//     })
//     // res.redirect("/html?url="+req.body.urlunencrypted)
// })

app.listen(8880)

console.log("Listening on port 8880")