var mtgoxDump = './mtgox.db'; // this is the database file outputted by the Trade Downloader ( https://bitcointalk.org/index.php?topic=221055.0 )
var output = './candles-' + (+new Date()) + '.csv'; // csv file with your candles

var db = require('sqlite-wrapper')(mtgoxDump);
var moment = require('moment');
var _ = require('underscore');
var fs = require('fs');

var i = 0;

var dateformat = 'YYYY-MM-DD HH:mm:ss'
var now = function() {
  return moment().format(dateformat);
}

var toMicro = function(moment) {
  return moment.valueOf() * 1000;
}

////////////////////////////////////////////
// candle vars
////////////////////////////////////////////
// example with string
// var startTime = moment("2012-10-30", "YYYY-MM-DD");
// example with unix timestamp
// var startTime = moment.unix(1312268400)
// // candle duration
// var endTime = moment.unix(1325372400);
// var candleDuration = moment.duration(60, 'minutes');

//var startTime = moment("2011-04-09")
var startTime = moment("2013-08-01")
// candle duration
var endTime = moment("2013-12-10");
var candleDuration = moment.duration(60, 'minutes');

var currentCandleTime = startTime;

////////////////////////////////////////////
// process & store candles
////////////////////////////////////////////
var csv = '';
fs.writeFileSync(output, 'date,open,high,low,close\n');
var calculateCandle = function(err, trades) {
  if(err)
    throw err;

  var prices = _.pluck(trades, 'Price');
  var open = _.first(prices) / 100000;
  var high = _.max(prices) / 100000;
  var low = _.min(prices) / 100000;
  var close = _.last(prices) / 100000;
  console.log(now(), 'calculated candle ', i, '\tOHCL:', open, high, low, close);

  csv += [
    currentCandleTime.format('X') - (candleDuration / 1000),
    open,
    high,
    low,
    close
  ].join(',') + '\n';

  // recursive
  ask();
}

////////////////////////////////////////////
// write csv
////////////////////////////////////////////
var write = function() {
  console.log(now(), 'going to write last 10 candles to output')
  fs.appendFileSync(output, csv);
  console.log(now(), 'done, written', i, 'candles so far');
  csv = '';
}
var done = function() {
  console.log(now(), 'writing last candles');
  fs.appendFileSync(output, csv);
  console.log(now(), 'all done!');
}

////////////////////////////////////////////
// create sql query
////////////////////////////////////////////
var table = 'dump';
var joins = null;
var columns = null; // means all culumns

var whereClause;
var whereValues = null; // this one not working somehow, hacky workaround
var orderBy = null;
var limit = null;
var distinct = false;

var ask = function() {
  
  if(currentCandleTime > endTime.clone().subtract(candleDuration))
    return done();

  if(++i % 10 === 0)
    write();

  // little hacky bit it works :()
  var from = toMicro(currentCandleTime);
  var to = toMicro(currentCandleTime.add(candleDuration));
  whereClause = 
    [
      'Money_Trade__ > ',
      from,
      ' AND Money_Trade__ < ',
      to,
      ' AND Currency__ = "USD"'
    ].join('');

  db.select(
      table, 
      joins,
      columns,
      whereClause,
      whereValues,
      calculateCandle,
      orderBy,
      limit,
      distinct
  );
}

console.log(now(), 'starting candle calculator');
console.log(now(), 'beginning from:', currentCandleTime.format(dateformat));
console.log(now(), 'ending at:', endTime.format(dateformat));
console.log();
console.log();
ask();