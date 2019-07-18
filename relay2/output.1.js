const express = require("express")
const { Pool } = require('pg')
const pglisten = require("pg-listen")
const request = require("request")
var fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const aesjs = require('aes-js');

var app = express()

const sub = pglisten({
    connectionString: "postgres://gmiqroalerhzcr:444237bb2007950667b51eac0fddd664266793109f14740744ff28fcdd2ddde2@ec2-75-101-147-226.compute-1.amazonaws.com:5432/def38va64aibak",
    ssl: true,
})

sub.connect()
sub.listenTo("newurl")

const pool = new Pool({
    // save the following in an environment variable
    connectionString: "postgres://gmiqroalerhzcr:444237bb2007950667b51eac0fddd664266793109f14740744ff28fcdd2ddde2@ec2-75-101-147-226.compute-1.amazonaws.com:5432/def38va64aibak",
    ssl: true,
})

const passwordlist = ["abcd1234", "6nov2004", "fakepwdd"]

function decrypt(newurl) {
    if (newurl.length > 3) {
        if (newurl.substr(0, 3) === "~@~") {
            // let passwordlist = ["abcd1234", "6nov2004", "fakepwdd"]
            for (p in passwordlist) {
                let tempkey = []
                for (let x of passwordlist[p]) {
                    tempkey.push(x.charCodeAt(0))
                }
                tempkey = tempkey.concat(tempkey)
                const key = tempkey
                var encryptedHex = newurl.substr(3)
                var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
                var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
                var decryptedBytes = aesCtr.decrypt(encryptedBytes);
                var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
                // console.log(decryptedText)
                if (decryptedText.substr(0, 8) === passwordlist[p]) {
                    // console.log(decryptedText)
                    newurl = decryptedText.substr(8)
                    break
                }
            }
        }

        if (newurl.substr(0, 3) === "~!~") {
            const key = [6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200]
            var encryptedHex = newurl.substr(3)
            var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
            var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
            var decryptedBytes = aesCtr.decrypt(encryptedBytes);
            var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
            newurl = decryptedText
        }
        console.log(`Decrypted url to ${newurl}`)
        return newurl
    } else {
        return "~~badurl"
    }
}

function encrypt(newurl) {
    let text = newurl
    {
        const key = [6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200, 6, 6, 11, 200]

        // Convert text to bytes
        let textBytes = aesjs.utils.utf8.toBytes(text);

        // The counter is optional, and if omitted will begin at 1
        let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        let encryptedBytes = aesCtr.encrypt(textBytes);

        // To print or store the binary data, you may convert it to hex
        let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
        // return "~!~" + encryptedHex
        text = "~!~" + encryptedHex
    }
    {
        let key = []
        const mpassword = passwordlist[Math.floor(Math.random() * passwordlist.length)]
        text = mpassword + text
        for (let x of mpassword) {
            key.push(x.charCodeAt(0))
        }
        key = key.concat(key)

        // Convert text to bytes
        let textBytes = aesjs.utils.utf8.toBytes(text);

        // The counter is optional, and if omitted will begin at 1
        let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        let encryptedBytes = aesCtr.encrypt(textBytes);

        // To print or store the binary data, you may convert it to hex
        let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
        return "~@~" + encryptedHex
    }
}

async function getimg(newbody, host, callback) {
    var dom = new JSDOM(newbody)

    var promiseArray = [];

    for (let x = 0; x < dom.window.document.querySelectorAll("img").length; x++) {
        let link = dom.window.document.querySelectorAll("img")[x].src
        let newurl = link
        while (link[0] === "/") {
            link = link.substr(1)
        }
        if (link.substr(0, 6).includes("http") || link.substr(0, 5).includes("www")) {
            newurl = link
        } else {
            newurl = host + link
        }
        if (newurl.substr(0, 4) !== "http") {
            newurl = "https://" + newurl
        }
        let pos = newurl.lastIndexOf(".")
        let ext = newurl.substr(pos + 1)
        pos = ext.indexOf("?", 3)
        if (pos !== -1) {
            ext = ext.substr(0, pos)
        }
        const exts = ["jpeg", "jpg", "png", "apng", "svg", "bmp", "ico", "webp"]

        if (!exts.includes(ext)) {
            ext = "notsupported"
        }
        // console.log(ext)
        if (ext !== "notsupported") {
            promiseArray.push(new Promise((resolve, reject) =>
                request.get(newurl, { encoding: null }, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        let data = Buffer.from(body).toString("base64")


                        switch (ext) {
                            case "png":
                                dom.window.document.querySelectorAll("img")[x].src = "data:image/png;base64," + data
                                break;
                            case "svg":
                                dom.window.document.querySelectorAll("img")[x].src = "data:image/svg+xml;base64," + data
                                break;
                            default:
                                dom.window.document.querySelectorAll("img")[x].src = `data:image/${ext};base64,` + data
                        }
                        resolve(true)
                    } else {
                        callback(error)
                        reject(false)
                    }
                })))
        }

    }
    await Promise.all(promiseArray)
    console.log("here")
    if (dom.window.document.documentElement.outerHTML !== undefined) {
        callback(null, dom.window.document.documentElement.outerHTML)
    } else {
        callback("response undefined")
    }

    // console.log(dom.window.document.documentElement.outerHTML)
}

