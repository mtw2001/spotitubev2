    /*
    fetch('https://accounts.spotify.com/authorize', {
        method: 'GET',
        headers: {
            'client_id': client_id,
            "response_type": "code",
            "redirect_uri": "https://127.0.0.1:5500/index.html",
            "scope": "user-read-currently-playing",
            "show_dialog": "true"
        }
    }
    )
    .then((response) => response.json())
    .then((data) => console.log(data));
    console.log("Ran");
    */

const client_id="a92d9285d08c4251a961f131f4d5a7e3";
const client_secret="5b940d3589bb4ac0adbc0e8659956119";
const youtubeKey = "AIzaSyAcf-MRptiKfEZOGVdwN_BkhQUM90vp63I";
const baseurl="https://api.spotify.com/v1/";

var redirect_uri = "https://mtw2001.github.io/projects/fp1/spotitubev2/index.html";

var access_token = null;
var refresh_token = null;

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";



function onPageLoad(){
    if (window.location.search.length > 0) {
        // user just logged in, need to fetch access token
        handleRedirect();
    } else if (access_token != null) {
        // user is logged in
        playVideo();
    } else {
        // user must log in
    }
}

function requestAuthorization(){
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-currently-playing";
    window.location.href = url; // Show Spotify's authorization screen
}

function handleRedirect() {
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri);
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}


function playVideo() {
    fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        method: 'GET',
        headers: {
            "Authorization": "Bearer "  + access_token
        }
    })
    .then((response) => response.json())
    .then((data) => console.log(data['item']['name'] + " by " + data['item']['artists'][0]['name']));
}
