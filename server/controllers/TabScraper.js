// tabSearcher.js
// searches for tabs
const queryString = require('querystring');
const ugs = require('ultimate-guitar-scraper');

// scrapes a single tab
const scrapeTab = (req, res) => {
  const query = req.url.split('?')[1];
  const qURL = queryString.parse(query).scrape;
  console.dir(qURL);
    // sends back bad request if no URL found
  if (!qURL) res.status(400).send('Bad Request - Tab URL not Found!');

  const ugsCallback = (error, tab) => {
        // if error, print
    if (error) {
      console.dir(error);
      res.status(500).send('Internal Server Error.  Please contact page administrator.');
    } else {
      console.log('got scraped tab');
      const tmp = { content: tab.content.text };

      res.setHeader('Content-Type', 'application/json');
      res.json(tmp);
            // res.send(tab.contentHTML);
    }
  };

    // query the Ultimate Guitar Scraper for tabs (callback above)
  ugs.get(qURL, ugsCallback);
};

module.exports.scrapeTab = scrapeTab;
