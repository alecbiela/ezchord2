//helper.js
//contains functionality used across views


//called for error handling, will display error message on page
const handleError = (message) => {
  $("#errorMessage").text(message);
  $("#errorMessage").slideDown(350);
};

//called to redirect page to another page
const redirect = (response) => {
  $("#errorMessage").slideUp(350);
  window.location = response.redirect;
};

//called to change the user's colors (at page load)
//will color every element with the class name 'colorable'
const setUserColors = () => {
  //get colors
  sendAjax('GET', '/colors', null, (data) => {
    
    //style all
    $('.colorable').css({
      'background-color': data.bgColor,
      'color': data.textColor,
    });
  });
};

//called to send an ajax request to the server
//takes type (GET, POST, etc.), action (URL), data to send, and callback for success
const sendAjax = (type, action, data, success) => { 
  $.ajax({
      cache: false,
      type: type,
      url: action,
      data: data,
      dataType: "json",
      success: success,
      error: function(xhr, status, error) {
        var messageObj = JSON.parse(xhr.responseText);
        handleError(messageObj.error);
      }
  });
};