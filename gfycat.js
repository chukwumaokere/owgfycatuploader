const fs = require("fs");
var axios = require("axios");
const chokidar = require('chokidar');
const config = require('./config.js');

var watchdir = config.watchdir;
var client_id = config.client_id;
var client_secret = config.client_secret;
const username = config.username;
const password = config.password;

async function get_auth_token(client_id, client_secret, username, password){
    const req = await axios({
        method: "POST",
        headers: {
        },
        data: {
            client_id: client_id,
            client_secret: client_secret,
            username: username,
            password: password,
            grant_type: "password"
        },
        url: "https://api.gfycat.com/v1/oauth/token",
    });
    const token = req.data.access_token;
    return token;
}

async function get_gfyname(ac_token, title) {
  const res = await axios({
    method: "POST",
    headers:{
        "Authorization": `Bearer ${ac_token}`,
        "Content-Type": "application/json",
    },
    url: "https://api.gfycat.com/v1/gfycats",
    data: { title: title },
  });

  const name = res.data.gfyname;

  console.log(name);
  return name;
}

async function upload(name, file){
    const stream = fs.createReadStream(file);
    const { size } = fs.statSync(file);

    stream.on("error", console.warn);
    const sendResult = await axios({
        method: "PUT",
        url: `https://filedrop.gfycat.com/${name}`,
        data: stream,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
            "Content-Type": "video/mp4", // should set to actual type of file.
            "Content-Length": size
          }
    });
    var dada = sendResult.data;
    return dada;
}

async function getStatus(gfyname, ac_token){
    const res = await axios({
        method: "GET",
        url: `https://filedrop.gfycat.com/${gfyname}`,
        headers:{
            "Authorization": `Bearer ${ac_token}`,
        }
    })
    var status = res.data.task;
    return status;
}

const watcher = chokidar.watch(`${watchdir}`, {
    ignored: 'Thumbs.db', // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
});

watcher.on('all', (event, file) => {
    var options = {};
    if(event == 'add'){
        var pathname = file;
        var watchdirpath = watchdir.replace(/\//g, '\\');
        var filename = pathname.replace(watchdirpath, '').replace(/\ /g, '_');

        get_auth_token(client_id, client_secret, username, password)
        .then(token => { get_gfyname(token, filename)
            .then(name => { upload(name, file)
                .then({
                        while(status = getStatus(name, token) != 'complete'){
                            setTimeout(function(){
                                console.log(status);
                            }, 2000);
                        }
                }) 
            })
            .catch(err => { console.log(err); }) 
        });
    }   
});