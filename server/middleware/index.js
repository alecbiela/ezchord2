// checks if the user is logged in based on their session status
// will redirect them to login page if they aren't
const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/');
  }
  return next();
};

// checks if the user is logged out based on their session status
// will redirect them to app homepage if they are
const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/ezchord');
  }

  return next();
};

// checks if the user is using a secure (HTTPS) connection
// if not, will route to same path, but under HTTPS
const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
};

// a function to bypass the secure functionality
const bypassSecure = (req, res, next) => {
  next();
};

// exports
module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;

// if in release/production environment, DO NOT export bypass
// otherwise, don't check for the https requirement
if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
