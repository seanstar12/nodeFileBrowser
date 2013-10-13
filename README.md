Description
===========

![Imgur](http://i.imgur.com/7BIWfES.png "Screen Shot")

A super simple web-based file manager written for node. Hopefully, this will be made modular so it can be dropped 
into other projects at will.


Requirements
============

* [node.js](http://nodejs.org/) -- v0.6.0 or newer
* [mmmagic](http://npmjs.org/package/mmmagic) -- v0.3.4 or newer
* [express](http://npmjs.org/package/express) -- v3.4.0 or newer
* [express3-handlebars](http://npmjs.org/package/express3-handlebars) -- v0.5.0 or newer


Install
============

    npm install

  Or a one-liner

    git clone https://github.com/seanstar12/nodeFileBrowser.git; cd nodeFileBroswer; npm install

Features
============

Current:

  * Working breadcrumbs (delicious...)
  * Ability to change port
  * Ability to allow / ban symlinks
  * Ability to allow / ban hidden files
  * Set a custom directory.

Future:

  * Create users and manage permissions
  * Create guest accounts with access timeouts
  * Add a public folder / dropbox (can upload but cannot see files)
  * Ability to upload / delete / rename / etc..
  * Zip multiple files and download all at once
  * + more?


Use
============

Should be straight forward. Configure the options and port inside of app.js.
Enjoy.
