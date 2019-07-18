const url = "https://scraptf/img/banks/hats.svg"
let pos = url.lastIndexOf(".")
let ext = url.substr(pos + 1)
pos = ext.indexOf("?", 3)
if (pos !== -1) {
    ext = ext.substr(0, pos)
}
const exts = ["jpeg", "jpg", "png", "apng", "svg", "bmp", "ico", "webp"]

if (!exts.includes(ext)) {
    ext = "notsupported"
}
console.log(ext)