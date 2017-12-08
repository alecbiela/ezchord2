"use strict";

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
  });

  return false;
};

var ChangePassWindow = function ChangePassWindow(props) {
  return React.createElement(
    "section",
    { id: "changePassBox" },
    React.createElement(
      "h1",
      { className: "loginBoxHeader" },
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
      React.createElement("input", { id: "currPass", className: "user", type: "password", name: "currPass", placeholder: "Current Password..." }),
      React.createElement("input", { id: "newPass", className: "pass", type: "password", name: "newPass", placeholder: "New Password..." }),
      React.createElement("input", { id: "newPass2", className: "pass2", type: "password", name: "newPass2", placeholder: "Confirm New Password..." }),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { className: "formSubmit", type: "submit", value: "Change Password" })
    )
  );
};

//called at page load to setup the page
var setup = function setup(csrf) {

  ReactDOM.render(React.createElement(ChangePassWindow, { csrf: csrf }), document.querySelector("#content"));
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
