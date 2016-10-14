let scriptObject, envCollection, collection, fileName, postmanRequest;

window.onload = function() {
  let postmanEnvCollection = document.querySelector('#add-postman-env');
  let collectionInput = document.querySelector('#add-collection');
  let buttonClassAttr = "btn btn-primary orange darken-2 black-text lighten-1 col s8 waves-effect";
  let fileDisplayHeader = document.querySelector('#fileDisplayHeader');
  let fileDisplayArea = document.querySelector('#fileDisplayArea');

  postmanEnvCollection.addEventListener('change', function(e) {
    let file = postmanEnvCollection.files[0];
    //envCollection = null;
    let reader = new FileReader();
    reader.onload = function(e) {
      envCollection = JSON.parse(reader.result).values;

      if (collection) {
        mergePostmanJson();
      }
    }
    reader.readAsText(file);
  });

  collectionInput.addEventListener('change', function(e) {
    fileDisplayArea.innerText = '';
    fileName = collectionInput.files[0].name.replace('.json', '');
    let file = collectionInput.files[0];

    let reader = new FileReader();
    reader.onload = function(e) {
      collection = reader.result;
      if (envCollection) {
        mergePostmanJson();
      }
    }
    reader.readAsText(file);
  });
}

function mergePostmanJson() {
  postmanRequest = [];
  if(typeof collection !=='object') collection = JSON.parse(collection);
  if (collection.item) {
    collection.item.forEach(function(item) {
      postmanRequest.push(replaceEnvVariablesInRequets(item.request));
    });
  } else {
    fileDisplayArea.innerText = 'PostMan collection is not v2';
  }

}

function generateScript(collection, tool) {
  scriptObject = [];
  //if(typeof collection !=='object') collection = JSON.parse(collection);
  collection.forEach(function(request) {
    if (tool === 'artillery') {
      artillery(request);
    }
    if (tool === 'gatling') {
      //gatling();
      $('#modal1').openModal();
    }
    if (tool === 'jmeter') {
      //jmeter();
      $('#modal1').openModal();
    }
  });


  let formattedFlow = JSON.stringify(scriptObject, null, 1);
  if (scriptObject.length >0) {
    fileDisplayArea.innerText = formattedFlow;

    let data = "text/json;charset=utf-8," + encodeURIComponent(formattedFlow);

    $('#downloadFile').remove();

    let downloadButton = '<div id="downloadFile"><p></p><a class="btn btn-primary orange darken-2 lighten-1 col s10 waves-effect truncate" href="data:' + data + '" download="'+fileName+'_'+tool+'.json" download<a class="waves-effect waves-light btn white"><i class="material-icons right">file_download</i>json</a></div>';

    $(downloadButton).insertAfter('#toolSelection');
    $('#dakiyaGeneratedHeader').show();
    $('#dakiyaGeneratedScript').show();
    $('#dakiyaHeader').hide();
  }
}

function artillery(request) {
  let artilleryRequest = {};
  let method;
  //initialize request method as object
  if (request.method) {
    method = request.method.toLowerCase()
    artilleryRequest[method] = {}
  };

  // transform url
  if (request.url) artilleryRequest[method].url = request.url;

  //transform auth
  if (request.auth) artilleryRequest[method].auth = request.auth;

  //transform headers
  if (request.header && request.header.length > 0) {
    let headers = {};
    request.header.forEach(function(obj){
      headers[obj.key.toLowerCase()] = replaceEnvVariables(obj.value);
    });

    artilleryRequest[method].headers = headers;
  }
  //body transform
  if (request.body) {
    let body = request.body;
    let artilleryBody;
    let bodyType;
    for (let key in body) {
      if (body.hasOwnProperty(key) && key !== 'mode') {
        let bodyObj = body[key];
        //console.log(bodyObj);
        // if postman body is raw
        if (key === 'raw') {
          if ('content-type' in artilleryRequest[method].headers && artilleryRequest[method].headers['content-type'].includes('application/json')) {
            artilleryBody = JSON.parse(bodyObj);
            bodyType = 'json';
          } else {
            artilleryBody = body;
            bodyType = 'body';
          }
        }
        // if postman body is urlencoded
        if (key === 'urlencoded' && bodyObj.length > 0) {
          artilleryBody = {};
          bodyObj.forEach(function(obj){
            artilleryBody[obj.key] = obj.value;
          });
          bodyType = 'form';
        }

        // if postman body is formdata
        if (key === 'formdata' && bodyObj.length > 0) {
          artilleryBody = {};
          bodyObj.forEach(function(obj){
            artilleryBody[obj.key] = obj.value;
          });
          bodyType = 'formdata';
        }
        artilleryRequest[method][bodyType] = artilleryBody;

      }
    }
  }
    scriptObject.push(artilleryRequest);
}


function artillery_old (url, method, header, body) {
  let artilleryRequest = {};
  let headers = {};

  let contentType = null;

  // make method lowercase
  method = method.toLowerCase();

  //initialize request method as object
  artilleryRequest[method] = {};

  url = replaceEnvVariables(url);
  // transform url
  artilleryRequest[method].url = url;

  //transform headers
  if (header.length > 0) {
    header.forEach(function(obj){
      headers[obj.key.toLowerCase()] = replaceEnvVariables(obj.value);

      if (obj.value.includes('application/json')) {
        contentType = 'json';
      } else if (obj.value.includes('application/x-www-form-urlencoded')) {
        contentType = 'form';
      } else {
        contentType = 'body';
      }

    });

    artilleryRequest[method].headers = headers;
  }
    //body transform
    let artilleryBody;
    for (let key in body) {
      if (body.hasOwnProperty(key) && key !== 'mode') {
        let bodyObj = body[key];

        if (contentType) {
          if (contentType === 'json' && typeof bodyObj === 'string') {
            artilleryBody = JSON.parse(bodyObj);
          }

          if (contentType === 'form' && bodyObj.length > 0) {
            artilleryBody = {};
            bodyObj.forEach(function(obj){
              artilleryBody[obj.key] = obj.value;
            });
          }
          artilleryRequest[method][contentType] = artilleryBody;
        }
      }
    }
    scriptObject.push(artilleryRequest);
  }

  function replaceEnvVariables(value) {
    let regex = /\{\{(.*)\}\}/;
    let envVariable = value.match(regex);
    if (envVariable && envCollection) {
      envVariable = envVariable[1];
      //if (envCollection) {
        //let result = $.grep(envCollection, function(e){ return e.key === envVariable; });
        let result = envCollection.find(x => x.key === envVariable).value;
        if (result) {
          return value.replace(regex, result);
        } else {
          return value;
        }
      //}
    } else {
      return value;
    }
  }

  function replaceEnvVariablesInRequets(request) {
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
          replaceEnvVariablesInRequets(request[key]);
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


  function convertPostman(tool){
    if(collection){
      if (!postmanRequest) {
        postmanRequest = [];
        if(typeof collection !=='object') collection = JSON.parse(collection);
        if (collection.item) {
          collection.item.forEach(function(item) {
            postmanRequest.push(item.request);
          });
        }
      }
      generateScript(postmanRequest, tool);
    }
    //generateScript(postmanRequest, tool);
    if (tool === 'artillery') {
      //generateScript(postmanRequest, tool);
      //artillery(postmanRequest);
    }
    if (tool === 'gatling') {
      //generateGatling();
      $('#modal1').openModal();
    }
    if (tool === 'jmeter') {
      //generateJmeter();
      $('#modal1').openModal();
    }

  }
