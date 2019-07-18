var request = require('request');
var fs = require("fs")
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const url = "https://steamcdn-a.akamaihd.net/apps/440/icons/key.be0a5e2cda3a039132c35b67319829d785e50352.png"

//read on using https://stackoverflow.com/questions/44221992/node-js-request-multiple-urls-same-time
//read https://stackoverflow.com/questions/36413614/node-js-request-in-function
//read https://stackoverflow.com/questions/52724594/how-to-wait-for-for-loop-with-async-requests-to-finish-in-node-js

myf()

async function myf() {
    var newbody = fs.readFileSync("./test3.html", "utf8")
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
        promiseArray.push(new Promise((resolve, reject) =>
            request.get(url, { encoding: null }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    let data = Buffer.from(body).toString("base64")
                    dom.window.document.querySelectorAll("img")[x].src = "data:image/png;base64," + data
                    resolve(true)
                } else {
                    reject(false)
                }
            })))
    }
    await Promise.all(promiseArray)
    console.log(dom.window.document.documentElement.outerHTML)
}