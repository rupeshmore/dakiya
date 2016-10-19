/*
THIS SOFTWARE IS PROVIDED BY Rupesh More ``AS IS'' AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL Rupesh More OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
SUCH DAMAGE.
*/

//TODO
// Other auth support
// convert test scripts to validations.
// add mocha tests

let scriptObject, envCollection, collection, fileName, dakiyaItems, tool, collectionName, artilleryTarget;

window.onload = function() {
  let postmanEnvCollection = document.querySelector('#add-postman-env');
  let collectionInput = document.querySelector('#add-collection');
  let buttonClassAttr = "btn btn-primary orange darken-2 black-text lighten-1 col s8 waves-effect";
  let fileDisplayHeader = document.querySelector('#fileDisplayHeader');
  let fileDisplayArea = document.querySelector('#fileDisplayArea');

  postmanEnvCollection.addEventListener('change', function(e) {
    let file = postmanEnvCollection.files[0];
    let reader = new FileReader();
    envCollection = null;
    reader.onload = function(e) {
      if (collection) {
        $('#toolSelection').val("");
        $('#toolSelection').material_select();
        //remove downlaod button
        $('#downloadFile').remove();
        $('#dakiyaGeneratedScript').hide();
        $('#dakiyaHeader').show();
      }

      envCollection = JSON.parse(reader.result).values;
      if (collection) {
        filterPostmanJson();
      }
    }
    reader.readAsText(file);
  });

  collectionInput.addEventListener('change', function(e) {
    //default the status
    $('#dakiyaGeneratedScript').hide();
    $('#dakiyaHeader').show();

    //remove downlaod button
    $('#downloadFile').remove();

    //default tool selection.
    fileName = collectionInput.files[0].name.replace('.json', '');
    let file = collectionInput.files[0];
    let reader = new FileReader();
    reader.onload = function(e) {
      dakiyaItems = [];
      artilleryTarget = null;
      $('#toolSelection').val("");
      $('#toolSelection').material_select();

      collection = reader.result;
      filterPostmanJson();
    }
    reader.readAsText(file);
  });
}


function filterPostmanJson() {
  //if(typeof collection !== 'object' ) collection = JSON.parse(collection);
  if(collection.constructor !== Object ) collection = JSON.parse(collection);
  if (collection.info && collection.info.name) {
    collectionName = collection.info.name;
  }

  //check json is postman schema v2 and above compliant.
  if (collection.item) {
    let item = processPostmanItem(collection.item);
  } else {
    $('#modal3').openModal();
  }

}


function processPostmanItem(item) {
  item.forEach(function (data) {
    let items = filterPostmanItems(data);
    if (items) dakiyaItems.push(items);
  });
}


function convertPostman(selection){
  if(collection){
    tool = selection;

    if (tool === 'artillery') {
      artillery(dakiyaItems);
    }
    if (tool === 'gatling') {
      //gatling(dakiyaItems);
      $('#modal1').openModal();
    }
    if (tool === 'loadrunner') {
      //loadrunner(dakiyaItems);
      $('#modal1').openModal();
    }

    htmlDisplay();

  }  else {
    $('#modal2').openModal();
    $('#toolSelection').val("");
    $('#toolSelection').material_select();
  }


}

function filterPostmanItems(item){
  if (item.constructor === Array) {
    processPostmanItem(item);
  } else if (item.constructor === Object) {
      if (item.item) {
        filterPostmanItems(item.item);
      } else {
        if (item.request.constructor === String) {
          let modifiedRequest = {};
          // default the method to GET
          modifiedRequest['method'] = 'GET';
          // url is the string.
          modifiedRequest.url = item.request;
          item.request = modifiedRequest;
        }
        item.request = transformRequestData(item.request);
        return item;
    }
  }
}

