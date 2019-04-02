const NodesApi = require("./nodes-api");
const Render = require("./render");
const querystring = require("querystring");
const url = require("url");

class Router {

  constructor() {
    this.commonHeader = {
      'Content-Type': 'html'
    };
    this.defaultTitle = 'Contensis Delivery Api example for nodes';
  }

  async home(req, res) {
    let _this = this;
    if (req.url !== "/") {
      return;
    }

    let title = this.defaultTitle + " - home";

    if (req.method.toLowerCase() === "post") {
      req.on("data", async postBody => {
        var form = querystring.parse(postBody.toString());
        if (!!form.nodeId || !!form.nodePath) {
          const location = "/node-explorer?" + (!!form.nodeId ? "nodeId=" + form.nodeId : "nodePath=" + form.nodePath);
          res.writeHead(303, {
            "location": location
          });
          res.end();
          return;
        }

        await _this.renderHome(res, title);
        return;
      });
    }

    if (req.method.toLowerCase() === "get") {
      await _this.renderHome(res, title);
      return;
    }
  }

  async renderHome(res, title) {
    try {
      const nodesApi = new NodesApi();
      let project = await nodesApi.getProject();
      let rootNode = await nodesApi.getRootNode(1);
      res.writeHead(200, this.commonHeader);
      Render.view("header", {
        title
      }, res);
      Render.view("home", {
        title,
        projectName: project.name,
        rootNodeId: rootNode.id,
        rootNodeTitle: rootNode.title,
        rootNodePath: rootNode.path,
        node1Id: rootNode.children[0].id,
        node1Title: rootNode.children[0].title,
        node1Path: rootNode.children[0].path,
        node2Id: rootNode.children[1].id,
        node2Title: rootNode.children[1].title,
        node2Path: rootNode.children[1].path,
        node3Id: rootNode.children[2].id,
        node3Title: rootNode.children[2].title,
        node3Path: rootNode.children[2].path,
      }, res);
      Render.view("footer", {}, res);
      res.end();
    } catch (error) {
      console.log("Error:", error);
      throw error;
    }
  }

  async nodeExplorer(req, res) {
    let _this = this;
    if (!req.url || !req.url.startsWith("/node-explorer")) {
      return;
    }

    let title = this.defaultTitle + " - node explorer";
    if (req.method.toLowerCase() === "post") {
      req.on("data", async function (postBody) {
        let query = url.parse(req.url, true).query;
        let nodePath = (!query.nodeId && !query.nodePath) ? '/' : query.nodePath;
        let form = querystring.parse(postBody.toString());
        let action = ''

        if (!!form.byEntryId) {
          action = form.byEntryId;
        }

        if (!!form.children) {
          action = form.children;
        }

        if (!!form.parent) {
          action = form.parent;
        }

        if (!!form.ancestor) {
          action = form.ancestor;
        }

        if (!!form.ancestors) {
          action = form.ancestors;
        }

        if (!!form.siblings) {
          action = form.siblings;
        }

        await _this.renderNodeExplorer(
          res,
          title,
          query.nodeId,
          nodePath,
          (form.nodeDepth && form.nodeDepth > -1) ? form.nodeDepth : 0,
          (form.startLevel && form.startLevel > -1) ? form.startLevel : 1,
          form.entryId,
          action);
      });
      return;
    }

    if (req.method.toLowerCase() === "get") {
      let query = url.parse(req.url, true).query;
      let nodePath = (!query.nodeId && !query.nodePath) ? '/' : query.nodePath;

      await _this.renderNodeExplorer(res, title, query.nodeId, nodePath);
      return;
    }
  }

