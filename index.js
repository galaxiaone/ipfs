require('dotenv').config()
const fs = require('fs');
const IPFS = require('ipfs');
// TODO: Organize deployments better than this
const IMAGES_DIR = "./assets/images/v1/";
const METADATA_DIR = "./assets/metadata/v1/";
const outputFile = "./assets/deployed-assets.json";
const util = require('util');


// Initiate IPFS 
const ipfs = new IPFS();
// All asset data, used to output json file of ipfs hashes + asset names
let assetData = [];


const readDir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile)

async function getFileData(data) {
    return await readFile(data)
}

async function getFileDir(dir) {
    return await readDir(dir);
}

function checkParity(image_files, metadata_files) {
    if (metadata_files.length !== image_files.length) {
        console.log("Number of metadata files dont match number of image files!");
        process.exit(1);
    }
}



ipfs.once('ready', async () => {
    try {
        const gifFiles = await getFileDir(IMAGES_DIR);
        const metadataFiles = await getFileDir(METADATA_DIR);
        checkParity(gifFiles, metadataFiles); 
        console.log("gif files ", gifFiles);
        console.log("metadata files ", metadataFiles);
        console.log("IPFS node is ready ");
        // loop through planets
        for (let i = 1; i <= gifFiles.length; i++) {
            const GIF = gifFiles[i];
            const Metadata = metadataFiles[i];
            const assetName = GIF.slice(0, GIF.length - 4);
            const data = { id: "", imageHash: "", metadata: "" };
            const gifLocation = `${IMAGES_DIR}/${GIF}`;
            const metadataLocation = `${METADATA_DIR}${Metadata}`;
            data.id = i;
            data.name = assetName;

            // upload gif image
            const gif_data = await getFileData(gifLocation);
            const image_buffer = Buffer.from(gif_data);
            const ipfs_gif = await ipfs.add(image_buffer, { pin: true });
            data.imageHash = ipfs_gif[0].hash;

            // Upload metadata
            const metadata_data = await getFileData(metadataLocation);
            const metadata_buffer = Buffer.from(metadata_data);
            const ipfs_metadata = await ipfs.add(metadata_buffer);
            data.metadata = ipfs_metadata[0].hash;
            // Add data to list
            console.log(data.name, "image hash: ", data.imageHash, " metadata hash: ", data.metadata);
            assetData.push(data);
        }  // close for loop

        console.log(assetData);
        const jsonData = JSON.stringify(assetData);
        fs.writeFile(outputFile, jsonData, function (err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            console.log("The file was saved!");
        });
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

});
