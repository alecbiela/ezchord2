//views.js
//holds the react DOM elements that the app will render at various times

//a list of the tabs the user has favorited
const FavoritesList = function(props) {
  if(props.tabs.length === 0) {
    return (
      <div className="favoritedTabs tc4 bc3">
        <h3 className="emptyFavorites tc4">You have no favorited Tabs</h3>
      </div>
    );
  }
  
  const tabNodes = props.tabs.map(function(tab) {
    return (
      <div key={tab._id} className="favoriteTab bc3">
        <h3 className="favoriteInfo tc4">{tab.artist + ' - ' + tab.name}</h3>
		<span className="deleteFavButton tc4">(x)</span>
        <span className="searchResultURL">{tab.url}</span>
      </div>
    );
  });
  
  return (
    <div className="favoritedTabs bc3">
      {tabNodes}
    </div>
  );
};

//a react element representing the list of the RESULTS OF THE TAB SEARCH
const TabList = (props) => {
  if(props.tabs.length === 0) {
    handleError('No Tabs Found!  Try again.');
  }
  
  //creates 1 block for each tab result, mapped to an array
  const tabResults = props.tabs.map(function(tab, index) {
    if(!((!tab.difficulty) && (!tab.rating))) {
      const diff = (tab.difficulty) ? tab.difficulty : 'unknown';
      const rat = (tab.rating) ? (tab.rating + ' stars') : 'unknown';
      const cID = 'searchResult' + index;    
      return (
      <div className="searchResponseTab bc0" id={cID} >
          <span className="spanButton"></span>
          <h3 className="songName tc4">{tab.name}</h3>
          <h3 className="songArtist tc4">{tab.artist}</h3>
          <p className="tc4">Difficulty: {diff}</p>
          <p className="tc4">Rating: {rat}</p>
          <span className="searchResultURL">{tab.url}</span>  
        </div>
      );
    }
  });
  
  return (
    <div id="rWrapper" className="bc3">
      <div id="searchHeader">
        <button type="button" className="settingSubmit bc4 tc0" id="submitScrape" disabled>Get This Tab!</button>
	    <button id="startOver" type="button" className="settingSubmit bc4 tc0">Start Over</button>
      </div><br/><br/>
      <div id="response" className="bc3">
        {tabResults}
      </div>
    </div>
  );
  
};

//a react element representing the results of the "scrape" (the actual tab)
const ScrapeResults = (props) => {
    return (
      <div>
        <div id="tabResultHeader" className="bc3 tc4">  
		  <p id="songInfo">&quot;{props.tab.name}&quot; by {props.tab.artist}</p>
		  <form id="favoriteForm"
            onSubmit={handleTabFavorite}
            name="favoriteForm"
            action="/saveTab"
            method="POST"
          >
            <input id="favoriteButton" className="favoriteTabSubmit settingSubmit bc4 tc0" type="submit" value="Favorite This Tab!" />
		    <button id="startOver" type="button" className="settingSubmit bc4 tc0">Start Over</button>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input type="hidden" name="name" value={props.tab.name} />
            <input type="hidden" name="artist" value={props.tab.artist} />
            <input type="hidden" name="url" value={props.tab.url} />
          </form>
        </div>
		<div id="tabResults" className="tc4 bc1" style={{ whiteSpace: 'pre-wrap'}}><br/><br/>{props.tabContent}</div>
      </div>
    );
};

//a react element representing the initial search form
const SearchForm = (props) => {
  return (
        <section id="searchBox" className="bc3">    
            <p className="centered tc4">Enter an artist, song, or both!</p>
            <form id="searchForm"
                  onSubmit={handleTabSearch}
                  name="searchForm"                  
                  action="/searchForTabs"
                  method="GET"
            >
                <input type="text" name="bName" id="bName" className="bc0 tc4" placeholder="Artist Name..." /><br/>
                <input type="text" name="sName" id="sName" className="bc0 tc4" placeholder="Song Name..." />
                <input type="hidden" id="ctoken" name="_csrf" value={props.csrf} />
                <input type="submit" id="searchSubmit" className="bc4 tc0" value="Search!" />
            </form>
        </section>
  );
};
