require('dotenv').config()
const fs = require('fs');
const IPFS = require('ipfs');
const IMAGES_DIR = "./assets/images/";
const METADATA_DIR = "./assets/metadata/";
const outputFile = "./assets/deployed-assets.json";


// ------------------Upload Images------------------------------
const GifDir = IMAGES_DIR + 'v1';
const MetaDir = METADATA_DIR + 'v1';
let gifFiles = [];
let metadataFiles = [];

// let assetData = JSON.stringify(TOKEN_URIS);
let assetData = [];



const main = async () => {
    try {
        const node = new IPFS(); 
        const version = await node.version()
        console.log('Version:', version.version)

        console.log("first file ", metadataFiles[0])
        const buf = IPFS.Buffer.from(metadataFiles[0]);
        console.log("buffer ", buf);
        const x = await node.add(buf);
        console.log("meta data dir stat ", x);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

// Get planet image files
fs.readdir(GifDir, function (err, files) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    gifFiles = files;
    console.log(files);
    // Get planet metadata files 
    fs.readdir(MetaDir, function (err, files) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        metadataFiles = files;
        console.log(files);


        if (metadataFiles.length !== gifFiles.length) {
            console.log("There are ", metadataFiles.length, " metadata files ", " and ", gifFiles.length, " image files");
            process.exit(1);
        }
        main();
    })
})






