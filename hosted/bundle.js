'use strict';

//handlers.js
//contains the app's event handlers

//run when the user clicks the button to start over
var handleStartOver = function handleStartOver(e) {
  $('#errorMessage').slideUp(350);
  $('#searchResponse').slideUp(800);
  $('#scrapeResponse').slideUp(800);
  $('#searchWrapper').slideDown(800);
};

//run when the user clicks the button to favorite a tab
var handleTabFavorite = function handleTabFavorite(e) {
  e.preventDefault();

  //get tab information, don't call if the song is already favorited
  //in the future, this could be replaced with error handling instead of "return false"
  var searchText = document.querySelector('#songInfo').textContent;
  var parseStr = searchText.substring(1, searchText.length - 1).split('" by ');
  var matchStr = parseStr[1] + ' - ' + parseStr[0];
  if ($('#favoritesWindow:contains("' + matchStr + '")').length > 0) return false;

  //send AJAX to save the tab as favorite, afterward reload favorite tabs
  sendAjax('POST', '/saveTab', $('#favoriteForm').serialize(), function () {
    loadTabsFromServer();

    //disable favorite button
    document.getElementById("favoriteButton").disabled = true;
    $('#favoriteButton').attr('value', 'Favorited');
  });

  return false;
};

//handles deleting of a favorited tab
var handleFavDelete = function handleFavDelete(e) {
  e.preventDefault();

  //collect info
  var info = e.target.parentNode.lastChild.textContent;
  var token = $("#ctoken").val();

  //send AJAX to delete the tab from favorites, afterward reload favorite tabs
  sendAjax('POST', '/removeFavorite', { '_csrf': token, url: info }, function () {
    loadTabsFromServer();

    //re-enable favorites button if we're viewing the tab that we delete
    var currentSongInfo = e.target.parentNode.firstChild.textContent;
    var currentSongArr = currentSongInfo.split(' - ');
    var matchStr = '"' + currentSongArr[1] + '" by ' + currentSongArr[0];
    if ($('#songInfo').text() === matchStr) {
      document.getElementById("favoriteButton").disabled = false;
      $('#favoriteButton').attr('value', 'Favorite This Tab!');
    }
  });

  return false;
};

//retrieves a favorited tab when the user clicks it
var handleFavScrape = function handleFavScrape(e) {
  e.preventDefault();

  //change cursor to spinning
  $('body').css("cursor", "progress");
  $('#errorMessage').slideUp(350);

  var info = e.target.parentNode.firstChild.textContent;
  console.dir(info);
  var target = e.target.parentNode.lastChild.textContent;
  $('#searchWrapper').slideUp(800);
  $('#scrapeResponse').slideUp(800).promise().done(function () {
    return scrape(target, info);
  });

  return false;
};

//scrapes a new (not favorited tab)
var handleTabScrape = function handleTabScrape(e) {
  e.preventDefault();

  //change cursor to spinning
  $('body').css("cursor", "progress");

  //get user selection
  var data = currentSelectionID;

  //update tab header with song title and artist (above actual tab)
  var selectedTitle = document.querySelector('.selectedResponse > .songName').innerHTML;
  var selectedArtist = document.querySelector('.selectedResponse > .songArtist').innerHTML;
  //setSongInfo(selectedTitle, selectedArtist);

  var target = $('#' + data).find('.searchResultURL').html();
  var info = selectedArtist + ' - ' + selectedTitle;
  scrape(target, info);

  return false;
};

//base scrape request called by both favorite and non-favorite scrape events
var scrape = function scrape(target, info) {
  //set up query
  var action = '/scrapeTab';
  var query = "scrape=" + encodeURIComponent(target);
  var url = action + "?" + query;
  var infoArr = info.split(' - ');
  console.dir(infoArr);

  //send a request to get the tab, also a request to get a fresh token (for future requests)
  sendAjax('GET', url, null, function (data) {

    sendAjax('GET', '/getToken', null, function (result) {
      var surl = target;
      var tab = {
        name: infoArr[1],
        artist: infoArr[0],
        url: surl
      };
      var props = {
        tab: tab,
        csrf: result.csrfToken,
        tabContent: data.content
      };

      console.dir(tab);

      ReactDOM.render(React.createElement(ScrapeResults, props), document.querySelector("#scrapeResponse"));

      //set user colors again
      setUserColors();

      //attach class 'chord' to everything that Ultimate Guitar recognizes as a 'chord'
      /*$('#tabResults > span').each(() => {                
          $(this).addClass('chord');
        });
      */
      //check to see if the tab is already favorited, 
      //disable button if yes
      var tmp = tab.artist + ' - ' + tab.name;
      if ($("#favoritesWindow:contains('" + tmp + "')").length !== 0) {
        document.getElementById("favoriteButton").disabled = true;
        $('#favoriteButton').attr('value', 'Favorited');
      } else {
        document.getElementById("favoriteButton").disabled = false;
        $('#favoriteButton').attr('value', 'Favorite This Tab!');
      }

      //do some animating                
      //$('#status').html("");
      $('#searchResponse').slideUp(800);
      $('#scrapeResponse').slideDown(800);
      $('body').css("cursor", "default");
    });
  });
};

