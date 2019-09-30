# Gfycat Uploader
A script that watches a directory and anytime an .mp4 file is uploaded to that directory it will be turned into a gif and linked to your gfycat account.

## How to install:
Run `npm install` to install all dependencies (there are only 2, axios, for API requests, and chokidar, for better file monitoring than fs)
Edit `config.js.template` and save it as `config.js`
Run `node gfycat.js` or use something like PM2 or another node process manager to keep gfycat.js running in the background

## TODO:
Send 'finished' response to webhook to DM me in Discord with the gfycat URL once upload is complete.