let embed = true;
let custom = false;
let customMessage = false;
let host = "http://imh-host.rax_racks.repl.co";

function loadPage(path) {
  window.history.pushState(path, path, path);
  let t = path.split("/").join("");
  document.title = "IMH · " + t[0].toUpperCase() + t.slice(1).toLowerCase();
  if (localStorage[path]) {
    checkCache(path);
    document.body.innerHTML = localStorage[path];
    if(document.getElementsByTagName("spa").length !== 0) {
      if(document.getElementsByTagName("spa").item(0).onload !== null) document.getElementsByTagName("spa").item(0).onload();
      return;
    }
  }

  fixedFetch(path + "SPA").then(function(response) {
    response.text().then((text) => {
      localStorage.setItem(path, text);
      localStorage.setItem(path + "-loaded", new Date().toJSON())
      document.body.innerHTML = text;
      if(document.getElementsByTagName("spa").item(0).onload !== null) document.getElementsByTagName("spa").item(0).onload();
      return;
    });
  });
}

function checkCache(path) {
  fixedFetch("/check-ver" + path + "SPA/" + localStorage[path + "-loaded"]).then(function(response) {
    response.text().then((text) => {
      console.log(text);
      if(text == 'true') {
        localStorage.removeItem(path);
        localStorage.removeItem(path + "-loaded");
      }
    });
  });
}

function fixedFetch(url) {
  if(fetch !== null) {
    return fetch(url);
  } 
  
  return new Promise(function(resolve) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        xhttp.text = function() {
          return new Promise(function(resolve) {
            resolve(xhttp.responseText);
          });
        }
        resolve(xhttp);
      }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
  });
}

function saveConfig() {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  var blob = new Blob([document.getElementsByClassName("json").item(0).innerText])
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = "IMH-config.sxcu";
  a.click();
  window.URL.revokeObjectURL(url);
};

function loadConfig() {
  document.getElementById("URL").innerText = '"https://' + document.location.host + '/$json:data.link$"';
  document.getElementById("requestURL").innerText = '"' + encodeURI(host + '/upload?embed=' + embed) + '"';
  if(custom) {
    document.getElementById("requestURL").innerText = '"' + encodeURI(host + '/upload?embed=' + embed + '&customURL=' + document.getElementById("customURLText").value) + '"';
    document.getElementById("URL").innerText = '"$json:data.link$"';
    document.getElementById("customURLText").classList.remove("hidden");
  } else {
    document.getElementById("requestURL").innerText = '"' + encodeURI(host + '/upload?embed=' + embed) + '"';
    document.getElementById("URL").innerText = '"https://' + document.location.host + '/$json:data.link$"';
    document.getElementById("customURLText").classList.add("hidden");
  }
  
  if(embed) {
    document.getElementById("customMessageDiv").classList.remove("hidden");
  } else {
    document.getElementById("customMessageDiv").classList.add("hidden");
  }
  
  if(customMessage && embed) {
    if(custom) {
      document.getElementById("requestURL").innerText = '"' + encodeURI(host + '/upload?embed=' + embed + '&customURL=' + document.getElementById("customURLText").value + '&message=' + document.getElementById("customMessageText").value) + '"';
    } else {
      document.getElementById("requestURL").innerText = '"' + encodeURI(host + '/upload?embed=' + embed + '&message=' + document.getElementById("customMessageText").value) + '"';
    }

    document.getElementById("customMessageText").classList.remove("hidden");
  } else {
    document.getElementById("customMessageText").classList.add("hidden");
  }
};

function toggleEmbed() {
  embed = document.getElementById("embed").checked;
  loadConfig();
};

function toggleCustom() {
  custom = document.getElementById("custom").checked;
  loadConfig();
};

function toggleCustomMessage() {
  customMessage = document.getElementById("customMessage").checked;
  loadConfig();
};

function getStats() {
  if(localStorage["cachedStats"]) {
    document.getElementById("stats").innerText = localStorage["cachedStats"];
  }
  
  fixedFetch("https://imh-host.glitch.me/stats/uploads").then(function(uploadResponse) {
    uploadResponse.text().then((uploads) => {
      fixedFetch("https://imh-host.glitch.me/stats/size").then(function(sizeResponse) {
        sizeResponse.text().then((size) => {
          let kb = size / 1000;
          let mb = kb / 1000;
          let gb = mb / 1000;
          let tb = gb / 1000;
          let unit = "TB";
          let number = gb;
          
          if(tb.toString().startsWith("0")) { unit = "GB"; number = gb; }
          if(gb.toString().startsWith("0")) { unit = "MB"; number = mb; }
          if(mb.toString().startsWith("0")) { unit = "KB"; number = kb; }
          if(kb.toString().startsWith("0")) { unit = "B"; number = size; }
          
          uploads = uploads.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
          let statsString = "UPLOADS: " + uploads + " | TOTAL SIZE: " + Math.round((number + Number.EPSILON) * 100) / 100 + " " + unit; 
          localStorage.setItem("cachedStats", statsString);
          
          document.getElementById("stats").innerText = statsString;
        });
      });
    });
  });
};

function loadStats() {
  getStats();
  
  setInterval(() => {
    getStats();
  }, 10000);
};