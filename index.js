const express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { lookup } = require('geoip-lite');

const app = express();
app.use(require('express-fileupload')());
app.use(require('body-parser').urlencoded({ extended: false }))

app.all("*", (req, res, next)=>{
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const details = lookup(ip);
    console.log(req.headers.cookie)
    if (details.country == "IT" || details.country == "ID"){
        if (typeof(req.headers.cookie)==='undefined'){
            res.sendFile(__dirname + '/public/login.html'); return}
        if (!req.headers.cookie.replace(/ /g,'').split(';').includes('userName=fersanda')){
            res.sendFile(__dirname + '/public/login.html')
            console.log(req.headers.cookie.replace(/ /g,'').split(';'))
        } else
            next()
    } else
        res.sendStatus(400)
});

app.use(express.static('public'))

app.get("/", (req, res) => {
    // console.log(Object.keys(req.query).includes('desc'))

    // res.contentType('text/html')
    // console.log(!!mime.lookup(getLatestFile(__dirname + '/uploads/')).match("^video/*"))
    // if (!!mime.lookup(getLatestFile(__dirname + '/uploads/')).match("^video/*"))
        // res.sendFile(__dirname + "/video.html");
    // else
        // res.sendFile(__dirname + "/index.html");

    fs.readFile(__dirname + '/content/' + getLatestFile(__dirname + '/uploads/') + '.txt', 'utf8', (err, data) => {
//        let date = null;
        if (err) data=""
//        else date = fs.statSync(__dirname + '/content/' + getLatestFile(__dirname + '/uploads/') + '.txt').mtime

{/* <script>window.onload = ()=>{if (window.location.search.includes('desc')) document.getElementById("myModal").style.display = "block";}</script> */}

        res.send(`<html><head>
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"> <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="./site.webmanifest"><title>Quark Rise</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Sofia">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="main.css">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
            </head>
            <body>
                <center><h1>Quark Rise</h1><h5><i>made with ♥  by DLantern</i></h5></center>
                <div id="myModal" class="modal" `+((!!Object.keys(req.query).includes('desc'))?'style="display: block"':'')+`>
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <form ref='descriptionForm' action='./description' method='post'>
                            <textarea name="content" rows="5" style="width: 100%;" placeholder="Put here a Lovely caption!" ></textarea>
                            <div style="text-align: right"><input style="width: 75%" type="submit" value=">> Let's mesmerize!">
                            <form action="./description" method="post"><input type="text" hidden value="" /><input style="width: 25%" type="submit" value="Just photo :)" /></form></div>
                        </form>
                    </div>
                </div>
                <form ref='uploadForm' id='uploadForm' action='./upload' method='post' encType="multipart/form-data">
                    <div class="image-upload">
                        <label for="uploadObject"><img src="./last"/></label>
                        <input type="file" name="uploadObject" id="uploadObject" onchange="this.form.submit();" />
                    </div>
                </form>
                <p class="caption">`+data.replace('\n','<br>')+`</p>
                <div style="display: inline;">
                <a class="cam" href="./video.html">Go to #feddycam</a>
                <a class="edit" href="./?desc">Edit caption</a>
                </div>
            </body>
        </html>
        `)
    });
});
app.post("/description", (req, res) => {
    console.log(req.body)
    try {
        const subject = getLatestFile(__dirname + '/uploads/')
        fs.writeFileSync(__dirname + '/content/' + subject  + '.txt', req.body.content);
        sendTelegram(subject, req.body.content)
        res.redirect('./')
    } catch (err) {
        console.error(err);
    }
})

app.get('/last', (req, res) => {
    const latest = getLatestFile(__dirname + '/uploads/');
    // res.contentType(mime.lookup(latest))
    console.log('HTTP Last requested /uploads/' + latest)
    res.sendFile(__dirname + '/uploads/' + latest)
})

app.get('/random', (req, res) => {
    res.sendFile(__dirname + '/shuffler/' + getRandomFile(__dirname + '/shuffler/'))
})

app.post('/upload', function(req, res) {
    let uploadObject;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    uploadObject = req.files.uploadObject;
    // if (!uploadObject.mimetype.match('^(image|video)/*'))
    if (!uploadObject.mimetype.match('^(image)/*'))
        res.send(401).send('Unsupported file type')

    uploadPath = __dirname + '/uploads/' + uploadObject.name;

    uploadObject.mv(uploadPath, function(err) {
    if (err)
        return res.status(500).send(err);

    // res.sendFile(__dirname + "/index.html");
    res.redirect('./?desc')
    });
});

app.listen(8888)

function getLatestFile(dirpath) {
    let latest;
  
    const files = fs.readdirSync(dirpath);
    files.forEach(filename => {
        if (!!mime.lookup(dirpath + filename).match("^text/*"))
            return
        
        const stat = fs.lstatSync(path.join(dirpath, filename));
        if (stat.isDirectory())
            return;

        if (!latest) {
            latest = {filename, mtime: stat.mtime};
            return;
        }
        if (stat.mtime > latest.mtime) {
            latest.filename = filename;
            latest.mtime = stat.mtime;
        }
    });
    return latest.filename;
}

function getRandomFile(dirpath) {
    //check if directory not implementeed!!
    const files = fs.readdirSync(dirpath)
    return files[Math.floor(Math.random()*files.length)]
}

async function sendTelegram(filename, description) {
console.log("Sending new at ",secToMidnight())
setTimeout(()=>{
new require('dockerode')({socketPath: '/var/run/docker.sock'}).createContainer({
Image: 'ugeek/telegram-cli:amd64', AttachStdin: false, AttachStdout: false, AttachStderr: false, Tty: false,
Cmd: ['-W','-e','send_photo @feddynventor /tmp/images/'+filename+' #thecutebot stored for Us this shiny #quarkrise! '+description],
'Binds': ['/root/quarkrise-res/uploads:/tmp/images:ro','/root/.telegram-cli:/root/.telegram-cli:rw'],
OpenStdin: false, StdinOnce: false, AutoRemove: true
                                }).then(function(container) {
                                        mainContainer = container; return mainContainer.start();
                                }).finally(function() {
                                        console.log("done")
                                }).catch(function(err) {
                                        console.log(err);
                                });
},secToMidnight())
}

function secToMidnight() { const now = new Date(); const then = new Date(now); then.setHours(24, 0, 0, 0); return (then - now); }
