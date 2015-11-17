var async = require('async');
var sleuth = require('browser-sleuth');

// Refreshed set of values
var platforms = ['osx', 'linux'];
var browsers = ['chrome', 'firefox'];
var channels = ['stable', 'beta', 'dev', 'unstable', 'experimental', 'esr'];
var langs = ['en-US'];

// Cache values
var cache = {};
var updateInterval = 1000 * 60 * 60;

function getCacheId(platform, browser, channel, lang) {
	return [platform, browser, channel, lang || 'en-US'].join('-');
}

function findVersion(platform, browser, channel, lang, callback) {
	sleuth.discover(browser, {
		channel: channel,
		platform: platform,
		lang: lang
	}, function(err, info) {
		if (err || !info) {
			return callback();
		}
		var cacheId = getCacheId(platform, browser, channel, lang);
		info.currentAt = (new Date()).toISOString();
		cache[cacheId] = info;
		return callback(null, info);
	});
}

// TODO: Better way fo this
function matrix() {
	var results = [];
	for (var i = 0; i < platforms.length; i++) {
		var platform = platforms[i];
		for (var j = 0; j < browsers.length; j++) {
			var browser = browsers[j];
			for (var k = 0; k < channels.length; k++) {
				var channel = channels[k];
				for (var l = 0; l < langs.length; l++) {
					var lang = langs[l];
					results.push([platform, browser, channel, lang]);
				}
			}
		}
	}
	return results;
}

function updateCache(callback) {
	var toUpdate = matrix();
	async.forEach(
		toUpdate,
		function(args, done) {
			return findVersion.apply(null, args.concat(done));
		},
		callback
	);
}

updateCache(function(err) {
	setTimeout(updateCache, updateInterval);
});

module.exports = function(opts, callback) {
	opts = opts || {};
	var cacheId = getCacheId(opts.platform, opts.browser, opts.channel, opts.lang);
	if (cache[cacheId]) {
		return callback(null, cache[cacheId]);
	}

	return findVersion(opts.platform, opts.browser, opts.channel, opts.lang, callback);
};