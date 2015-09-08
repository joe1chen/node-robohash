(function() {
  var Express, Log, Robohash, Robostore, app, log, robostore;
  Log = require('log');
  log = new Log(Log.DEBUG);
  Express = require('express');
  var app = Express();
  Robohash = require('./lib/robohash');
  Robostore = require('./lib/robostore');
  var cacheResponseDirective = require('express-cache-response-directive');
  robostore = Robostore.getStorage("" + __dirname + "/data/robostore");
  app.configure(function() {
    app.set('views', "" + __dirname + "/views");
    app.set('view engine', 'jade');
    app.use(cacheResponseDirective());
    app.use(Express.bodyParser());
    return app.use(Express.methodOverride());
  });
  app.configure('development', function() {
    return app.use(Express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });
  app.configure('production', function() {
    return app.use(Express.errorHandler());
  });
  app.configure(function() {
    app.use(app.router);
    return app.use(Express.static("" + __dirname + "/public"));
  });
  app.get('/', function(req, res) {
    return res.render('index', {
      size: 100,
      rows: 8,
      cols: 8
    });
  });
  app.get('/:hash', function(req, res) {
    res.cacheControl({
      'public': true,
      maxAge: 31536000
    }); /* 1 year cache */
    res.set('Content-Type', 'image/png');
    return Robohash.randomBot(robostore, function(err, canvas) {
      var stream;
      if (err != null) {
        log.error(err);
        return res.end();
      } else if (canvas != null) {
        stream = canvas.createPNGStream();
        stream.on('data', function(chunk) {
          return res.write(chunk);
        });
        return stream.on('end', function() {
          return res.end();
        });
      } else {
        return res.end();
      }
    });
  });

  var port = process.env.PORT || 3000;
  app.listen(port);
  log.info("listening at port " + port);
  console.log("open browser to http://localhost:" + port);
}).call(this);
