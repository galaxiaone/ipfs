require('dotenv').config()
const Web3 = require('web3');
const IPFS = require('ipfs');
const GALAXIA = require("./contracts/Galaxia.json");

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

    galaxiaInstance.getPastEvents('Transfer', {
        filter: {},
        fromBlock: 0,
        toBlock: 'latest'
    }, (error, events) => {
        if (error) throw error;
        events.forEach(async (event) => {
            console.log("EVENT VALUES ", event.returnValues);
            const id = event.returnValues.tokenId;
            const fullHash = await galaxiaInstance.methods.tokenURI(id).call();
            if (typeof fullHash !== 'undefined' || fullHash !== "") {
                const hash = fullHash.substring(21);
                console.log("PINNING SERVER IS PINNING HASH ", hash);
                ipfs.pin.ls(hash, (err, pinset) => {
                    if (err) {
                        ipfs.pin.add(hash);
                        console.log('Pinned hash', hash);
                    }
                    if (pinset) {
                        console.log('Hash already pinned', hash);
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
                console.log("PINNING SERVER IS PINNING HASH ", hash);
                ipfs.pin.ls(hash, (err, pinset) => {
                    if (err) {
                        console.log('Pinning hash...', hash);
                        ipfs.pin.add(hash);
                    }
                    if (pinset) {
                        console.log('Hash already pinned', hash);
                    }
                })
            }
        }
    });
});


