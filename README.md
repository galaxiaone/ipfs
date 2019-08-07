## IPFS Node 
This docker container starts up an IPFS node and reads the `assets` folder, adding all images and metadata to IPFS.

## How to use 

Production: In your .env file add PRODUCTION=true to avoid outputing a json file (recursively restarts node due to file change);

build the docker container and run:
```javascript 
sudo docker-compose build 
&& 
sudo docker-compose up
```


