const models = require('../models');
const Tab = models.Tab;

const makeTab = (req, res) => {
  if (!req.body.name || !req.body.url || !req.body.artist) {
    return res.status(400).json({ error: 'Missing Title, Artist, and/or URL of TAB' });
  }

  const tabData = {
    name: req.body.name,
    artist: req.body.artist,
    url: req.body.url,
    owner: req.session.account._id,
  };

  const newTab = new Tab.TabModel(tabData);

  const tabPromise = newTab.save();

  tabPromise.then(() => res.json({ redirect: '/ezchord' }));

  tabPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Tab Already Favorited' });
    }

    return res.status(400).json({ error: 'An Error Occurred' });
  });

  return tabPromise;
};

const appHomePage = (req, res) => {
  Tab.TabModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), tabs: docs });
  });
};

const getTabs = (request, response) => {
  const req = request;
  const res = response;

  return Tab.TabModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An Error Occurred' });
    }

    return res.json({ tabs: docs });
  });
};

const deleteFav = (req, res) => {
	
  return Tab.TabModel.removeTab(req.session.account._id, req.body.url, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'An Error Occurred' });
    }

    return res.json({ redirect: '/getTabs' });
  });
};

module.exports.make = makeTab;
module.exports.appHomePage = appHomePage;
module.exports.getTabs = getTabs;
module.exports.deleteFav = deleteFav;
