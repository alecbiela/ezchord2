// tabSearcher.js
// searches for tabs
const queryString = require('querystring');
const ugs = require('ultimate-guitar-scraper');

// scrapes a single tab
const scrapeTab = (req, res) => {
  const query = req.url.split('?')[1];
  const qURL = queryString.parse(query).scrape;

  // sends back bad request if no URL found
  if (!qURL) res.status(400).json({ error: 'Error!  Tab URL not Found.' });

  const ugsCallback = (error, tab) => {
    // if error, print
    if (error) {
      console.dir(error);
      res.status(500).json({ error: 'Internal Server Error.  Please contact page administrator.' });
    }
    const tmp = { content: tab.content.text };
    res.json(tmp);
  };

  // query the Ultimate Guitar Scraper for tabs (callback above)
  ugs.get(qURL, ugsCallback);
};

module.exports.scrapeTab = scrapeTab;
