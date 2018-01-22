//client.js
//handles logging in and signing up

//called when the user clicks the 'Log In' button at /login
const handleLogin = (e) => {
  e.preventDefault();
  
  $("#errorMessage").slideUp(350);
  
  if($("#lUser").val() == '' || $("#lPass").val() == '') {
    handleError("Error!  Username or password field is empty.");
    return false;
  }
  
  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);
  
  return false;
};

//called when the user clicks the 'Sign Up' button at /login
const handleSignup = (e) => {
  e.preventDefault();
  
  $("#errorMessage").slideUp(350);
  
  //check for empty input
  if($("#sUser").val() == '' || $("#sPass").val() == '' || $("#sPass2").val() == '') {
    handleError("Error!  All fields are required.");
    return false;
  }
  
  //check for matching passwords
  if($("#sPass").val() !== $("#sPass2").val()) {
    handleError("Error!  Passwords do not match.");
    return false;
  }
  
  //post new user data to server
  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);
  
  return false;
};

//React element for login screen (includes login/sign up boxes)
const LoginContentWindow = (props) => {
  return (
    <section id="loginPageBody">
      <section id="signupBox" className="bc3">
        <h1 className="loginBoxHeader tc4">Create A Free Account:</h1>
        <form id="signupForm"
          name="signupForm"
          onSubmit={handleSignup}
          action="/signup"
          method="POST"
          className="mainForm"
        >
          <input id="sUser" className="user bc0 tc4" type="text" name="username" placeholder="Username..."/>
          <input id="sPass" className="pass bc0 tc4" type="password" name="pass" placeholder="Password..."/>
          <input id="sPass2"className="pass2 bc0 tc4" type="password" name="pass2" placeholder="Confirm Password..."/>
          <input type="hidden" name="_csrf" value={props.csrf}/>
          <input className="formSubmit bc4 tc0" type="submit" value="Sign Up" />
        </form>
      </section>
      
      <section id="loginBox" className="bc3">
        <h1 className="loginBoxHeader tc4">Returning Users:</h1>      
        <form id="loginForm" name="loginForm"
          onSubmit={handleLogin}
          action="/login"
          method="POST"
          className="mainForm"
        >
          <input id="lUser" className="user bc0 tc4" type="text" name="username" placeholder="Username..."/>
          <input id="lPass" className="pass bc0 tc4" type="password" name="pass" placeholder="Password..."/>
          <input type="hidden" name="_csrf" value={props.csrf}/>
          <input className="formSubmit bc4 tc0" type="submit" value="Sign in" />
        </form>
      </section>
    </section>
  );
};

//called to create the content window (at setup)
const createLoginContentWindow = (csrf) => {
  ReactDOM.render(
    <LoginContentWindow csrf={csrf} />,
    document.querySelector("#content")
    );
};

//called at page load to initialize the screen
const setup = (csrf) => {
  const loginButton = document.querySelector("#loginButton");
  
  loginButton.addEventListener("click", (e) => {
    e.PreventDefault();
    createLoginContentWindow(csrf);
    return false;
  });
  
  createLoginContentWindow(csrf);
};

//called to get the initial token
const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

//called at page load
$(document).ready(function() {
  getToken();
});