async function getcss(newbody, host, callback) { //combine with getimg
    var dom = new JSDOM(newbody)

    var promiseArray = [];

    for (let x = 0; x < dom.window.document.querySelectorAll("link").length; x++) {
        let link = dom.window.document.querySelectorAll("link")[x].href
        let newurl = link
        while (link[0] === "/") {
            link = link.substr(1)
        }
        if (link.substr(0, 6).includes("http") || link.substr(0, 5).includes("www")) {
            newurl = link
        } else {
            newurl = host + link
        }
        if (newurl.substr(0, 4) !== "http") {
            newurl = "https://" + newurl
        }
        let pos = newurl.lastIndexOf(".")
        let ext = newurl.substr(pos + 1)
        pos = ext.indexOf("?", 3)
        if (pos !== -1) {
            ext = ext.substr(0, pos)
        }
        const exts = ["jpeg", "jpg", "png", "apng", "svg", "bmp", "ico", "webp"] //"gif" / "tif" ?

        if (ext !== "css") {
            if (!exts.includes(ext)) {
                ext = "notsupported"
            }
        }
        if (ext !== "notsupported" && ext !== "css") {
            promiseArray.push(new Promise((resolve, reject) =>
                request.get(newurl, { encoding: null }, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        let data = Buffer.from(body).toString("base64")
                        switch (ext) {
                            case "png":
                                dom.window.document.querySelectorAll("img")[x].src = "data:image/png;base64," + data
                                break;
                            case "svg":
                                dom.window.document.querySelectorAll("img")[x].src = "data:image/svg+xml;base64," + data
                                break;
                            default:
                                dom.window.document.querySelectorAll("img")[x].src = `data:image/${ext};base64,` + data
                        }
                        resolve(true)
                    } else {
                        callback(error)
                        reject(false)
                    }
                })))
        } else if (ext === "css") {
            promiseArray.push(new Promise((resolve, reject) =>
                request.get(newurl, (error, response, body) => {
                    if (!error && response.statusCode === 200) {
                        let style = dom.window.document.createElement("style");
                        style.className = "relay2css"
                        style.textContent = body
                        dom.window.document.getElementsByTagName("head")[0].appendChild(style);
                        resolve(true)
                    } else {
                        callback(error)
                        reject(false)
                    }
                })
            ))
        }

    }
    await Promise.all(promiseArray)
    if (dom.window.document.documentElement.outerHTML !== undefined) {
        callback(null, dom.window.document.documentElement.outerHTML)
    } else {
        callback("response undefined")
    }
}

