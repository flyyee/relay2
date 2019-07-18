const request = require("request")
const jsdom = require("jsdom")
const { JSDOM } = jsdom
const fs = require("fs")


var newbody = fs.readFileSync("./test3.html", "utf8")

getcss(newbody, "backpack.tf/", (err, res) => {
    if (err) throw err
    console.log(res)
})

async function getcss(newbody, host, callback) {
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