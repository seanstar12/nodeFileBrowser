var express = require('express'),
    exphbs = require('express3-handlebars'),
    fs = require('fs'),
    util = require('util'),
    humanize = require('humanize'),
    mime = require('./lib/mimetypes'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express();

var confExists = fs.existsSync(__dirname + '/config');

  if (confExists) {
    console.log('exists');
  } else {
    console.log('No config, creating one for you');
    fs.createReadStream(__dirname + '/config.examp').pipe(fs.createWriteStream(__dirname + '/config'));
  }
  var conf = require('./config');


app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(cookieParser(conf.cookieSecret || 'pikachu'));
app.use(bodyParser());
app.use(express.static('public/'));
app.listen(8092);

filePath = conf.filePath;
route = conf.route;
allowHidden = conf.allowHidden;
allowSym = conf.allowSym;
api = conf.api;
homeName = conf.homeName;
 
var verify = [buildPath];  //middleware

app.get('/robots.txt', function(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.send('User-agent: *\nDisallow: /');
});

app.get('/login', function(req,res){
  if (req.signedCookies.isCool){
    res.cookie('isCool', 'true', {signed: true,maxAge: 86409000*365*10, httpOnly: true});
    res.redirect('/');
  } else {
    res.render('login');
  }
});

app.get('/logout', function(req,res){
  if (req.signedCookies.isCool){
    res.clearCookie('isCool');
    res.redirect('/');
  } else res.redirect('/');
});

app.post('/login', function(req,res){
  if (req.body.email == '' && req.body.pass == ''){
    res.cookie('isCool', 'true', {signed: true,maxAge: 86409000*365*10, httpOnly: true});
    res.redirect('/');
  } else {
    res.render('login', {
      title:"Wrong", 
      msg:"Leave the form blank. Trust me, I'm an engineer.", 
      type:"alert-danger",
      email: req.body.email || ''
    });
  }
});

app.get('/*',verify, function (req,res) {
  var obj = {};
  obj['path'] = filePath + req._PATHSTR;
  fs.stat(obj.path, function(err, stats){
    if (err) {
      if (err.code == 'ENOENT') res.send(['Doesn\'t Exist']);
      else throw err;
    } else if (stats.isDirectory()) {
      fs.readdir(obj.path, function(err, files) {
        var _list = [];
        files = files.sort();
        if ( obj.path != filePath) _list.push({name:"...",type:'',size:0,path:req._PATHSTR+'/../'});
        for (var i = 0; i < files.length; i++){
          var _url = '';
          if (hidden(/^\./,files[i])) {
            _list.push({name:files[i],type:'',size:0,path:req._PATHSTR+'/'+files[i]});
          }
        }
        
        obj['list'] = _list;
        res.render('index',obj);
      });
    } else if (stats.isFile()) {
      console.log('request file: ' + obj['path']);
      res.sendFile( obj.path );
    }
  });
});

function buildPath(req,res,next){
  var split = '', valPath = [], str = '';
  split = (req.params['0']).toString();
  split = split.split('/');

  for (var _i =0; _i < split.length; _i++) {
    if (split[_i]) {
      valPath.push(split[_i]);
      str += '/' + split[_i];
    }
  }

  req._PATH = valPath;
  req._PATHSTR = str;
  next();
}

function hidden(exp,str){
  if (allowHidden) return true;
  else if (exp.test(str)) return false;
  else return true;
}

function writePipe(req, res, filePath){
  res.writeHead(200, {
    'Content-Type': result,
    'Content-Length': stats.size
  });
  var readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
}
