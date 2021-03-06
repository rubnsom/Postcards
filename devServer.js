var http = require('http');
var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.dev');
var ig = require('instagram-node').instagram();

var app = express();
var compiler = webpack(config);
var redirect_uri = 'http://localhost:8000/handleauth';
var accessToken;
var userId;

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

//app.use(express.static(__dirname + '/public'));
//ig.use({ access_token: '1100019683.842ad45.7adf1739782242df86f322df4d7f4f89' });
 // Every call to `ig.use()` overrides the `client_id/client_secret`
ig.use({
   client_id: '842ad45977294eb98b53c5f9ddce023d',
   client_secret: 'e2d3f444594d4bd192c88e88254402a1'
});

//access_token=1100019683.842ad45.7adf1739782242df86f322df4d7f4f89

exports.authorize_user = function(req, res) {
  if(typeof accessToken === 'undefined')
    res.redirect(ig.get_authorization_url(redirect_uri, { scope: ['public_content', 'likes'], state: 'true' }));
  else
    res.redirect('/gallery');
};

exports.handleauth = function(req, res) {
  ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send("Access denied");
    } else {
      accessToken = result.access_token;
      userId = accessToken.split('.')[0];
      ig.use({
       access_token : accessToken
      });
      console.log('Your Access token is ' + result.access_token);
      //res.send('Authorized access');
      res.redirect('/gallery');
    }
  });
};
// This is where you would initially send users to authorize
app.get('/authorize_user', exports.authorize_user);

// This is your redirect URI
app.get('/handleauth', exports.handleauth);

app.get('/getUserInfo', function(req, res){
  ig.user(userId, function(err, result, remaining, limit) {
    if(err) {
      console.log("Error: " + err);
      res.send(500)
    }
    res.send(result);
  });
});

app.get('/getMedia', function(req, res){
  var total = 0;
  var hdl = function(err, result, pagination, remaining, limit) {
      if(err) {
        console.log("Error: ", err.message, err.stack);
      } else {
        res.send(result);
      }
  };
  ig.user_media_recent(userId, { min_timestamp: 0 }, hdl);
});

// app.get('/getMedia', function(req, res){
//   var total = 0;
//   var hdl = function(err, result, pagination, remaining, limit) {
//       if(err) {
//         console.log("Error: ", err.message, err.stack);
//       } else {
//         console.log('Pagination: ', pagination.next);
//         console.log('remaining: ', remaining);
//         console.log('limit: ', limit);
//         result.forEach(function(media){
//           total ++;
//           console.log(media.id);
//         });
//         if(pagination.next){
//           pagination.next(hdl);
//         }else {
//           console.log('Total media: ', total);
//           res.send(result);
//         }
//       }
//   };
//   //create a new instance of the use method which contains the access token gotten
//   ig.user_media_recent(userId, { count:5, max_id: '15535441_1226698387421563'}, hdl);
// });

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(8000, '0.0.0.0', function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:8000');
});
