const http = require("http");

const server = http.createServer((request, response) => {
    response.statusCode = 200;
    response.end("Hello, World!");
});

server.listen(34197);