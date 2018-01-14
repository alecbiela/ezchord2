//handlers.js
//contains the app's event handlers

//run when the user clicks the button to start over
const handleStartOver = (e) => {
  $('#errorMessage').slideUp(350);
  $('#searchResponse').slideUp(800);
  $('#scrapeResponse').slideUp(800);
  $('#searchWrapper').slideDown(800);
};

//run when the user clicks the button to favorite a tab
const handleTabFavorite = (e) => {
  e.preventDefault();
  

  //get tab information, don't call if the song is already favorited
  //in the future, this could be replaced with error handling instead of "return false"
  let searchText = document.querySelector('.selectedResponse > .songArtist').textContent + ' - ' +
    document.querySelector('.selectedResponse > .songName').textContent;
  if( $('#favoritesWindow:contains("' + searchText + '")').length > 0 ) return false;

  //send AJAX to save the tab as favorite, afterward reload favorite tabs
  sendAjax('POST', '/saveTab', $('#favoriteForm').serialize(), function() {
    loadTabsFromServer();
	
	//disable favorite button
    document.getElementById("favoriteButton").disabled = true;
	$('#favoriteButton').attr('value','Favorited');	
  });
  
  
  return false;
};

//handles deleting of a favorited tab
const handleFavDelete = (e) => {
  e.preventDefault();
  
  //collect info
  const info = e.target.parentNode.lastChild.textContent;
  const token = $("#ctoken").val();
  
  //send AJAX to delete the tab from favorites, afterward reload favorite tabs
  sendAjax('POST', '/removeFavorite', { '_csrf': token, url: info }, function() {
    loadTabsFromServer();
	
	//re-enable favorites button if we're viewing the tab that we delete
	const currentSongInfo = e.target.parentNode.firstChild.textContent;
	const currentSongArr = currentSongInfo.split(' - ');
	const matchStr = '"' + currentSongArr[1] + '" by ' + currentSongArr[0];
	if($('#songInfo').text() === matchStr){
	  document.getElementById("favoriteButton").disabled = false;
	  $('#favoriteButton').attr('value','Favorite This Tab!');
	}
  });
  
  return false;
};

//retrieves a favorited tab when the user clicks it
const handleFavScrape = (e) => {
  e.preventDefault();
  
  //change cursor to spinning
  $('body').css("cursor", "progress");
  $('#errorMessage').slideUp(350);
  
  const info = e.target.parentNode.firstChild.textContent;
  const query = "scrape=" + encodeURIComponent( e.target.parentNode.lastChild.textContent );
  $('#searchWrapper').slideUp(800);
  $('#scrapeResponse').slideUp(800).promise().done(() => scrape(query, info));
  
  return false;
};

//scrapes a new (not favorited tab)
const handleTabScrape = (e) => {
  e.preventDefault();

    //change cursor to spinning
    $('body').css("cursor", "progress");
    
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
	  */
	  //check to see if the tab is already favorited, 
	  //disable button if yes
	  const tmp = tab.artist + ' - ' + tab.name;
	  if($("#favoritesWindow:contains('" + tmp + "')").length !== 0) {
        document.getElementById("favoriteButton").disabled = true;
		$('#favoriteButton').attr('value','Favorited');
	  } else {
		document.getElementById("favoriteButton").disabled = false;
		$('#favoriteButton').attr('value','Favorite This Tab!');
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
        
	//enable the "get tab" button
	document.getElementById("submitScrape").disabled = false;
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
    
	  //render the search response with props (above)
      ReactDOM.render(
        <TabList {...props} />, document.querySelector("#searchResponse")
      );
      
	  //do some animating
      $('#scrapeResponse').slideUp(800).promise().done( () => {
		  $('#searchWrapper').slideUp(800);
		  $('#searchResponse').slideDown(800);
		  $('body').css("cursor", "default");
	  });
      
    });
  });
  
  return false;
};