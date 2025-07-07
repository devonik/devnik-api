const fs = require("fs");
const { mkdir } = require("fs/promises");
const { Readable } = require('stream');
const { finished } = require('stream/promises');
const path = require("path");
module.exports = {
    downloadFile: (async (url, fileName) => {
        const res = await fetch(url);
        if (!fs.existsSync("storage")) await mkdir("storage"); //Optional if you already have storage directory
        const destination = path.resolve("./storage", fileName);
        const fileStream = fs.createWriteStream(destination, { flags: 'wx' });
        await finished(Readable.fromWeb(res.body).pipe(fileStream));
    }),
    sendSlackLog: (text) => {
        fetch('https://hooks.slack.com/services/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', {
            method: 'POST',
            body: JSON.stringify({
                text
            }),
        });
    }
}