function transformRequestData(request) {
  // if request is object
  if (request.url.constructor === Object) {
    let urlObj = request.url;
    let url='';
    if (urlObj.protocol) {
      url += urlObj.protocol;
    }
    if (urlObj.host) {
      //let host = urlObj.host.slice(0, -1);
      let host = urlObj.host.replace(/\.$/, '');
      url += '://'+ host;
    }
    if (urlObj.port) {
      url += ':'+ urlObj.port;
    }
    if (urlObj.path) {
      if(urlObj.path.constructor === String) {
        url += '/'+ urlObj.path;
      }
      if(urlObj.path.constructor === Array) {
        //do something
      }
    }
    if (urlObj.query && urlObj.query.length > 0) {
      //do something
    }
    if (urlObj.hash) {
      //do something
    }
    if (urlObj.variables && urlObj.variables.length > 0) {
      //do something
    }

    request.url = url;
  }

  if (request.header) {
      if (request.header.constructor === String) {
      let headersArray = request.header.split('\n');
      let headersObj = {};
      headersArray.forEach(function(headers){
        if (headers) {
          let keyValue = headers.split(': ');
          headersObj[keyValue[0]] = ''+keyValue[1]+'';
        }
      });
      request.header = headersObj;
    } else if (request.header.constructor === Array) {
      let headersObj = {};
      request.header.forEach(function(arrayItem){
        headersObj[arrayItem.key] = arrayItem.value;
      });
      request.header = headersObj;
    }
  }

  if (!request.method) {
    request.method = 'GET';
  }

  // process body parameters
  if (request.body) {
    let body = request.body;
    let requestBody = {};
    let bodyType;
    for (let key in body) {
      if (body.hasOwnProperty(key) && key !== 'mode') {
        let bodyObj = body[key];
        // if postman body is raw
        if (key === 'raw') {
          request.body = bodyObj;
        }

        // if postman body is urlencoded or formdata
        if (key === 'urlencoded' || key === 'formdata') {
            if (bodyObj.length > 0) {
              // set the body type appropriately.
              let bodyType;

              if (key === 'urlencoded') {
                bodyType = 'form';
              } else {
                bodyType = 'formdata';
              }
              request[bodyType] = {};
              bodyObj.forEach(function(obj){
                request[bodyType][obj.key] = obj.value;
              });
          }
          // delete the request.body property as the transformation takes place.
          delete request.body;
        }
      }
    }
  }

  return replaceEnvVariablesInRequest(request);
  //return request;
}

function htmlDisplay(){
  if (scriptObject) {
    let formatScriptObj = JSON.stringify(scriptObject, null, 1);
    fileDisplayArea.innerText = formatScriptObj;

    let data = "text/json;charset=utf-8," + encodeURIComponent(formatScriptObj);

    $('#downloadFile').remove();

    let downloadButton = '<div id="downloadFile"><p></p><a class="btn btn-primary orange darken-2 lighten-1 col s10 waves-effect truncate" href="data:' + data + '" download="'+fileName+'_'+tool+'.json" download<a class="waves-effect waves-light btn white"><i class="material-icons right">file_download</i>download file</a></div>';

    $(downloadButton).insertAfter('#toolSelection');
    $('#dakiyaGeneratedScript').show();
    $('#dakiyaHeader').hide();
  }
}

