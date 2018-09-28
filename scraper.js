var http = require("http");
var express = require("express");
var app = express();
var Crawler = require("crawler");
var Cheerio = require("cheerio");

var page = 1;
var concerts = [];
var url = "http://www.wegottickets.com/searchresults/page/1/all#paginate";


var scrape = function(error, res, body) {
    $ = res.$;
	
	collectConcerts($);
}

var c = new Crawler({
	//maxConnections: 1,
	
	preRequest: function(options, done){
		console.log("Crawling new page: " + options.uri + "\n");
		done();
	},
	
	callback: scrape
});


function nextPage($) {
	//var relativeLinks = $("a[href^='/']");
	var relativeLinks = $("a");
	
	page++;
	var nextPage = "http://www.wegottickets.com/searchresults/page/"+page+"/all#paginate";
		
	console.log("Checking for "+ nextPage +" in the " + relativeLinks.length + " absolute & relative links on this page.");
	var found = false;
	
	relativeLinks.each(function() {
		
      var newLink = $(this).attr("href");
		if (!newLink) {
			return true; // Some <a> don't have a href attr and cause newLink to be undefined.
		}
        
		if (newLink.includes(nextPage)) {
			found = true;
			console.log("Found next page: " + nextPage);
			c.queue(nextPage);
			return false;
        }
		
	});
	if (!found) console.log("Next page not found. \nCrawl finished.");
}

function collectConcerts($) {
	console.log(concerts.length + " concerts have been prev..");
	$('div.content.block-group.chatterbox-margin').each(function(i, elem) {
		//console.log("current element: "+$(this).text());
		
		
		console.log($(this).children('.buy-stock').text());
		
		concerts.push({
			title: $(this).children('h2').text(),
			location: $(this).children('.block.diptych.chatterbox-margin').children('.venue-details').children("h4").first().text(),
			date: $(this).children('.block.diptych.chatterbox-margin').children('.venue-details').children("h4").first().next().text(),
			price: $(this).children(".block.diptych.text-right").children('.searchResultsPrice').children("strong").text(),
			availability: $(this).children(".block.diptych.text-right").children(".buyboxform").children('.buy-stock').text().trim(),
			link: $(this).children('h2').children('a.event_link').attr('href')
		});
	});
	console.log(concerts.length + " concerts have been found so far.");
	console.log("Pushed new concert object: " + JSON.stringify(concerts));
	console.log("\n");
	
	nextPage($);
}


c.queue(url);