//views.js
//holds the react DOM elements that the app will render at various times

//a list of the tabs the user has favorited
const FavoritesList = function(props) {
  if(props.tabs.length === 0) {
    return (
      <div className="favoritedTabs colorable">
        <h3 className="emptyFavorites">You have no favorited Tabs</h3>
      </div>
    );
  }
  
  const tabNodes = props.tabs.map(function(tab) {
    return (
      <div key={tab._id} className="favoriteTab">
        <h3 className="favoriteInfo">{tab.artist + ' - ' + tab.name}</h3>
		<span className="deleteFavButton colorable">  (x)</span>
        <span className="searchResultURL">{tab.url}</span>
      </div>
    );
  });
  
  return (
    <div className="favoritedTabs colorable">
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
      <div id="searchHeader">
        <button type="button" className="settingSubmit" id="submitScrape" disabled>Get This Tab!</button>
	    <button id="startOver" type="button" className="settingSubmit">Start Over</button>
      </div><br/><br/>
      <div id="response">
        {tabResults}
      </div>
    </div>
  );
  
};

//a react element representing the results of the "scrape" (the actual tab)
const ScrapeResults = (props) => {
    return (
      <div>
        <div id="tabResultHeader">  
		  <p id="songInfo">&quot;{props.tab.name}&quot; by {props.tab.artist}</p>
		  <form id="favoriteForm"
            onSubmit={handleTabFavorite}
            name="favoriteForm"
            action="/saveTab"
            method="POST"
          >
            <input id="favoriteButton" className="favoriteTabSubmit settingSubmit" type="submit" value="Favorite This Tab!" />
		    <button id="startOver" type="button" className="settingSubmit">Start Over</button>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input type="hidden" name="name" value={props.tab.name} />
            <input type="hidden" name="artist" value={props.tab.artist} />
            <input type="hidden" name="url" value={props.tab.url} />
          </form>
        </div>
		<div id="tabResults" style={{ whiteSpace: 'pre-wrap'}}><br/><br/>{props.tabContent}</div>
      </div>
    );
};

//a react element representing the initial search form
const SearchForm = (props) => {
  return (
        <section id="searchBox" className="colorable">    
            <p className="centered">Enter an artist, song, or both!</p>
            <form id="searchForm"
                  onSubmit={handleTabSearch}
                  name="searchForm"                  
                  action="/searchForTabs"
                  method="GET"
            >
                <input type="text" name="bName" id="bName" placeholder="Artist Name..." /><br/>
                <input type="text" name="sName" id="sName" placeholder="Song Name..." />
                <input type="hidden" id="ctoken" name="_csrf" value={props.csrf} />
                <input type="submit" id="searchSubmit" value="Search!" />
            </form>
        </section>
  );
};
