var express = require('express'),
    exphbs = require('express3-handlebars'),
    fs = require('fs'),
    util = require('util'),
    mmm = require('mmmagic'),
    Magic = mmm.Magic,
    magic = new Magic(mmm.MAGIC_MIME_TYPE),
    app = express();


app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.cookieParser());
app.use(express.static('public/'));
app.use(express.favicon(__dirname + '/public/favicon.ico', { maxAge: 2592000000 }));
app.listen(8089);

filePath = '/storage/ School';
route = '/';
allowHidden = false;    //work in progress
allowSym = false;
api = false;

var verify = [buildPath,symmCheck];

app.get('*',verify, function (req,res) {
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
            //_list[count].size = (fileStat.size / 1048576) + ' MB';
            _list[count].size = fileStat.size + ' Bytes';
          });
          
          magic.detectFile(filePath + _list[count].path, function(err, result){
            _list[count].type = result.split('/')[1];
            _mmmCount++; //TODO: ASYNC Rocks! #Clean this up later.
            if (_mmmCount == _list.length){
              if (api) res.send(_list);
              else {
                var obj = {
                  list: _list, path: [{link: '/', name: 'Casa' }]
                }
                
                var tempPath = '/';
                for (var _i = 0; _i < req._PATH.length; _i++)
                  obj.path.push({link:tempPath+=req._PATH[_i] + '/', name:req._PATH[_i]});

                res.render('home', obj);
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
          console.log(Date.now() + '  ' + filePath + req._PATHSTR);
        }
      });
    }
  });
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
        if (err) res.send(404,{code:404,msg:'Your request is bad, and you should feel bad.'});
        else {
          if (result.indexOf('symlink') >= 0 ) bool = false;
          if (cnt ==  req._PATH.length) {
            if (bool) next();
            else res.send(401,{code:401,msg:'Your request is denied, and you should feel denied.'});
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
