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

//run when the user clicks the button to favorite a tab
const handleTabFavorite = (e) => {
  e.preventDefault();
  

  //get tab information, don't call if the song is already favorited
  //in the future, this could be replaced with error handling instead of "return false"
  let searchText = document.querySelector('.selectedResponse > .songArtist').textContent + ' - ' +
    document.querySelector('.selectedResponse > .songName').textContent;
  if( $('#favoritesWindow:contains("' + searchText + '")').length > 0 ) return false;

  sendAjax('POST', '/saveTab', $('#favoriteForm').serialize(), function() {
    loadTabsFromServer();
  });
  
  return false;
};

//handles deleting of a favorited tab
const handleFavDelete = (e) => {
  e.preventDefault();
  
  const info = e.target.parentNode.lastChild.textContent;
  const token = $("#ctoken").val();
  console.log(token);
  
  sendAjax('POST', '/removeFavorite', { '_csrf': token, url: info }, function() {
    loadTabsFromServer();
  });
  
  return false;
};

//retrieves a favorited tab when the user clicks it
const handleFavScrape = (e) => {
  e.preventDefault();
  
  //change cursor to spinning
  $('body').css("cursor", "progress");
  
  const info = e.target.parentNode.firstChild.textContent;
  const query = "scrape=" + encodeURIComponent( e.target.parentNode.lastChild.textContent );
  $('#scrapeResponse').slideUp(800).promise().done(() => scrape(query, info));
  
  return false;
};

//scrapes a new (not favorited tab)
const handleTabScrape = (e) => {
  e.preventDefault();
    //let the user know we heard their button press
    //$('#status').html("Retrieving Tab...");
    
    //get user selection
    const data = currentSelectionID;
    
    //update tab header with song title and artist (above actual tab)
    const selectedTitle = document.querySelector('.selectedResponse > .songName').innerHTML;
    const selectedArtist = document.querySelector('.selectedResponse > .songArtist').innerHTML;
    //setSongInfo(selectedTitle, selectedArtist);
    
    const query = "scrape=" + encodeURIComponent( $('#' + data).find('.searchResultURL').html() );    
    const info = selectedArtist + ' - ' + selectedTitle;
    scrape(query, info);
    
    return false;    
};

//base scrape request called by both favorite and non-favorite scrape events
const scrape = (query, info) => {
  //set up query
  const action = '/scrapeTab';    
  const url = action + "?" + query;
  const infoArr = info.split(' - ');

  //send a request to get the tab, also a request to get a fresh token (for future requests)
  sendAjax('GET', url, null, (data) => {
      
    sendAjax('GET', '/getToken', null, (result) => {
      let surl = $('.selectedResponse > .searchResultURL').text();
      let tab = {
        name: infoArr[1],
        artist: infoArr[0],
        url: surl
      };
      let props = {
        tab: tab,
        csrf: result.csrfToken,
        tabContent: data.content
      };
        
      ReactDOM.render(
        <ScrapeResults {...props} />, document.querySelector("#scrapeResponse")
      );
            
      //attach class 'chord' to everything that Ultimate Guitar recognizes as a 'chord'
    /*$('#tabResults > span').each(() => {                
        $(this).addClass('chord');
      });
            
      //do some animating                
      $('#status').html("");*/
      $('#searchResponse').slideUp(800);
      $('#scrapeResponse').slideDown(800);
	  $('body').css("cursor", "default");
    });
  });
};
    
//changes the tab that is currently selected in the search results
const changeSelectedResult = (e) => {        
  //get the parent of the button (the <div> of the search result)
  const targ = e.target.parentNode;
    
  //add selected ID to this object (if it's not already selected)        
  if(targ.id !== currentSelectionID){

    //remove the old class if there is one
    if(currentSelectionID !== "") {
		$('#' + currentSelectionID).removeClass('selectedResponse');
	}
    //add styling for the 'selected' and set it to currently selected
    $('#' + targ.id).addClass('selectedResponse');
    currentSelectionID = targ.id;
        
    $('#searchFooter').fadeIn(800);
  }    
};

