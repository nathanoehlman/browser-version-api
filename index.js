// Enable New Relic by setting an environment variable for it
if (process.env.NEW_RELIC_LICENSE_KEY) require('newrelic');

var rollbar = require('rollbar');
var restify = require('restify');
var pkg = require('./package.json');
var versioner = require('./lib/versioner');

var server = new restify.createServer({
    name: pkg.name,
    version: pkg.version,
    formatters: {
        'text/csv; q=0.2': function(req, res, body, cb) {
            if (body instanceof Error) {
                return body.stack;
            }

            var data = Object.keys(body).map(function(k) {
                return body[k];
            }).join(',');
            res.setHeader('Content-Length', Buffer.byteLength(data));
            res.setHeader('Content-Type', 'text/csv');
            return cb(null, data);
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
        if (!info) res.send(404);
        return res.send(info);
    });
}

server.get('/:platform/:browser/:channel', discover);
server.get('/:platform/:browser/:channel/:lang', discover);

if (process.env.ROLLBAR_ACCESS_TOKEN) {
    server.use(rollbar.errorHandler(process.env.ROLLBAR_ACCESS_TOKEN));
}

var port = process.env.PORT || 4654;
server.listen(port, function(err) {
    console.log('Server running at:', server.url);
});