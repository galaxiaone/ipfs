require('dotenv').config()
const fs = require('fs');
const IPFS = require('ipfs');
const IMAGES_DIR = "./assets/images/";
const METADATA_DIR = "./assets/metadata/";
const outputFile = "./assets/deployed-assets.json";


// Initiate IPFS and Web3
const ipfs = new IPFS();


// ------------------Upload Images------------------------------
const GifDir = IMAGES_DIR + 'v1';
const MetaDir = METADATA_DIR + 'v1';
let gifFiles = [];
let metadataFiles = [];

let assetData = [];

// Get planet image files
fs.readdir(GifDir, function (err, files) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    gifFiles = files;
    // console.log(files);
})

// Get planet metadata files
fs.readdir(MetaDir, function (err, files) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    metadataFiles = files;
    // console.log(files);
})

if (metadataFiles.length !== gifFiles.length) {
    console.log("There are ", metadataFiles.length, " metadata files ", " and ", gifFiles.length, " image files");
    process.exit(1);
}

ipfs.once('ready', () => {

    console.log("IPFS node is ready ");
    // loop through planets
    for (let i = 0; i < gifFiles.length; i++) {
        const GIF = gifFiles[i];
        const Metadata = metadataFiles[i];
        console.log(GIF)
        const assetName = GIF.slice(0, GIF.length - 4);
        const data = { id: "", imageHash: "", metadata: "" };
        const gifLocation = `${GifDir}/${GIF}`;
        const metadataLocation = `${METADATA_DIR}/${Metadata}`;
        console.log("planet name ", assetName);
        data.id = i;
        data.name = assetName;

        fs.readFile(gifLocation, (err, data) => {
         if (err) throw err;
         console.log(data);
         const imageBuffer = Buffer.from(data);
         console.log(imageBuffer)
         ipfs.add(imageBuffer, { pin: true }, (err, result) => {
           if (err) {
               console.log(err);
               return false;
           }

           // console.log("planet ", assetName, " hash ", result[0].hash);
           console.log("image buffer ", result);
           data.imageHash = result[0].hash;


           fs.readFile(gifLocation, (err, data) => {
            if (err) throw err;
            console.log(data);
            const metadataBuffer = Buffer.from(data);
            console.log(metadataBuffer)

            ipfs.add(metadataBuffer, { pin: true }, (err, result) => {
              if (err) {
                  console.log(err);
                  return false;
              }
              // console.log("planet ", assetName, " hash ", result[0].hash);
              console.log("metadata buffer ", result);
              data.metadata = result[0].hash;
              // console.log(data);
              assetData.push(data);
              if (i === gifFiles.length -1){
                  console.log(assetData);
                  const jsonData = JSON.stringify(assetData);
                  // fs.writeFile(outputFile, jsonData, function(err) {
                  //     if(err) {
                  //          console.log(err);
                  //         process.exit(1);
                  //     }
                  //     console.log("The file was saved!");
                  // });
              }
            })
          })
        })
      })
    }  // close for loop
});
