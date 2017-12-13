//init.js
//holds app page init and setup code

//holds the current tab that the user has selected
let currentSelectionID = '';

//gets favorited tabs from server
const loadTabsFromServer = () => {
  sendAjax('GET', '/getTabs', null, (data) => {
    ReactDOM.render(
      <FavoritesList tabs={data.tabs} />, document.querySelector("#favoritesWindow")
    );
  });
};

//called at page load to setup the page
const setup = function(csrf) {
  $('#searchResponse').on('click', '.spanButton', changeSelectedResult);
  $('#searchResponse').on('click', '#submitScrape', handleTabScrape);
  $('#favoritesWindow').on('click', '.favoriteInfo', handleFavScrape);
  $('#favoritesWindow').on('click', '.deleteFavButton', handleFavDelete);
  
  //set user colors (in helper module)
  setUserColors();
  
  ReactDOM.render(
    <SearchForm csrf={csrf} />, document.querySelector("#searchWrapper")
  );
  
  ReactDOM.render(
    <FavoritesList tabs={[]} />, document.querySelector("#favoritesWindow")
  );
  
  loadTabsFromServer();
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
    