//changes the tab that is currently selected in the search results
var changeSelectedResult = function changeSelectedResult(e) {
  //get the parent of the button (the <div> of the search result)
  var targ = e.target.parentNode;

  //add selected ID to this object (if it's not already selected)        
  if (targ.id !== currentSelectionID) {

    //remove the old class if there is one
    if (currentSelectionID !== "") {
      $('#' + currentSelectionID).removeClass('selectedResponse');
    }
    //add styling for the 'selected' and set it to currently selected
    $('#' + targ.id).addClass('selectedResponse');
    currentSelectionID = targ.id;

    //enable the "get tab" button
    document.getElementById("submitScrape").disabled = false;
  }
};

//searches for a guitar tab
var handleTabSearch = function handleTabSearch(e) {
  e.preventDefault();

  //change cursor to spinning
  $('body').css("cursor", "progress");
  $('#errorMessage').slideUp(350);

  //get band and song
  var bName = $("#bName").val();
  var sName = $("#sName").val();
  if (bName == '' && sName == '') {
    handleError("*Please fill in at least one of the fields.");
    return false;
  }

  //send search request, also request for a fresh token
  var url = "?bName=" + encodeURIComponent(bName) + "&sName=" + encodeURIComponent(sName);
  sendAjax('GET', $("#searchForm").attr("action") + url, null, function (data) {
    sendAjax('GET', '/getToken', null, function (result) {
      var props = {
        tabs: data.tabs,
        csrf: result.csrfToken
      };

      //render the search response with props (above)
      ReactDOM.render(React.createElement(TabList, props), document.querySelector("#searchResponse"));

      //update colors (since this content was not loaded when they were initially set)
      setUserColors();

      //do some animating
      $('#scrapeResponse').slideUp(800).promise().done(function () {
        $('#searchWrapper').slideUp(800);
        $('#searchResponse').slideDown(800);
        $('body').css("cursor", "default");
      });
    });
  });

  return false;
};
'use strict';

//init.js
//holds app page init and setup code

//holds the current tab that the user has selected
var currentSelectionID = '';

//gets favorited tabs from server
var loadTabsFromServer = function loadTabsFromServer() {
  sendAjax('GET', '/getTabs', null, function (data) {
    ReactDOM.render(React.createElement(FavoritesList, { tabs: data.tabs }), document.querySelector("#favoritesWindow"));
  });
};

