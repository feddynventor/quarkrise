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
    if (details.country == "IT" || details.country == "ID")
        next()
    else
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

        res.send(`<html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" href="main.css">
            </head>
            <body>
                <h1>Quark Rise</h1><center><h5><i>made with ♥  by DLantern</i></h5></center>
                <div id="myModal" class="modal" `+((!!Object.keys(req.query).includes('desc'))?'style="display: block"':'')+`>
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <form ref='descriptionForm' action='./description' method='post'>
                            <textarea name="content" rows="5" style="width: 100%;" placeholder="Put here a Lovely caption!" ></textarea>
                            <input style="width: 75%" type="submit" value=">> Let's mesmerize!">
                            <form action="./"><input style="width: 24%" type="submit" value="Just photo :)" /></form>
                        </form>
                    </div>
                </div>
                <form ref='uploadForm' id='uploadForm' action='./upload' method='post' encType="multipart/form-data">
                    <div class="image-upload">
                        <label for="uploadObject"><img src="./last"/></label>
                        <input type="file" name="uploadObject" id="uploadObject" onchange="this.form.submit();" />
                    </div>
                </form>
                <hr><div class="caption">`+data.replace('\n','<br>')+`</div>
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
        fs.writeFileSync(__dirname + '/content/' + getLatestFile(__dirname + '/uploads/') + '.txt', req.body.content);
        res.redirect('./')
    } catch (err) {
        console.error(err);
    }
})

app.get('/last', (req, res) => {
    const latest = getLatestFile(__dirname + '/uploads/');
    // res.contentType(mime.lookup(latest))
    console.log('/uploads/' + latest)
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
