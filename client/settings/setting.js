//setting.js
//contains front-end functionality for settings page

//handles changing passwords
const handleChangePass = (e) => {
  e.preventDefault();
  
  $("#errorMessage").slideUp(350);
  
  //check for empty input
  if($("#currPass").val() == '' || $("#newPass").val() == '' || $("#newPass").val() == '') {
    handleError("Error!  All fields are required.");
    return false;
  }
  
  //check for matching passwords
  if($("#newPass").val() !== $("#newPass2").val()) {
    handleError("Error!  New passwords do not match.");
    return false;
  }
  
  //check new pass match old pass
  if($('#currPass').val() === $('#newPass').val()) {
    handleError("Error!  New passwords cannot match old password.");
    return false;
  }
  
  //post new user data to server
  sendAjax('POST', $("#changePassForm").attr("action"), $("#changePassForm").serialize(), (xhr) => {
    //reset the form
    //https://stackoverflow.com/questions/6364289/clear-form-fields-with-jquery
    $('#changePassForm').find("input[type=password], textarea").val("");
    
    //let the user know PW change succeeded
    handleError("Password Changed Successfully");
    
  });
  
  return false;
};

//handles changing website colors
const handleChangeColor = (e)=> {
  e.preventDefault();

  $("#errorMessage").slideUp(350);
  
  //post new color data to the server
  sendAjax('POST', '/colors', $('#changeColorForm').serialize(), (xhr) => {
      
      //let the user know the color change succeeded
      
      //change colors
      setUserColors();
  });
  
  return false;
};

//react element for the password change window
const ChangePassWindow = (props) => {
  return (
  <section id="changePassBox" className="bc3 tc4">
    <h2 className="bc3 tc4">Change Password:</h2>
    <form id="changePassForm"
      name="changePassForm"
      onSubmit={handleChangePass}
      action="/changePass"
      method="POST"
      className="mainForm"
    >
      <input id="currPass" className="bc0 tc4" type="password" name="currPass" placeholder="Current Password..."/>
      <input id="newPass"  className="bc0 tc4" type="password" name="newPass" placeholder="New Password..."/>
      <input id="newPass2" className="bc0 tc4" type="password" name="newPass2" placeholder="Confirm New Password..."/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="settingSubmit bc4 tc0" type="submit" value="Change Password" />
    </form>
  </section>
  );
};

//react element for the color change window
const ChangeColorWindow = (props) => {
  return (
    <section id="colorConfig" className="bc3 tc4">
      <h2 className="bc3 tc4">Change Theme:</h2>
      <form id="changeColorForm"
        name="changeColorForm"
	    onSubmit={handleChangeColor}
        action="/colors"
        method="POST"
        className="mainForm"
      >
        <select id="colorSelect" name="colorList" form="changeColorForm" className="bc0 tc4">
	      <option className="bc0 tc4" value="1">Color Theme 1 (Light)</option>
		  <option className="bc0 tc4" value="2">Color Theme 2 (Dark)</option>
	    </select><br/>
        <input type="hidden" name="_csrf" value={props.csrf} />
        <input className="settingSubmit bc4 tc0" type="submit" value="Change Theme" />
      </form>
    </section>
  );
};
        
//called at page load to setup the page
const setup = function(csrf) {
  
  //render the forms
  ReactDOM.render(
    <ChangePassWindow csrf={csrf} />, document.querySelector("#pWrapper")
  );
  ReactDOM.render(
    <ChangeColorWindow csrf={csrf} />, document.querySelector("#cWrapper")
  );
  
  //set the user colors
  setUserColors();
};

//gets an initial token at page load, then calls setup
const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
      setup(result.csrfToken);
  });
};

//fires when the page loads
$(document).ready(function() {
  getToken();
});