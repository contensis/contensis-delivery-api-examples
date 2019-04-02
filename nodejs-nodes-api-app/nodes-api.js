const EventEmitter = require("events").EventEmitter;
const https = require("https");
const http = require("http");
const Client = require('contensis-delivery-api').Client;

class NodesApi {
    constructor() {
        this.client = Client.create({
            accessToken: 'xxxx-xxxxx',
            projectId: 'website',
            rootUrl: 'https://cms-example.cloud.contensis.com',
            versionStatus: "latest",
            // responseHandler: {
            //     404: (response, clientError) => null
            // }
        });
    }

    async getProject() {
        return this.client.project.get();
    }

    async getRootNode(nodeDepth = 0) {
        return this.client.nodes.getRoot({
            depth: nodeDepth
        });
    }

    async getNode(nodeId = '', nodePath = '', nodeDepth = 0) {
        if (!!nodeId) {
            return this.client.nodes.get({
                id: nodeId,
                depth: nodeDepth
            });
        }

        if (!!nodePath) {
            if (nodePath === '/') {
                return this.getRootNode(nodeDepth)
            }

            return this.client.nodes.get({
                path: nodePath,
                depth: nodeDepth
            });
        }

        throw new Error("Node id or path were not specific");
    }

    async getNodesByEntryId(entryId) {
        return this.client.nodes.getByEntry({
            entryId
        });
    }

    async getChildren(nodeId) {
        return this.client.nodes.getChildren({
            id: nodeId
        });
    }

    async getParent(nodeId, nodeDepth = 0) {
        return this.client.nodes.getParent({
            id: nodeId,
            depth: nodeDepth
        });
    }

    async getAncestorAtLevel(nodeId, startLevel, nodeDepth = 0) {
        return this.client.nodes.getAncestorAtLevel({
            id: nodeId,
            startLevel,
            depth: nodeDepth
        });
    }

    async getAncestors(nodeId, startLevel = 1) {
        return this.client.nodes.getAncestors({
            id: nodeId,
            startLevel
        });
    }

    async getSiblings(nodeId) {
        return this.client.nodes.getSiblings({
            id: nodeId
        });
    }
}

module.exports = NodesApi;