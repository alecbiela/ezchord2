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

//called to change the user's colors
//will set colors according to the color theme it gets back
const setUserColors = () => {
  //get colors
  sendAjax('GET', '/colors', null, (data) => {
    
    //style all
    $('.bc0').css({
      'background-color': data.colors[0],
    });
    $('.bc1').css({
      'background-color': data.colors[1],
    });
    $('.bc2').css({
      'background-color': data.colors[2],
    });
    $('.bc3').css({
      'background-color': data.colors[3],
    });
    $('.bc4').css({
      'background-color': data.colors[4],
    });
    $('.tc0').css({
      'color': data.colors[0],
	  'border-color': data.colors[0],
    });
    $('.tc1').css({
      'color': data.colors[1],
	  'border-color': data.colors[1],
    });
    $('.tc2').css({
      'color': data.colors[2],
	  'border-color': data.colors[2],
    });
    $('.tc3').css({
      'color': data.colors[3],
	  'border-color': data.colors[3],
    });
    $('.tc4').css({
      'color': data.colors[4],
	  'border-color': data.colors[4],
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