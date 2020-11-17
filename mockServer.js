const http = require('http');
const url = require('url');

http.createServer(function (req, res) {

    const quotationServicePath = '/checkQuotation';
    const blacklistServicePath = '/checkBlacklist';

    let myQuery = url.parse(req.url, true).query;

    let body = [];
    req.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {

        body = Buffer.concat(body).toString();

        res.writeHead(200, { 'Content-Type': 'json' });

        const quotationResponse = '{"quotation": 35000}'
        if (req.url === quotationServicePath && req.method === "POST" && body) {
            setTimeout(function () { res.end(quotationResponse); }, 50);
        }
        else if (url.parse(req.url).pathname === blacklistServicePath) {
            let licencePlate = myQuery.licencePlate;
            if (licencePlate === "AA123AA") {
                setTimeout(function () { res.end('{"blacklisted": true}'); }, 50);
            } else {
                setTimeout(function () { res.end('{"blacklisted": false}'); }, 50);
            }

        } else {
            res.statusCode = 400;
            res.end('400: Bad Request');
        }

    });

}).listen(3000);