var express = require('express'),
    exphbs = require('express3-handlebars'),
    fs = require('fs'),
    util = require('util'),
    humanize = require('humanize'),
    mmm = require('mmmagic'),
    Magic = mmm.Magic,
    magic = new Magic(mmm.MAGIC_MIME_TYPE),
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
app.use(express.cookieParser(conf.cookieSecret || 'pikachu'));
app.use(express.bodyParser());
app.use(express.static('public/'));
app.use(express.favicon(__dirname + '/public/favicon.ico', { maxAge: 2592000000 }));
app.listen(8092);

filePath = conf.filePath;
route = conf.route;
allowHidden = conf.allowHidden;
allowSym = conf.allowSym;
api = conf.api;
homeName = conf.homeName;
 
var verify = [buildPath,symmCheck];  //middleware

app.get('/robots.txt', function(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.send('User-agent: *\nDisallow: /');
});

app.get('/login', function(req,res){
  if (req.signedCookies.isCool){
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
  if (req.body.user == '' && req.body.pass == ''){
    res.cookie('isCool', 'true', {signed: true,maxAge: 86409000*365*10, httpOnly: true});
    res.redirect('/');
  } else {
    res.render('login', {title:"Nope.", msg:"Leave it blank. Trust me, I'm an engineer.", type:"alert-warning"});
  }
});

app.get('/signup', function(req,res){
  res.render('signup');
});

app.post('/signup', function(req,res){
  var obj = {
    msg: 'fuck yeah, you\'re awesome',
    email: req.body.email,
    pass: req.body.pass,
    remember: req.body.remember
  }
  res.send(obj);
});

app.get('/log', function(req,res){
  fs.readFile('log.txt', '', function(err, data){
    if (err) throw err;
    else {
      res.setHeader('Content-Type', 'text/plain');
      res.send(data);
    }
  });
});

app.get('/*',verify, function (req,res) {
  if (!req.signedCookies.isCool){
    res.redirect('/login');
  } else {
    fs.stat(filePath + req._PATHSTR , function(err, stats){
      if (err) {
        if (err.code == 'ENOENT') res.send(['Doesn\'t Exist']);
        else throw err;
      }
      else if (stats.isDirectory()) {
        fs.readdir(filePath + req._PATHSTR, function(err, files){
          var _list = [];
          files = files.sort();
          for (var i = 0; i < files.length; i++){
            var _url = '';
            if (hidden(/^\./,files[i])) {
              _list.push({name:files[i],type:'',size:0,path:req._PATHSTR+'/'+files[i]});
            }
          }

          var _count = 0, _mmmCount=0;
          for (var i = 0; i < _list.length; i++){
            getFileStats(_count,fs);
            _count++;
          }

          function getFileStats(count, _file){
            _file.stat(filePath + _list[count].path, function(err, fileStat){
              _list[count].size = humanize.filesize(fileStat.size);
            });
            
            magic.detectFile(filePath + _list[count].path, function(err, result){
              _list[count].type = result.split('/')[1];
              _mmmCount++; //TODO: ASYNC Rocks! #Clean this up later.
              if (_mmmCount == _list.length){
                if (api) res.send(_list);
                else {
                  var obj = {
                    list: _list, path: [{link: '/', name: homeName }], total:_list.length
                  }
                  
                  var tempPath = '/';
                  for (var _i = 0; _i < req._PATH.length; _i++)
                    obj.path.push({link:tempPath+=req._PATH[_i] + '/', name:req._PATH[_i]});

                  obj.helpers = {
                    foreach: function(arr, options) {
                      if(options.inverse && !arr.length)
                        return options.inverse(this);

                      return arr.map(function(item,index) {
                        item.$index = index;
                        item.$first = index === 0;
                        item.$last  = index === arr.length-1;
                        return options.fn(item);
                      }).join('');
                    }
                  };
                  res.render('index', obj); //clean light layout
                }
              }
            });
          }

        });
      } else if (stats.isFile()){
        magic.detectFile(filePath + req._PATHSTR, function(err,result){
          if (err) throw err; 
          else {
            res.writeHead(200, {
              'Content-Type': result,
              'Content-Length': stats.size
            });
            var readStream = fs.createReadStream(filePath + req._PATHSTR);
            readStream.pipe(res);
            var str = Date.now() +' | ' + req.connection.remoteAddress + ' | ' + filePath + req._PATHSTR;
            //console.log(str);
            if (fs.existsSync('log.txt')){
              fs.appendFile('log.txt', str + '\n', function(err){
                if (err) throw err;
                else console.log(str);
              });
            } else {
              fs.writeFile('log.txt',str +'\n', function(err){
                if (err) throw err;
                else console.log(str);
              });
            }
          }
        });
      }
    });
  }
});

function buildPath(req,res,next){
  var split = '', valPath = [], str = '';
  split = req.params.toString().split('/');

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

function symmCheck(req,res,next){
  // We check every directory everytime to ensure that its not going through a symlink.
  if (!allowSym && req._PATH[0]){
    var bool = true, str = '', cnt = 0;
    for (var i=0; i < req._PATH.length; i++){
      str += '/' + req._PATH[i];
      magic.detectFile(filePath + str, function(err, result){
        cnt++;
        if (err) {
          var readStream = fs.createReadStream('public/bad.txt');
          readStream.pipe(res);
        }
        else {
          if (result.indexOf('symlink') >= 0 ) bool = false;
          if (cnt ==  req._PATH.length) {
            if (bool) next();
            else {
              var readStream = fs.createReadStream('public/denied.txt');
              readStream.pipe(res);
            }
          }
        }
      });
    }
  }
  else next();
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
