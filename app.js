var express = require('express'),
    exphbs = require('express3-handlebars'),
    fs = require('fs'),
    mmm = require('mmmagic'),
    Magic = mmm.Magic,
    magic = new Magic(mmm.MAGIC_MIME_TYPE),
    app = express();


app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.cookieParser());
app.use(express.static('public/'));
app.listen(8089);

filePath = '/storage/ School/';
route = '/';
allowHidden = true;
allowSym = false; //not safe. by adding a slash, it bypasses.

app.get('*',verify, function (req,res) {

  fs.stat(filePath + req.params , function(err, stats){
    if (err) {
      if (err.code == 'ENOENT') res.send(['Doesn\'t Exist']);
      else throw err;
    }
    else if (stats.isDirectory()) {
      fs.readdir(filePath + req.params, function(err, files){
        var _list = [];
        files = files.sort();

        for (var i = 0; i < files.length; i++){
          var _url = '';

          if (hidden(/^\./,files[i])) {
            _list.push({name:files[i],path:req.params+'/'+files[i]});
          }
        }
        res.send(_list);
      });
    } else if (stats.isFile()){
      magic.detectFile(filePath + req.params, function(err,result){
        if (err) throw err; 
        else {
          res.writeHead(200, {
            'Content-Type': result,
            'Content-Length': stats.size
          });
          var readStream = fs.createReadStream(filePath + req.params);
          readStream.pipe(res);
          console.log(Date.now() + '  ' + filePath + req.params);
        }
      });
    }
  });
});

function verify(req,res,next){
  if (!allowSym){
    magic.detectFile(filePath + req.params, function(err, result){
      if (result.indexOf('symlink') < 0) pass();
      else res.send('This is not the path you\'re looking for.');
    });
  }
  else pass();

  function pass(){
    if (allowHidden) next();
    else if (/\/\./.test(req.params)) {
      res.send('This is not the path you\'re looking for.');
    }
    else next();
  }
}

function hidden(exp,str){
  if (allowHidden) return true;
  else if (exp.test(str)) return false;
  else return true;
}
