// tabSearcher.js
// searches for tabs
const queryString = require('querystring');
const ugs = require('ultimate-guitar-scraper');


const searchTabs = (req, res) => {
  const query = req.url.split('?')[1];
  const params = queryString.parse(query);

    // can validate input here, send back 400 if bad request?

    // scrape ultimate guitar for a search
  let returnedTabs = [];

  const ugsQuery = {
    bandName: params.bName,
    songName: params.sName,
    page: 1,
    type: ['chords'],
  };

  const ugsCallback = (error, tabs, response) => {
        // if error, print
    if (error) {
      console.dir(error);
      console.dir(response);
      res.status(500).send('Internal Server Error.  Please contact page administrator.');
    } else {
      returnedTabs = tabs;
      console.log('got tabs');

            // use express .json function to return json directly
      res.setHeader('Content-Type', 'application/json');
      res.json({ tabs: returnedTabs });
    }
  };

    // query the Ultimate Guitar Scraper for tabs (callback above)
  ugs.search(ugsQuery, ugsCallback);
};

module.exports.searchTabs = searchTabs;
