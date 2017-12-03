const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getTabs', mid.requiresLogin, controllers.Tab.getTabs);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/ezchord', mid.requiresLogin, controllers.Tab.appHomePage);
  app.post('/saveTab', mid.requiresLogin, controllers.Tab.make);
  app.get('/searchForTabs', mid.requiresLogin, controllers.TabSearcher.searchTabs);
  app.get('/scrapeTab', mid.requiresLogin, controllers.TabScraper.scrapeTab);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/*', mid.requiresLogin, controllers.Tab.appHomePage);
  app.get('/*', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