//called at page load to setup the page
var setup = function setup(csrf) {
  $('#searchResponse').on('click', '.spanButton', changeSelectedResult);
  $('#searchResponse').on('click', '#submitScrape', handleTabScrape);
  $('#favoritesWindow').on('click', '.favoriteInfo', handleFavScrape);
  $('#favoritesWindow').on('click', '.deleteFavButton', handleFavDelete);
  $('#scrapeResponse').on('click', '#startOver', handleStartOver);
  $('#searchResponse').on('click', '#startOver', handleStartOver);

  ReactDOM.render(React.createElement(SearchForm, { csrf: csrf }), document.querySelector("#searchWrapper"));

  ReactDOM.render(React.createElement(FavoritesList, { tabs: [] }), document.querySelector("#favoritesWindow"));

  loadTabsFromServer();

  //set user colors (in helper module)
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

//views.js
//holds the react DOM elements that the app will render at various times

//a list of the tabs the user has favorited
var FavoritesList = function FavoritesList(props) {
  if (props.tabs.length === 0) {
    return React.createElement(
      "div",
      { className: "favoritedTabs tc4 bc3" },
      React.createElement(
        "h3",
        { className: "emptyFavorites tc4" },
        "You have no favorited Tabs"
      )
    );
  }

  var tabNodes = props.tabs.map(function (tab) {
    return React.createElement(
      "div",
      { key: tab._id, className: "favoriteTab bc3" },
      React.createElement(
        "h3",
        { className: "favoriteInfo tc4" },
        tab.artist + ' - ' + tab.name
      ),
      React.createElement(
        "span",
        { className: "deleteFavButton tc4" },
        "(x)"
      ),
      React.createElement(
        "span",
        { className: "searchResultURL" },
        tab.url
      )
    );
  });

  return React.createElement(
    "div",
    { className: "favoritedTabs bc3" },
    tabNodes
  );
};

//a react element representing the list of the RESULTS OF THE TAB SEARCH
var TabList = function TabList(props) {
  if (props.tabs.length === 0) {
    handleError('No Tabs Found!  Try again.');
  }

  //creates 1 block for each tab result, mapped to an array
  var tabResults = props.tabs.map(function (tab, index) {
    if (!(!tab.difficulty && !tab.rating)) {
      var diff = tab.difficulty ? tab.difficulty : 'unknown';
      var rat = tab.rating ? tab.rating + ' stars' : 'unknown';
      var cID = 'searchResult' + index;
      return React.createElement(
        "div",
        { className: "searchResponseTab bc0", id: cID },
        React.createElement("span", { className: "spanButton" }),
        React.createElement(
          "h3",
          { className: "songName tc4" },
          tab.name
        ),
        React.createElement(
          "h3",
          { className: "songArtist tc4" },
          tab.artist
        ),
        React.createElement(
          "p",
          { className: "tc4" },
          "Difficulty: ",
          diff
        ),
        React.createElement(
          "p",
          { className: "tc4" },
          "Rating: ",
          rat
        ),
        React.createElement(
          "span",
          { className: "searchResultURL" },
          tab.url
        )
      );
    }
  });

  return React.createElement(
    "div",
    { id: "rWrapper", className: "bc3" },
    React.createElement(
      "div",
      { id: "searchHeader" },
      React.createElement(
        "button",
        { type: "button", className: "settingSubmit bc4 tc0", id: "submitScrape", disabled: true },
        "Get This Tab!"
      ),
      React.createElement(
        "button",
        { id: "startOver", type: "button", className: "settingSubmit bc4 tc0" },
        "Start Over"
      )
    ),
    React.createElement("br", null),
    React.createElement("br", null),
    React.createElement(
      "div",
      { id: "response", className: "bc3" },
      tabResults
    )
  );
};

//a react element representing the results of the "scrape" (the actual tab)
var ScrapeResults = function ScrapeResults(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      { id: "tabResultHeader", className: "bc3 tc4" },
      React.createElement(
        "p",
        { id: "songInfo" },
        "\"",
        props.tab.name,
        "\" by ",
        props.tab.artist
      ),
      React.createElement(
        "form",
        { id: "favoriteForm",
          onSubmit: handleTabFavorite,
          name: "favoriteForm",
          action: "/saveTab",
          method: "POST"
        },
        React.createElement("input", { id: "favoriteButton", className: "favoriteTabSubmit settingSubmit bc4 tc0", type: "submit", value: "Favorite This Tab!" }),
        React.createElement(
          "button",
          { id: "startOver", type: "button", className: "settingSubmit bc4 tc0" },
          "Start Over"
        ),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { type: "hidden", name: "name", value: props.tab.name }),
        React.createElement("input", { type: "hidden", name: "artist", value: props.tab.artist }),
        React.createElement("input", { type: "hidden", name: "url", value: props.tab.url })
      )
    ),
    React.createElement(
      "div",
      { id: "tabResults", className: "tc4 bc1", style: { whiteSpace: 'pre-wrap' } },
      React.createElement("br", null),
      React.createElement("br", null),
      props.tabContent
    )
  );
};

//a react element representing the initial search form
var SearchForm = function SearchForm(props) {
  return React.createElement(
    "section",
    { id: "searchBox", className: "bc3" },
    React.createElement(
      "p",
      { className: "centered tc4" },
      "Enter an artist, song, or both!"
    ),
    React.createElement(
      "form",
      { id: "searchForm",
        onSubmit: handleTabSearch,
        name: "searchForm",
        action: "/searchForTabs",
        method: "GET"
      },
      React.createElement("input", { type: "text", name: "bName", id: "bName", className: "bc0 tc4", placeholder: "Artist Name..." }),
      React.createElement("br", null),
      React.createElement("input", { type: "text", name: "sName", id: "sName", className: "bc0 tc4", placeholder: "Song Name..." }),
      React.createElement("input", { type: "hidden", id: "ctoken", name: "_csrf", value: props.csrf }),
      React.createElement("input", { type: "submit", id: "searchSubmit", className: "bc4 tc0", value: "Search!" })
    )
  );
};
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