function artillery(items) {
  let artilleryFlow = [];
  items.forEach(function(item){
    let request = item.request;
    // check of pre-request script from postman and configure for inline variables in artillery.
    // check of script from postman and capture variables.


    // check if the request method is supported by artillery if not skip.
    let artillerySupportedMethods = ['GET', 'POST', 'PUT', "DELETE"];
    if (artillerySupportedMethods.indexOf(request.method) === -1) {
      return null;
    }

    //initialize request method as object
    let artilleryRequest = {};
    let method;

    // check if request is object or string.
    if (request.method) {
      method = request.method.toLowerCase()
      artilleryRequest[method] = {}
    };

    //get hostname
    let parser = document.createElement('a');
    parser.href = request.url;
    if (!artilleryTarget) artilleryTarget = parser.protocol + '//' + parser.host;

    //check if collection has multiple hostname and make target as the one with maximum occurance

    // transform url
    let newURL = request.url.replace (/^[^#]*?:\/\/.*?(\/.*)$/, '$1');
    //if (request.url) artilleryRequest[method].url = request.url;
    if (request.url) artilleryRequest[method].url = newURL;

    //transform auth
    if (request.auth) {
      let artillerySupportedHawk = ["authId", "authKey", "algorithm", "user", "nonce"];
      let authType;
      let auth = request.auth;
      let authObj = {};
      for (let key in auth) {
        if (auth.hasOwnProperty(key) && key !== 'type') {
          if (key === 'basic') {
            authType = 'auth';
          } else {
            authType = key;
          }
          authObj = auth[key];
        }
      }
      artilleryRequest[method][authType] = authObj;
    }

    //transform headers
    if (request.header) {
      let headers = {};
      for(let key in request.header) {
        headers[key.toLowerCase()] = request.header[key];
      }
      artilleryRequest[method].headers = headers;
    }

    if(request.hasOwnProperty('body')){
      if (artilleryRequest[method].headers && 'content-type' in artilleryRequest[method].headers && artilleryRequest[method].headers['content-type'].includes('application/json')) {
        //add new property json and remove body property.
        artilleryRequest[method]['json'] = JSON.parse(request.body);
      } else {
        //else do something with this body
        artilleryRequest[method]['body'] = request.body;
      }
    }

    if(request.hasOwnProperty('form')){
      artilleryRequest[method]['form'] = request.form;
    }

    if(request.hasOwnProperty('formdata')){
      artilleryRequest[method]['form'] = request.formdata;
    }

    //TODO scan for test scripts and do what is neccessary
    if (item.event && item.event.constructor === Array) {
      item.event.forEach(function(events){
        if (events.script && events.script.exec) {
          // if listen is test, capture as variable

          //if listen is prerequest store as global variable.

          let scriptExec = events.script.exec;
          // if script is string
          if (scriptExec.constructor === String) {
          } else if (scriptExec.constructor === Array) {
            scriptExec.forEach(function (script) {
            })
          }

        }
        //if environment variables are set here do not replace with env variables collection values.
      });
    }
    artilleryFlow.push(artilleryRequest);
  });
  scriptObject = generateArtilleryConfig(artilleryFlow)
}

function generateArtilleryConfig(flow){
  let defaultArtilleryConfig = {
    "config": {
      "target": artilleryTarget,
      "phases": [],
    },
    "variables":{},
    "scenarios": [
      {
        "name": collectionName || fileName ,
        "flow": flow
      }
    ]
  };
  if (flow.length > 0) {
    return defaultArtilleryConfig;
  } else {
    return null;
    }

}


function replaceEnvVariablesInRequest(request) {
  for (let key in request) {
    if (request.hasOwnProperty(key) && key!== 'description') {

      function replaceArray(array){
        array.forEach(function (obj) {
          array[obj.key] = replaceStringWithEnvVariables(obj.value);
        });
        return array;
      }

      if (typeof request[key] === 'string') {
        request[key] = replaceStringWithEnvVariables(request[key]);
      }

      if (request[key].constructor === Array) {
        request[key] = replaceArray(request[key]);
      }

      if (request[key].constructor === Object) {
        replaceEnvVariablesInRequest(request[key]);
      }

    }
  }
  return request;
}

function replaceStringWithEnvVariables(stringValue) {
  let regex = /\{\{(.*)\}\}/;

  let envVariable = stringValue.match(regex);
  if (envVariable && envCollection) {
    envVariable = envVariable[1];
    //let result = envCollection.find(x => x.key === envVariable).value;
    let findResult = envCollection.find(x => x.key === envVariable);
    let result = findResult? findResult.value : null;
    if (result) {
      return stringValue.replace(regex, result);
    } else {
      return stringValue;
    }
  } else {
    return stringValue;
  }
}

function replaceWithTestVariables(stringValue) {
  let regex = /\{\{(.*)\}\}/;

  let envVariable = stringValue.match(regex);
  if (envVariable && envCollection) {
    envVariable = envVariable[1];
    let result = envCollection.find(x => x.key === envVariable).value;
    if (result) {
      return stringValue.replace(regex, result);
    } else {
      return stringValue;
    }
  } else {
    return stringValue;
  }
}
