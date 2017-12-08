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
    $('#changePassForm').find("input[type=password], textarea").val("")
    
    //let the user know PW change succeeded
    
  });
  
  return false;
};

const ChangePassWindow = (props) => {
  return (
  <section id="changePassBox">
    <h1 className="loginBoxHeader">Change Password:</h1>
    <form id="changePassForm"
      name="changePassForm"
      onSubmit={handleChangePass}
      action="/changePass"
      method="POST"
      className="mainForm"
    >
      <input id="currPass" className="user" type="password" name="currPass" placeholder="Current Password..."/>
      <input id="newPass"  className="pass" type="password" name="newPass" placeholder="New Password..."/>
      <input id="newPass2" className="pass2" type="password" name="newPass2" placeholder="Confirm New Password..."/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="formSubmit" type="submit" value="Change Password" />
    </form>
  </section>
  );
};

//called at page load to setup the page
const setup = function(csrf) {
  
  ReactDOM.render(
    <ChangePassWindow csrf={csrf} />, document.querySelector("#content")
  );
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