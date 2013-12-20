/*

  Gekko is a Bitcoin trading bot for Mt. Gox written 
  in node, it features multiple trading methods using 
  technical analysis.

  Disclaimer: 

  USE AT YOUR OWN RISK!

  The author of this project is NOT responsible for any damage or loss caused 
  by this software. There can be bugs and the bot may not perform as expected 
  or specified. Please consider testing it first with paper trading / 
  backtesting on historical data. Also look at the code to see what how 
  it's working.

*/

// helpers
var moment = require('moment');
var _ = require('lodash');
var util = require('./util');
var log = require('./log');
var async = require('async');
var Manager = require('./portfolioManager');

var config = util.getConfig();

// function range1(i){return i?range1(i-1).concat(i):[]}

// var short = range1(26);
// var long = range1(30);
// var sellTreshold = [-0.30,-0.25,-0.20,-0.15,-0.10,-0.05];
// var buyTreshold = [0.30,0.25,0.20,0.15,0.10,0.05];

// options = [short, long, sellTreshold, buyTreshold]

// function range1(i){return i?range1(i-1).concat(i):[]}

// var recursiveSearch;
// var possibilities = [];

// recursiveSearch = function (text, depth )
// {
//  text = text || "";
//  depth = depth || 0;
//  for ( var i = 0; i < options[depth].length; i++ )
//  {
//    // is there one more layer?
//    if ( depth +1 < options.length )
//      // yes: iterate the layer
//      recursiveSearch ( text + ((text=="") ? "" : ",") + options[depth][i] , depth +1 );
//    else
//      // no: this is the last layer. we add the result to the array
//      possibilities.push ( text + "," + options[depth][i] );
//  }
// }

// recursiveSearch ( );

// log.info(possibilities)

//log.info(short)

// process.argv.forEach(function (val, index, array) {
//   console.log(index + ': ' + val);
// });

// config.EMA.short = process.argv[2];
// config.EMA.long = process.argv[3];
// config.EMA.sellTreshold = process.argv[4];
// config.EMA.buyTreshold = process.argv[5];

// overwrite the watcher in case of normal setup
if(config.normal.enabled)
	config.watch = config.normal;
// set backtesting reminder
config.backtest.enabled = true;

// set updated config
util.setConfig(config);

//process.stdout.write(str(config);

if(config.talib)
  var Consultant = require('./methods/talib');
else
  var Consultant = require('./methods/' + config.tradingMethod.toLowerCase().split(' ').join('-'));

// log.info('I\'m gonna make you rich, Bud Fox.');
// log.info('Let me show you some ' + config.tradingMethod + '.\n\n');

// log.info('Preparing backtester to test strategy against historical data.');

// implement a trading method to create a consultant.
var consultant = new Consultant();



var Logger = require('./logger');
var logger = new Logger(_.extend(config.profitCalculator, config.watch));

consultant.on('advice', logger.inform);
if(config.profitCalculator.enabled)
	consultant.on('advice', logger.trackProfits);

consultant.on('finish', logger.finish);

consultant.emit('prepare');