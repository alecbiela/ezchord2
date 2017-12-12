const models = require('../models');
const Account = models.Account;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

const settingsPage = (req, res) => {
  res.render('settings', { csrfToken: req.csrfToken() });
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

const login = (request, response) => {
  const req = request;
  const res = response;

  // force cast to strings to cover some security flaws
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'Error!  All fields are required.' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Username or password is incorrect.' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/ezchord' });
  });
};

const changePass = (request, response) => {
  const req = request;
  const res = response;

  // cast data to strings
  req.body.currPass = `${req.body.currPass}`;
  req.body.newPass = `${req.body.newPass}`;
  req.body.newPass2 = `${req.body.newPass2}`;

  // validate input
  if (!req.body.currPass || !req.body.newPass || !req.body.newPass2) {
    return res.status(400).json({ error: 'Error!  All fields are required.' });
  }

  if (req.body.newPass !== req.body.newPass2) {
    return res.status(400).json({ error: 'Error!  New passwords do not match.' });
  }

  if (req.body.newPass === req.body.currPass) {
    return res.status(400).json({ error: 'Error!  New password cannot be your old password.' });
  }

  // validate that the current password is correct
  return Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => {
    const thisAccount = docs;

    if (err) {
      console.dir(err);
      return res.status(400).json({ error: 'An Error Occurred' });
    }

    return Account.AccountModel.authenticate(docs.username, req.body.currPass, (error, account) => {
      if (error || !account) {
        return res.status(401).json({ error: 'Current Password is incorrect.' });
      }

      // generate a hash
      return Account.AccountModel.generateHash(req.body.newPass, (salt, hash) => {
        // update information
        thisAccount.password = hash;
        thisAccount.salt = salt;

        const savePromise = thisAccount.save();

        savePromise.then(() => res.json({ message: 'Password Changed Successfully' }));
        savePromise.catch((e) => {
          console.dir(e);
          return res.status(500).json({ error: 'An Error Occurred' });
        });
      });
    });
  });
};

//changes text and background colors of the user
const changeColors = (request, response) => {
  const req = request;
  const res = response;
  
  req.body.textColor = `${req.body.textColor}`;
  req.body.bgColor = `${req.body.bgColor}`;
  
  if(!req.body.textColor || !req.body.bgColor) {
    return res.status(400).json({ error: 'Missing Color Values' });
  }

  //grab the account to change
  return Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => { 
    
	if(err) {
      console.dir(err);
	  return res.status(400).json({ error: 'An Error Occurred' });
	}
	
	const thisAccount = docs;
	thisAccount.bgColor = req.body.bgColor;
	thisAccount.textColor = req.body.textColor;
	
	//save back to db
	
	const savePromise = thisAccount.save();
	
	savePromise.then(() => res.json({ message: 'Colors changed successfully' }));
	savePromise.catch((e) => {
      console.dir(e);
	  return res.status(500).json({ error: 'An Error Occurred' });
	});
  });
};

//gets the user's text and background colors to display on the screen
const getColors = (req, res) => {
  return Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => { 
	
	return res.json({
	  bgColor: docs.bgColor,
	  textColor: docs.textColor
	});
  });
};


const signup = (request, response) => {
  const req = request;
  const res = response;

  // cast to strings to cover up some security flaws
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'Error!  All fields are required.' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Error!  Passwords do not match.' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
	  bgColor: 'gray',
	  textColor: 'white'
    };

    const newAccount = new Account.AccountModel(accountData);
    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      res.json({ redirect: '/ezchord' });
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occurred' });
    });
  });
};

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.getToken = getToken;
module.exports.settingsPage = settingsPage;
module.exports.changePass = changePass;
module.exports.changeColors = changeColors;
module.exports.getColors = getColors;
