var restify = require('restify');
var pkg = require('./package.json');
var versioner = require('./lib/versioner');

var server = new restify.createServer({
    name: pkg.name,
    version: pkg.version,
    formatters: {
        // Default to JSON
        'text/html': function(req, res, body, cb) {
            var value = JSON.stringify(body);
            res.writeHead(200, {
                'Content-Length': Buffer.byteLength(value),
                'Content-Type': 'application/json'
            });
            res.write(value);
            res.end();
            return cb();
        },
        'text/csv': function(req, res, body, cb) {
            if (body instanceof Error) {
                return body.stack;
            }

            var value = Object.keys(body).map(function(k) {
                return body[k];
            }).join(',');
            res.writeHead(200, {
              'Content-Length': Buffer.byteLength(value),
              'Content-Type': 'text/csv'
            });
            res.write(value);
            res.end();
            return cb();
        }
    }
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/', function(req, res) {
    res.json({
        name: pkg.name,
        description: pkg.description,
        version: pkg.version
    });
});

function discover(req, res, next) {
    versioner(req.params, function(err, info) {
        if (err) return next(err);
        return res.send(info);
    });
}

server.get('/:platform/:browser/:channel', discover);
server.get('/:platform/:browser/:channel/:lang', discover);

var port = process.env.PORT || 4654;
server.listen(port, function(err) {
    console.log('Server running at:', server.url);
});