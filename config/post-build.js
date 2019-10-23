/*
 * $Id: post-build.js 47588 2019-03-25 13:35:00Z robertj $
 *
 * Adds rev hashes for cache busting to link.href and script.src attributes
 * of www/index.html.
 *
 * Configured as "postbuild" script in package.json.
 */

"use strict";

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const revhash = require('rev-hash');

const target = 'www';
const indexPath = path.join(target, 'index.html');

const $ = cheerio.load(fs.readFileSync(indexPath, 'utf-8'));

let addHash = function (elem, attrName) {
  let fileSpec = elem.attr(attrName).split(/[?]/)[0];
  let hash = revhash(fs.readFileSync(path.join(target, fileSpec)));
  elem.attr(attrName, fileSpec + '?' + hash);
};

// add hashes to all <link href>
$('head link[href]').each(function () {
  addHash($(this), 'href');
});

// add hashes to all <script src>
$('body script[src]').each(function () {
  addHash($(this), 'src');
});

// add svn version to body
$('body').attr('data-revision', process.env.SVN_VERSION);

fs.writeFileSync(indexPath, $.html());
