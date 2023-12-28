const httpServer = require('http-server');
const path = require('path');

const port = 8099;

httpServer
  .createServer({
    // root 是当前文件夹的父文件夹
    root: path.resolve(__dirname, './'),
  })
  .listen(port);

console.log(`静态文件服务器运行在 http://localhost:${port}`);
