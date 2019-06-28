## Ethereum -> IPFS File Pinner 
This docker container listens to Ethereum events and pins the file associated with the ipfs hash, avoiding it from being removed from the network after 24 hours. 

## How to use 

First build contracts using `truffle migrate --reset --network=ropsten`  (Replace ropsten with whatever network you want the ipfs node to pin files from)

Truffle migrations create a file in the build folder labeled <YourContractName>.json 

To run the IPFS pinner, edit `index.js` to match your contract name, event logs and desired network. 

Create a .env file with your Infura key. 

build the docker container and run:
```javascript 
sudo docker-compose build 
&& 
sudo docker-compose up
```

