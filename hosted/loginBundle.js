"use strict";

//client.js
//handles logging in and signing up

//called when the user clicks the 'Log In' button at /login
var handleLogin = function handleLogin(e) {
  e.preventDefault();

  $("#errorMessage").slideUp(350);

  if ($("#lUser").val() == '' || $("#lPass").val() == '') {
    handleError("Error!  Username or password field is empty.");
    return false;
  }

  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);

  return false;
};

//called when the user clicks the 'Sign Up' button at /login
var handleSignup = function handleSignup(e) {
  e.preventDefault();

  $("#errorMessage").slideUp(350);

  //check for empty input
  if ($("#sUser").val() == '' || $("#sPass").val() == '' || $("#sPass2").val() == '') {
    handleError("Error!  All fields are required.");
    return false;
  }

  //check for matching passwords
  if ($("#sPass").val() !== $("#sPass2").val()) {
    handleError("Error!  Passwords do not match.");
    return false;
  }

  //post new user data to server
  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);

  return false;
};

//React element for login screen (includes login/sign up boxes)
var LoginContentWindow = function LoginContentWindow(props) {
  return React.createElement(
    "section",
    { id: "loginPageBody" },
    React.createElement(
      "section",
      { id: "signupBox", className: "bc3" },
      React.createElement(
        "h1",
        { className: "loginBoxHeader tc4" },
        "Create A Free Account:"
      ),
      React.createElement(
        "form",
        { id: "signupForm",
          name: "signupForm",
          onSubmit: handleSignup,
          action: "/signup",
          method: "POST",
          className: "mainForm"
        },
        React.createElement("input", { id: "sUser", className: "user bc0 tc4", type: "text", name: "username", placeholder: "Username..." }),
        React.createElement("input", { id: "sPass", className: "pass bc0 tc4", type: "password", name: "pass", placeholder: "Password..." }),
        React.createElement("input", { id: "sPass2", className: "pass2 bc0 tc4", type: "password", name: "pass2", placeholder: "Confirm Password..." }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit bc4 tc0", type: "submit", value: "Sign Up" })
      )
    ),
    React.createElement(
      "section",
      { id: "loginBox", className: "bc3" },
      React.createElement(
        "h1",
        { className: "loginBoxHeader tc4" },
        "Returning Users:"
      ),
      React.createElement(
        "form",
        { id: "loginForm", name: "loginForm",
          onSubmit: handleLogin,
          action: "/login",
          method: "POST",
          className: "mainForm"
        },
        React.createElement("input", { id: "lUser", className: "user bc0 tc4", type: "text", name: "username", placeholder: "Username..." }),
        React.createElement("input", { id: "lPass", className: "pass bc0 tc4", type: "password", name: "pass", placeholder: "Password..." }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit bc4 tc0", type: "submit", value: "Sign in" })
      )
    )
  );
};

//called to create the content window (at setup)
var createLoginContentWindow = function createLoginContentWindow(csrf) {
  ReactDOM.render(React.createElement(LoginContentWindow, { csrf: csrf }), document.querySelector("#content"));
};

//called at page load to initialize the screen
var setup = function setup(csrf) {
  var loginButton = document.querySelector("#loginButton");

  loginButton.addEventListener("click", function (e) {
    e.PreventDefault();
    createLoginContentWindow(csrf);
    return false;
  });

  createLoginContentWindow(csrf);
};

//called to get the initial token
var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

//called at page load
$(document).ready(function () {
  getToken();
});
"use strict";

//helper.js
//contains functionality used across views


//called for error handling, will display error message on page
var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#errorMessage").slideDown(350);
};

//called to redirect page to another page
var redirect = function redirect(response) {
  $("#errorMessage").slideUp(350);
  window.location = response.redirect;
};

//called to change the user's colors
//will set colors according to the color theme it gets back
var setUserColors = function setUserColors() {
  //get colors
  sendAjax('GET', '/colors', null, function (data) {

    //style all
    $('.bc0').css({
      'background-color': data.colors[0]
    });
    $('.bc1').css({
      'background-color': data.colors[1]
    });
    $('.bc2').css({
      'background-color': data.colors[2]
    });
    $('.bc3').css({
      'background-color': data.colors[3]
    });
    $('.bc4').css({
      'background-color': data.colors[4]
    });
    $('.tc0').css({
      'color': data.colors[0],
      'border-color': data.colors[0]
    });
    $('.tc1').css({
      'color': data.colors[1],
      'border-color': data.colors[1]
    });
    $('.tc2').css({
      'color': data.colors[2],
      'border-color': data.colors[2]
    });
    $('.tc3').css({
      'color': data.colors[3],
      'border-color': data.colors[3]
    });
    $('.tc4').css({
      'color': data.colors[4],
      'border-color': data.colors[4]
    });
  });
};

//called to send an ajax request to the server
//takes type (GET, POST, etc.), action (URL), data to send, and callback for success
var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
