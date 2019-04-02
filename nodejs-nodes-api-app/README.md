# nodejs-nodes-api-app

A vanilla Node.js web application that is a nodes based example for working with the Contensis Delivery Api.

It requires Node.js >= 8.

## Running the example

Execute _npm start_ to start the Node.js app and navigate to http://localhost:3000 in a browser.  
The example uses an API connection to https://cms-develop.cloud.contensis.com/ but this can be changed in the _nodes-api.js_ file to point to a different Contensis server.  
The example consists in:
- a node explorer page http://localhost:3000/node-explorer?nodePath=/ that can be used to call all available nodes api methods;
- a site view page http://localhost:3000/siteview?nodePath=/ which emulates a full website navigation example. 
