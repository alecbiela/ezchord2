"use strict";

//setting.js
//contains front-end functionality for settings page

//handles changing passwords
var handleChangePass = function handleChangePass(e) {
  e.preventDefault();

  $("#errorMessage").slideUp(350);

  //check for empty input
  if ($("#currPass").val() == '' || $("#newPass").val() == '' || $("#newPass").val() == '') {
    handleError("Error!  All fields are required.");
    return false;
  }

  //check for matching passwords
  if ($("#newPass").val() !== $("#newPass2").val()) {
    handleError("Error!  New passwords do not match.");
    return false;
  }

  //check new pass match old pass
  if ($('#currPass').val() === $('#newPass').val()) {
    handleError("Error!  New passwords cannot match old password.");
    return false;
  }

  //post new user data to server
  sendAjax('POST', $("#changePassForm").attr("action"), $("#changePassForm").serialize(), function (xhr) {
    //reset the form
    //https://stackoverflow.com/questions/6364289/clear-form-fields-with-jquery
    $('#changePassForm').find("input[type=password], textarea").val("");

    //let the user know PW change succeeded
    handleError("Password Changed Successfully");
  });

  return false;
};

//handles changing website colors
var handleChangeColor = function handleChangeColor(e) {
  e.preventDefault();

  $("#errorMessage").slideUp(350);

  //post new color data to the server
  sendAjax('POST', '/colors', $('#changeColorForm').serialize(), function (xhr) {

    //let the user know the color change succeeded

    //change colors
    setUserColors();
  });

  return false;
};

//react element for the password change window
var ChangePassWindow = function ChangePassWindow(props) {
  return React.createElement(
    "section",
    { id: "changePassBox", className: "bc3 tc4" },
    React.createElement(
      "h2",
      { className: "bc3 tc4" },
      "Change Password:"
    ),
    React.createElement(
      "form",
      { id: "changePassForm",
        name: "changePassForm",
        onSubmit: handleChangePass,
        action: "/changePass",
        method: "POST",
        className: "mainForm"
      },
      React.createElement("input", { id: "currPass", className: "bc0 tc4", type: "password", name: "currPass", placeholder: "Current Password..." }),
      React.createElement("input", { id: "newPass", className: "bc0 tc4", type: "password", name: "newPass", placeholder: "New Password..." }),
      React.createElement("input", { id: "newPass2", className: "bc0 tc4", type: "password", name: "newPass2", placeholder: "Confirm New Password..." }),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { className: "settingSubmit bc4 tc0", type: "submit", value: "Change Password" })
    )
  );
};

//react element for the color change window
var ChangeColorWindow = function ChangeColorWindow(props) {
  return React.createElement(
    "section",
    { id: "colorConfig", className: "bc3 tc4" },
    React.createElement(
      "h2",
      { className: "bc3 tc4" },
      "Change Theme:"
    ),
    React.createElement(
      "form",
      { id: "changeColorForm",
        name: "changeColorForm",
        onSubmit: handleChangeColor,
        action: "/colors",
        method: "POST",
        className: "mainForm"
      },
      React.createElement(
        "select",
        { id: "colorSelect", name: "colorList", form: "changeColorForm", className: "bc0 tc4" },
        React.createElement(
          "option",
          { className: "bc0 tc4", value: "1" },
          "Color Theme 1 (Light)"
        ),
        React.createElement(
          "option",
          { className: "bc0 tc4", value: "2" },
          "Color Theme 2 (Dark)"
        )
      ),
      React.createElement("br", null),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { className: "settingSubmit bc4 tc0", type: "submit", value: "Change Theme" })
    )
  );
};

//called at page load to setup the page
var setup = function setup(csrf) {

  //render the forms
  ReactDOM.render(React.createElement(ChangePassWindow, { csrf: csrf }), document.querySelector("#pWrapper"));
  ReactDOM.render(React.createElement(ChangeColorWindow, { csrf: csrf }), document.querySelector("#cWrapper"));

  //set the user colors
  setUserColors();
};

//gets an initial token at page load, then calls setup
var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

//fires when the page loads
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