  async renderNodeExplorer(res, title, nodeId = '', nodePath = '', nodeDepth = 0, startLevel = 1, entryId = null, action = '') {
    try {
      const nodesApi = new NodesApi();
      let node = await nodesApi.getNode(nodeId, nodePath, !!action ? 0 : nodeDepth);
      let resultNodes = [];
      if (!!action && !!node) {
        if (action === 'byEntryId') {
          let nodesByEntryId = await nodesApi.getNodesByEntryId(entryId);
          if (!!nodesByEntryId) {
            resultNodes.push(...nodesByEntryId);
          }
        } else if (action === 'children') {
          let nodeChildren = await nodesApi.getChildren(node.id);
          if (!!nodeChildren) {
            resultNodes.push(...nodeChildren);
          }
        } else if (action === 'parent') {
          let nodeParent = await nodesApi.getParent(node.id);
          if (!!nodeParent) {
            resultNodes.push(nodeParent);
          }
        } else if (action === 'ancestor') {
          let nodeAncestor = await nodesApi.getAncestorAtLevel(node.id, startLevel);
          if (!!nodeAncestor) {
            resultNodes.push(nodeAncestor);
          }
        } else if (action === 'ancestors') {
          let nodeAncestors = await nodesApi.getAncestors(node.id, startLevel);
          if (!!nodeAncestors) {
            resultNodes.push(...nodeAncestors);
          }
        } else if (action === 'siblings') {
          let nodeSiblings = await nodesApi.getSiblings(node.id);
          if (!!nodeSiblings) {
            resultNodes.push(...nodeSiblings);
          }
        }
      } else {
        if (!!node) {
          resultNodes.push(node);
        }
      }

      let nodeJson = JSON.stringify(resultNodes, null, 2);

      res.writeHead(200, this.commonHeader);
      Render.view("header", {
        title
      }, res);
      Render.view("node-explorer", {
        title,
        nodeTitle: !!node ? node.title : 'Not Found',
        nodeJson
      }, res);
      Render.view("footer", {}, res);
      res.end();
    } catch (error) {
      console.log("Error:", error);
      throw error;
    }
  }

  async siteView(req, res) {
    let _this = this;
    if (!req.url || !req.url.startsWith("/siteview")) {
      return;
    }

    if (req.method.toLowerCase() !== "get") {
      return;
    }

    let title = this.defaultTitle + " - site view";
    let query = url.parse(req.url, true).query;
    let nodePath = (!query.nodeId && !query.nodePath) ? '/' : query.nodePath;

    await _this.renderSiteView(res, title, query.nodeId, nodePath);
  }

  async renderSiteView(res, title, nodeId = '', nodePath = '') {
    try {
      const nodesApi = new NodesApi();
      let node = await nodesApi.getNode(nodeId, nodePath, 1);

      let entry = '';
      if (!!node && !!node.entry && !!node.entry.sys && !!node.entry.sys.id) {
        entry = `<li class="list-group-item">Node entry id is ${node.entry.sys.id}</li>`;
      }

      let ancestorNodes = await nodesApi.getAncestors(node.id, 1);
      let breadcrumbs = '';
      ancestorNodes.forEach(ancestorNode => {
        breadcrumbs += `<li class="breadcrumb-item"><a href="/siteview?nodeId=${ancestorNode.id}">${ancestorNode.title}</a></li>`;
      });
      breadcrumbs += `<li class="breadcrumb-item active" aria-current="page">${node.title}</li>`;

      let siblingNodes = await nodesApi.getSiblings(node.id);
      let siblings = '';
      siblingNodes.forEach(siblingNode => {
        siblings +=
          `<li class="list-group-item">
            <a href="/siteview?nodePath=${siblingNode.path}" class="card-link">${siblingNode.title}</a>
          </li>`;
      });

      let childNodes = await nodesApi.getChildren(node.id);
      let children = `<p class="card-text">The current node does not have any children.</p>`;
      if (childNodes.length > 0) {
        children = '<ul class="nav flex-column">';
        childNodes.forEach(childNode => {
          children += `
          <li class="nav-item">
            <a class="nav-link" href="/siteview?nodePath=${childNode.path}">${childNode.title}</a>
          </li>`;
        });
        children += '</ul>';
      }

      let nodeJson = JSON.stringify(node, null, 2);

      res.writeHead(200, this.commonHeader);
      Render.view("header", {
        title
      }, res);
      Render.view("site-view", {
        title,
        breadcrumbs,
        siblings,
        entry,
        children,
        nodeId: node.id,
        nodeTitle: node.title,
        nodePath: node.path,
        nodeJson
      }, res);
      Render.view("footer", {}, res);
      res.end();
    } catch (error) {
      console.log("Error:", error);
      throw error;
    }
  }
}

module.exports = Router;