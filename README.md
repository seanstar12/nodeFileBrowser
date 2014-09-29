Description
===========

![Imgur](http://i.imgur.com/nRPbROd.png "Screen Shot")

A super simple web-based file manager written for node. Hopefully, this will be made modular so it can be dropped 
into other projects at will.


Requirements
============

* See package.json

Install
============

    npm install

  Or a one-liner

    git clone https://github.com/seanstar12/nodeFileBrowser.git; cd nodeFileBrowser; npm install

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

Chopping Block (My todo list):

  * Rework '/' to a function based operation
  * Change the reading of filetypes to a list of known types
  * Need to finalize signup page
  * Add proper routes to handle/manage users
  * Setup some sort of DB and get rid of config file
  * Bug: Fails to load on empty directory

Use
============

Should be straight forward. Configure the options and port inside of app.js.
Enjoy.
