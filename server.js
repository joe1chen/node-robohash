var recluster = require('recluster'),
    path = require('path');
var numCPUs = require('os').cpus().length;

var cluster = recluster(path.join(__dirname, 'app.js'), {
    backoff: 10,
	workers: process.env.WEB_CONCURRENCY || numCPUs
});
cluster.run();

process.on('SIGUSR2', function() {
    console.log('Got SIGUSR2, reloading cluster...');
    cluster.reload();
});

console.log("spawned cluster, kill -s SIGUSR2", process.pid, "to reload");