//searches for a guitar tab
const handleTabSearch = (e) => {
  e.preventDefault();
  
  //change cursor to spinning
  $('body').css("cursor", "progress");
  $('#errorMessage').slideUp(350);
  
  //get band and song
  const bName = $("#bName").val();
  const sName = $("#sName").val();
  if(bName == '' && sName == '') {
    handleError("*Please fill in at least one of the fields.");
    return false;
  }
  
  //send search request, also request for a fresh token
  const url = "?bName=" + encodeURIComponent(bName) + "&sName=" + encodeURIComponent(sName); 
  sendAjax('GET', $("#searchForm").attr("action") + url, null, (data) => {
    sendAjax('GET', '/getToken', null, (result) => {
      let props = {
        tabs: data.tabs,
        csrf: result.csrfToken,
      };
    
      ReactDOM.render(
        <TabList {...props} />, document.querySelector("#searchResponse")
      );
      
      $('#scrapeResponse').slideUp(800).promise().done( () => {
		  $('#searchResponse').slideDown(800);
		  $('body').css("cursor", "default");
	  });
      
    });
  });
  
  return false;
};

//a react element representing the initial search form
const SearchForm = (props) => {
  return (
        <section id="searchBox" className="colorable">    
            <p>Enter an artist, song, or both!</p>
            <form id="searchForm"
                  onSubmit={handleTabSearch}
                  name="searchForm"                  
                  action="/searchForTabs"
                  method="GET"
            >
                <label htmlFor="bName">Artist: </label>
                <input type="text" name="bName" id="bName" placeholder="Artist..." />
                <label htmlFor="sName">Song: </label>
                <input type="text" name="sName" id="sName" placeholder="Song..." />
                <input type="hidden" id="ctoken" name="_csrf" value={props.csrf} />
                <input type="submit" className="settingSubmit" value="Search!" id="submitButton" />
            </form>
        </section>
  );
};

//a react element representing the results of the "scrape" (the actual tab)
const ScrapeResults = (props) => {
    return (
      <div>
        <div id="tabResults" style={{ whiteSpace: 'pre-wrap'}}>{props.tabContent}</div>
        <div id="tabResultFooter">
            <form id="favoriteForm"
                  onSubmit={handleTabFavorite}
                  name="favoriteForm"
                  action="/saveTab"
                  method="POST"
            >
                  <input type="hidden" name="_csrf" value={props.csrf} />
                  <input type="hidden" name="name" value={props.tab.name} />
                  <input type="hidden" name="artist" value={props.tab.artist} />
                  <input type="hidden" name="url" value={props.tab.url} />
                  <input className="favoriteTabSubmit settingSubmit" type="submit" value="Favorite This Tab!" />
            </form>
        </div>
      </div>
    );
}

//a react element representing the list of the RESULTS OF THE TAB SEARCH
const TabList = (props) => {
  if(props.tabs.length === 0) {
    handleError('No Tabs Found!  Try again.');
	/*return (
      <div className="searchResponseTab">
        <h3>No Tabs Found!  Try changing search input</h3>
      </div>
    );*/
  }
  
  
  const tabResults = props.tabs.map(function(tab, index) {
    if(!((!tab.difficulty) && (!tab.rating))) {
      const diff = (tab.difficulty) ? tab.difficulty : 'unknown';
      const rat = (tab.rating) ? (tab.rating + ' stars') : 'unknown';
      const cID = 'searchResult' + index;    
      return (
      <div className="searchResponseTab colorable" id={cID} >
          <span className="spanButton"></span>
          <h3 className="songName colorable">{tab.name}</h3>
          <h3 className="songArtist colorable">{tab.artist}</h3>
          <p>Difficulty: {diff}</p>
          <p>Rating: {rat}</p>
          <span className="searchResultURL">{tab.url}</span>  
        </div>
      );
    }
  });
  
  return (
    <div id="rWrapper">
      <div id="response">
        {tabResults}
      </div>
      <div id="searchFooter">
        <button type="button" className="settingSubmit" id="submitScrape">Get This Tab!</button>
      </div>
    </div>
  );
  
};

//a react element representing the list of tabs the user has favorited
const FavoritesList = function(props) {
  if(props.tabs.length === 0) {
    return (
      <div className="favoritedTabs colorable">
        <h1>My Favorites:</h1>
        <h3 className="emptyFavorites">You have no favorited Tabs</h3>
      </div>
    );
  }
  
  const tabNodes = props.tabs.map(function(tab) {
    return (
      <div key={tab._id} className="favoriteTab">
        <h3 className="favoriteInfo">{tab.artist + ' - ' + tab.name}</h3>
		<span className="deleteFavButton colorable"> (-)</span>
        <span className="searchResultURL">{tab.url}</span>
      </div>
    );
  });
  
  return (
    <div className="favoritedTabs colorable">
      <h1>My Favorites:</h1>
      {tabNodes}
    </div>
  );
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
    