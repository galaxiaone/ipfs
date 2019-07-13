require('dotenv').config()
const Web3 = require('web3');
const IPFS = require('ipfs');
const GALAXIA = require("./contracts/Galaxia.json");
const TOKEN_URIS = require('./assets/asset-data.json');
const NUM_PLANETS = TOKEN_URIS.keys.length;
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

// TODO: Filter for transfers from 0x00000 && pin files when URI is changed for testing
ipfs.once('ready', () => {

    console.log("IPFS node is ready ");
    for (let i = 0; i < NUM_PLANETS; i++) {
        const key = TOKEN_URIS.keys[i];
        const planet = TOKEN_URIS[key];
        // console.log("name ", key);
        // console.log(" details ", planet);
        if (planet.id !== i) {
            console.log("Planet ID mismatch");
            return false;
        }
        planet.metadata = planet.metadata.slice(5);
        planet.image = planet.image.slice(5);
        console.log(key, " metadata: ", planet.metadata);
        console.log(key, " image ", planet.image);

        ipfs.pin.ls(planet.metadata, (err, pinset) => {
            if (err) {
                // console.log(err);
                ipfs.pin.add(planet.metadata, function (err) {
                    if (err) {
                        console.log(err, planet.metadata);
                    }
                    console.log("Pinned planet metadata ", planet.metadata);
                });
            }
            if (pinset) {
                console.log('planet metadata already pinned', pinset, planet.metadata);
            }
        });

        ipfs.pin.ls(planet.image, (err, pinset) => {
            if (err) {
                // console.log(err);
                ipfs.pin.add(planet.image, function (err) {
                    if (err) {
                        console.log(err, planet.image);
                    }
                    console.log("Pinnned planet image ", planet.image);
                });
            }
            if (pinset) {
                console.log('Planet image already pinned', pinset, planet.image);
            }
        })
    }


    galaxiaInstance.events.UpgradePathAdded({
        filter: {},
        fromBlock: 0
    }, async (error, event) => {
        if (error) console.log(error);
        if (event) {
            const fullHash = event.returnValues._newURI;
            console.log("upgrade path added: full hash ", fullHash); 
            if (typeof fullHash !== 'undefined' || fullHash !== "") {
                const hash = fullHash.substring(5); // returns short path ipfs/Qm....
                console.log("Upgrade Path Added: pinning hash ", hash);
                ipfs.pin.ls(hash, (err, pinset) => {
                    if (err) {
                        console.log(err);
                        ipfs.pin.add(hash, function (err) {
                            if (err){
                                console.log(err, hash);
                            }
                            console.log("pinned uri upgrade ", hash);
                        });
                    }
                    if (pinset) {
                        console.log('Hash already pinned', hash);
                    }

                })
            }
        }
    });

    galaxiaInstance.events.MetadataUpgraded({
        filter: {},
        fromBlock: 0
    }, async (error, event) => {
        if (error) console.log(error);
        if (event) {
            const fullHash = event.returnValues._newURI;
            if (typeof fullHash !== 'undefined' || fullHash !== "") {
                const hash = fullHash.substring(5);  // returns short path ipfs/Qm....
                console.log("Metadata upgraded: pinning hash ", hash);
                ipfs.pin.ls(hash, (err, pinset) => {
                    if (err) {
                        console.log('Pinning hash...', hash);
                        ipfs.pin.add(hash, function (err) {
                            if (err){
                                console.log(err, hash);
                            }
                            console.log("pinned upgraded uri ", hash);
                        });
                    }
                    if (pinset) {
                        console.log('Hash already pinned', hash);
                    }
                })
            }
        }
    });

    galaxiaInstance.getPastEvents('Transfer', {
        filter: {},
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => {
        if (error) throw error;
        events.forEach(async (event) => {
            // console.log("EVENT VALUES ", even    t.returnValues);
            const id = event.returnValues.tokenId;
            const fullHash = await galaxiaInstance.methods.tokenURI(id).call();
            // const imageHash = 
            if (typeof fullHash !== 'undefined' || fullHash !== "") {
                const hash = fullHash.substring(21);
                ipfs.pin.ls(hash, (err, pinset) => {
                    if (err) {
                        ipfs.pin.add(hash, function (err) {
                            if (err){ 
                            console.log(err, hash);
                            }
                            console.log("Successfullly pinned hash transfer() ", hash);
                        });
                    }
                    if (pinset) {
                        console.log('Hash already pinned', pinset, hash);
                    }
                });
            }

        });
    });

    galaxiaInstance.events.Transfer({
        filter: {},
        fromBlock: 0
    }, async (error, event) => {
        if (error) console.log(error);
        if (event) {
            const id = event.returnValues.tokenId;
            const fullHash = await galaxiaInstance.methods.tokenURI(id).call();
            if (typeof fullHash !== 'undefined' || fullHash !== "") {
                const hash = fullHash.substring(21);
                console.log("Transfer() pinning hash ", hash);
                ipfs.pin.ls(hash, (err, pinset) => {
                    if (err) {
                        console.log('Pinning hash...', hash);
                        ipfs.pin.add(hash, function (err) {
                            if (err){
                                console.log(err, hash);
                            }
                            console.log("Pinned hash from transfer() ", hash);
                        });
                    }
                    if (pinset) {
                        console.log('Hash already pinned', pinset, hash);
                    }
                })
            }
        }
    });

});


