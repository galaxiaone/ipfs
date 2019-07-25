require('dotenv').config()
const fs = require('fs');
const Web3 = require('web3');
const IPFS = require('ipfs');
const GALAXIA = require("./contracts/Galaxia.json");
const TOKEN_URIS = require('./assets/asset-data.json');
const IMAGES_DIR = "./assets/images/";
const METADATA_DIR = "./assets/metadata/";
const outputFile = "./assets/deployed-assets.json";

// Set network information
const networkIDs = { 'ropsten': 3, 'rinkeby': 4 };
const network = 'rinkeby';

// Initiate IPFS and Web3
const ipfs = new IPFS();
const web3Provider = "wss://" + network + ".infura.io/ws/v3/" + process.env.INFURA;
const web3 = new Web3(new Web3.providers.WebsocketProvider(web3Provider));



// Get ABI + Address on chosen network and connect to contract instance
const networkID = networkIDs[network];
const deployedNetwork = GALAXIA.networks[networkID];
const contractAddress = process.env.CONTRACT_ADDRESS || deployedNetwork.address;
const galaxiaInstance = new web3.eth.Contract(GALAXIA.abi, contractAddress);


console.log("ADDRESS ", galaxiaInstance.address);
// const baseURI = await galaxiaInstance.methods.baseTokenURI().call();
// console.log("Base URI is ", baseURI);

// ------------------Upload Images------------------------------
const GifDir = IMAGES_DIR + 'v1';
const MetaDir = METADATA_DIR + 'v1';
let gifFiles = [];
let metadataFiles = [];

// let assetData = JSON.stringify(TOKEN_URIS);
let assetData = [];
let numAssets = 0;

const addToIPFS = (filePath) => {
    const imageBuffer = Buffer.from(filePath);

    ipfs.add(imageBuffer, { pin: true }, (err, result) => {
        if (err) {
            console.log(err);
            return false;
        }
        // console.log("planet ", assetName, " hash ", result[0].hash);
        const hash = result[0].hash;
    });
}

// Get planet image files
fs.readdir(GifDir, function (err, files) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    gifFiles = files;
    numAssets += files.length;
    // console.log(files);
})

// Get planet metadata files 
fs.readdir(MetaDir, function (err, files) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    metadataFiles = files;
    numAssets += files.length;
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
        const assetName = GIF.slice(0, GIF.length - 4);
        const data = { id: "", imageHash: "", metadata: "" };
        const gifLocation = GifDir + GIF;
        const metadataLocation = METADATA_DIR + Metadata;
        console.log("planet name ", assetName);
        data.id = i;
        data.name = assetName;
        const imageBuffer = Buffer.from(gifLocation);
        const metadataBuffer = Buffer.from(metadataLocation);
        ipfs.add(imageBuffer, { pin: true }, (err, result) => {
            if (err) {
                console.log(err);
                return false;
            }
            console.log("planet ", assetName, " hash ", result[0].hash);
            data.imageHash = result[0].hash;

            ipfs.add(metadataBuffer, { pin: true }, (err, result) => {
                if (err) {
                    console.log(err);
                    return false;
                }
                console.log("planet ", assetName, " hash ", result[0].hash);
                data.metadata = result[0].hash;
                // console.log(data);
                assetData.push(data);
                if (i === gifFiles.length -1){
                    console.log(assetData); 
                    const jsonData = JSON.stringify(assetData); 
                    fs.writeFile(outputFile, jsonData, function(err) {
                        if(err) {
                            return console.log(err);
                            process.exit(1);
                        }
                        console.log("The file was saved!");
                    }); 
                }
            })
        })

    }  // close for loop




    // galaxiaInstance.events.UpgradePathAdded({
    //     filter: {},
    //     fromBlock: 0
    // }, async (error, event) => {
    //     if (error) console.log(error);
    //     if (event) {
    //         const fullHash = event.returnValues._newURI;
    //         console.log("upgrade path added: full hash ", fullHash);
    //         if (typeof fullHash !== 'undefined' || fullHash !== "") {
    //             const hash = fullHash.substring(5); // returns short path ipfs/Qm....
    //             console.log("Upgrade Path Added: pinning hash ", hash);
    //             ipfs.pin.ls(hash, (err, pinset) => {
    //                 if (err) {
    //                     console.log(err);
    //                     ipfs.pin.add(hash, function (err) {
    //                         if (err) {
    //                             console.log(err, hash);
    //                         }
    //                         console.log("pinned uri upgrade ", hash);
    //                     });
    //                 }
    //                 if (pinset) {
    //                     console.log('Hash already pinned', hash);
    //                 }

    //             })
    //         }
    //     }
    // });

    // galaxiaInstance.events.MetadataUpgraded({
    //     filter: {},
    //     fromBlock: 0
    // }, async (error, event) => {
    //     if (error) console.log(error);
    //     if (event) {
    //         const fullHash = event.returnValues._newURI;
    //         if (typeof fullHash !== 'undefined' || fullHash !== "") {
    //             const hash = fullHash.substring(5);  // returns short path ipfs/Qm....
    //             console.log("Metadata upgraded: pinning hash ", hash);
    //             ipfs.pin.ls(hash, (err, pinset) => {
    //                 if (err) {
    //                     console.log('Pinning hash...', hash);
    //                     ipfs.pin.add(hash, function (err) {
    //                         if (err) {
    //                             console.log(err, hash);
    //                         }
    //                         console.log("pinned upgraded uri ", hash);
    //                     });
    //                 }
    //                 if (pinset) {
    //                     console.log('Hash already pinned', hash);
    //                 }
    //             })
    //         }
    //     }
    // });

});


