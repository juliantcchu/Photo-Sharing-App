var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/


function fetchModel(url) {
  return new Promise(function(resolve, reject) {  
      setTimeout(2000, () => reject({status: 501, statusText: "Not Implemented"}),0);

      // On Success return:
      // resolve({data: getResponseObject});
      let xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          resolve({data: this.responseText});
        }
      };
      xhttp.open("GET", url, true);
      xhttp.send();
    });
}

export default fetchModel;