async function manipulate_res(newbody, url, majorcallback) {
    console.log("good")

    let dom = new JSDOM(newbody)

    let host = url

    if (host[host.length - 1] !== "/") {
        host = host + "/"
    }

    let i = -1, n = 3
    while (n-- && i++ < host.length) {
        i = host.indexOf("/", i);
        if (i < 0) break;
    }
    host = host.substr(0, i + 1) //strips url to base

    for (let x = 0; x < dom.window.document.querySelectorAll("a").length; x++) {
        let link = dom.window.document.querySelectorAll("a")[x].href
        let newurl = link
        while (link[0] === "/") {
            link = link.substr(1)
        }
        if (link.substr(0, 6).includes("http") || link.substr(0, 5).includes("www")) {
            // add localhost?new=
            // console.log(link)
            newurl = link
        } else {
            // add localhost?new=host/
            newurl = host + link
        }
        if (newurl.substr(0, 4) !== "http") {
            newurl = "https://" + newurl
        }
        dom.window.document.querySelectorAll("a")[x].href = "/new?url=" + encrypt(newurl)
    }

    newbody = dom.window.document.documentElement.outerHTML


    try {
        await getcss(newbody, host, (err, res) => {
            if (err) throw err
            if (res !== undefined) {
                newbody = res
            }
        })
        dom = new JSDOM(newbody)
    } catch (err) {
        console.log(err)
    }

    for (let x = 0; x < dom.window.document.querySelectorAll("link").length; x++) {
        let link = dom.window.document.querySelectorAll("link")[x].href
        dom.window.document.querySelectorAll("link")[x].href = "a" //+ link
    }
    newbody = dom.window.document.documentElement.outerHTML

    try {
        await getimg(newbody, host, (err, res) => {
            if (err) throw err
            if (res !== undefined) {
                newbody = res
            }
        })
        dom = new JSDOM(newbody)
    } catch (err) {
        console.log(err)
    }

    newbody = newbody.replace(/action="|action='/g, "action=\"a")
    // newbody = newbody.replace(/src="|src='/g, "src=\"a")
    newbody = newbody.replace(/url\(/g, "url(a")
    newbody = newbody.replace(/content="|content='/g, "content=\"a")
    newbody = newbody.replace(/"http|'http/g, "\"ahttp")
    newbody = newbody.replace(/"www|'www/g, "\"awww")

    newbody = newbody.replace(/"/g, '\"')
    newbody = newbody.replace(/'/g, "\"")

    majorcallback(null, newbody)


            // let data = Date.now()
            // let command = "INSERT INTO test VALUES (DEFAULT, \'" + newbody + "\'," + data + ")"
            // pool.query(command, (err, res) => {
            //     if (err) {
            //         throw err
            //     }
            //     pool.query(`NOTIFY newresponse, \'{"data":"${data}"}\';`, (err, res) => {
            //         if (err) {
            //             throw err
            //         }
            //         console.log(`Sent response: ${data}`)
            //     })
            // })

}

sub.notifications.on("newurl", (payload) => {
    console.log(`Got url: ${payload.url}`)

    let url = decrypt(payload.url)
    if (url === "~~badurl") {
        url = payload.url
    }

    // let url = payload.url //TODO: cannot do this, must strip to the last website url

    if (!url.includes("http")) {
        url = "https://" + url
        console.log(`Altered url to ${url}`)
    }

    var newbody

    request({
        url: url,
        followAllRedirects: true,
        method: "GET"
    }, (errora, response, bodya) => {
        if (errora) {
            if (url.substr(0, 5) === "https") {
                url = url.replace("https", "http")
            } else {
                url = url.replace("http", "https")
            }
            request({
                url: url,
                followAllRedirects: true,
                method: "GET"
            }, (error, response, body) => {
                if (!error) {
                    newbody = body
                } else {
                    throw errora
                }
            })
        }
        newbody = bodya

        if (newbody !== undefined) {
            manipulate_res(newbody, url, (err, res) => {
                if (err) throw err
                let data = Date.now()
                let command = "INSERT INTO test VALUES (DEFAULT, \'" + res + "\'," + data + ")"
                pool.query(command, (err, res) => {
                    if (err) {
                        throw err
                    }
                    pool.query(`NOTIFY newresponse, \'{"data":"${data}"}\';`, (err, res) => {
                        if (err) {
                            throw err
                        }
                        console.log(`Sent response: ${data}`)
                    })
                })
            })

            // //69420

            // let dom = new JSDOM(newbody)
            // // if (newbody !== undefined) {

            // //     // // newbody = newbody.replace(/action="http/g, `action="${fullUrl}/html?url=http`)
            // //     // newbody = newbody.replace(/action="|action='/g, "action=\"a")
            // //     // newbody = newbody.replace(/href="\/|href='\//g, `href="${fullUrl}/html?url=${url}/`)
            // //     // // newbody = newbody.replace(/href="\//g, `href="${fullUrl}/html?url=${url}/`)
            // //     // newbody = newbody.replace(/href="http|href='http/g, `href="${fullUrl}/html?url=http`)
            // //     // // newbody = newbody.replace(/src="http/g, `src="${fullUrl}/html?url=http`)
            // //     // // newbody = newbody.replace(/src="\//g, `src="${fullUrl}/html?url=${url}/`)
            // //     // newbody = newbody.replace(/src="|src='/g, "src=\"a")
            // //     // newbody = newbody.replace(/url\(/g, "url(a")
            // //     // newbody = newbody.replace(/content="|content='/g, "content=\"a")

            // //     newbody = newbody.replace(/action="|action='/g, "action=\"a")
            // //     newbody = newbody.replace(/a href="http|a href='http/g, `a href="/new?url=http`)
            // //     newbody = newbody.replace(/a href="www|a href='www/g, `a href="/new?url=www`)
            // //     newbody = newbody.replace(/a href="\/www|a href='\/www/g, `a href="/new?url=www`)
            // //     newbody = newbody.replace(/a href="\/\/www|a href='\/\/www/g, `a href="/new?url=www`)
            // //     newbody = newbody.replace(/a href="\/([^n]|[^e]|[^w]|[^2])|a href='\/([^n]|[^e]|[^w]|[^2])/g, `a href="/new?url=${url}/`)
            // //     newbody = newbody.replace(/src="|src='/g, "src=\"a")
            // //     newbody = newbody.replace(/url\(/g, "url(a")
            // //     newbody = newbody.replace(/content="|content='/g, "content=\"a")

            // let host = url

            // if (host[host.length - 1] !== "/") {
            //     host = host + "/"
            // }

            // let i = -1, n = 3
            // while (n-- && i++ < host.length) {
            //     i = host.indexOf("/", i);
            //     if (i < 0) break;
            // }
            // host = host.substr(0, i + 1) //strips url to base

            // for (let x = 0; x < dom.window.document.querySelectorAll("a").length; x++) {
            //     let link = dom.window.document.querySelectorAll("a")[x].href
            //     let newurl = link
            //     while (link[0] === "/") {
            //         link = link.substr(1)
            //     }
            //     if (link.substr(0, 6).includes("http") || link.substr(0, 5).includes("www")) {
            //         // add localhost?new=
            //         // console.log(link)
            //         newurl = link
            //     } else {
            //         // add localhost?new=host/
            //         newurl = host + link
            //     }
            //     if (newurl.substr(0, 4) !== "http") {
            //         newurl = "https://" + newurl
            //     }
            //     dom.window.document.querySelectorAll("a")[x].href = "/new?url=" + encrypt(newurl)
            // }



            // newbody = dom.window.document.documentElement.outerHTML

            // getcss(newbody, host, (err, res) => {
            //     if (err) throw err
            //     if (res !== undefined) {
            //         newbody = res
            //     }

            //     dom = new JSDOM(newbody)

            //     for (let x = 0; x < dom.window.document.querySelectorAll("link").length; x++) {
            //         let link = dom.window.document.querySelectorAll("link")[x].href
            //         dom.window.document.querySelectorAll("link")[x].href = "a" //+ link
            //     }
            //     //})

            //     newbody = dom.window.document.documentElement.outerHTML


            //     getimg(newbody, host, (err, res) => {
            //         if (err) throw err
            //         if (res !== undefined) {
            //             newbody = res
            //         }

            //         // console.log(newbody)


            //         newbody = newbody.replace(/action="|action='/g, "action=\"a")
            //         // newbody = newbody.replace(/src="|src='/g, "src=\"a")
            //         newbody = newbody.replace(/url\(/g, "url(a")
            //         newbody = newbody.replace(/content="|content='/g, "content=\"a")
            //         newbody = newbody.replace(/"http|'http/g, "\"ahttp")
            //         newbody = newbody.replace(/"www|'www/g, "\"awww")

            //         newbody = newbody.replace(/"/g, '\"')
            //         newbody = newbody.replace(/'/g, "\"")

            //         // fs.writeFile("out.txt", newbody, (err) => {
            //         //     if (err) console.log(err);
            //         //     console.log("Successfully Written to File.");
            //         // });
                    // let data = Date.now()
                    // let command = "INSERT INTO test VALUES (DEFAULT, \'" + newbody + "\'," + data + ")"
                    // pool.query(command, (err, res) => {
                    //     if (err) {
                    //         throw err
                    //     }
                    //     pool.query(`NOTIFY newresponse, \'{"data":"${data}"}\';`, (err, res) => {
                    //         if (err) {
                    //             throw err
                    //         }
                    //         console.log(`Sent response: ${data}`)
                    //     })
                    // })


                }//)//

            })//
        })
//         }
//         //TODO: tie up endpoint
//     })
// })

app.listen(8886, () => {
    console.log("Listening on port 8886")
})