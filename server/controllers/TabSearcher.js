// tabSearcher.js
// searches for tabs
const queryString = require('querystring');
const ugs = require('ultimate-guitar-scraper');

// function to search for tabs
// takes request and response objects
const searchTabs = (req, res) => {
  const query = req.url.split('?')[1];
  const params = queryString.parse(query);

  // validate input
  if (!params.bName && !params.sName) {
    res.status(400).json({ error: 'Error!  Please fill in at least 1 field.' });
  }

  // set up query
  const ugsQuery = {
    bandName: params.bName,
    songName: params.sName,
    page: 1,
    type: ['chords'],
  };

  // callback for tab searching
  const ugsCallback = (error, tabs, response) => {
        // if error, print
    if (error) {
      console.dir(error);
      console.dir(response);
      res.status(400).json({ error: 'No tabs found!  Please try again.' });
    } else {
      // filter out any tabs that are not 'chords'
      const tmp = [];
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].type === 'chords') tmp.push(tabs[i]);
      }

      // use express .json function to return json directly
      res.json({ tabs: tmp });
    }
  };

  // query the Ultimate Guitar Scraper for tabs (callback above)
  ugs.search(ugsQuery, ugsCallback);
};

module.exports.searchTabs = searchTabs;
