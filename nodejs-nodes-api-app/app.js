const http = require('http');
const Router = require('./router');

class App {
  constructor() {
    this.port = 3000;
  }
  start() {
    const server = http.createServer((req, res) => {
      let router = new Router();
      router.home(req, res);
      router.nodeExplorer(req, res);      
      router.siteView(req, res);   
    }).listen(this.port, () => {
      console.log(`Server running at http://:${this.port}/`);
    });
  }
}

const app = new App();
app.start();