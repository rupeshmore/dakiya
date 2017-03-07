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

// TODO
// Other auth support

let envCollection, collection, fileName, dakiyaItems, tool, collectionName;

window.onload = function () {
  let postmanEnvCollection = document.querySelector('#add-postman-env');
  let collectionInput = document.querySelector('#add-collection');

  postmanEnvCollection.addEventListener('change', function (e) {
    let file = postmanEnvCollection.files[0];
    let reader = new FileReader();
    envCollection = null;
    reader.onload = function (e) {
      if (collection) {
        toolSelectionDefault();
      }

      envCollection = JSON.parse(reader.result).values;
      if (collection) {
        filterPostmanJson();
      }
    }
    reader.readAsText(file);
  });

  collectionInput.addEventListener('change', function (e) {
    // default tool selection.
    fileName = collectionInput.files[0].name.replace('.json', '');
    let file = collectionInput.files[0];
    let reader = new FileReader();
    reader.onload = function (e) {
      dakiyaItems = [];
      toolSelectionDefault();

      collection = reader.result;
      filterPostmanJson();
    }
    reader.readAsText(file);
  });
}

document.querySelector('#relativeUrl').addEventListener('change', function (e) {
  toolSelectionDefault();
})

function toolSelectionDefault () {
  $('#toolSelection').val('');
  $('#toolSelection').material_select();
}

function filterPostmanJson () {
  if (collection.constructor !== Object ) collection = JSON.parse(collection);
  if (collection.info && collection.info.name) {
    collectionName = collection.info.name;
  }

  // check json is postman schema v2 and above compliant.
  if (collection.item) {
    processPostmanItem(collection.item);
  } else {
    $('#modal3').openModal();
  }
}

function processPostmanItem (item) {
  item.forEach(function (data) {
    let items = filterPostmanItems(data);
    if (items) dakiyaItems.push(items);
  });
}

function convertPostman (selection) {
  if (collection) {
    tool = selection;

    if (tool === 'artillery') {
      artillery(dakiyaItems);
    }
    if (tool === 'gatling') {
      gatling(dakiyaItems);
    }
    if (tool === 'loadrunner') {
      // loadrunner(dakiyaItems);
      $('#modal1').openModal();
    }
  } else {
    $('#modal2').openModal();
    $('#toolSelection').val('');
    $('#toolSelection').material_select();
  }
}

function filterPostmanItems (item) {
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

function transformRequestData (request) {
  // if request is object
  if (request.url.constructor === Object) {
    let urlObj = request.url;
    let url = '';
    if (urlObj.protocol) {
      url += urlObj.protocol;
    }
    if (urlObj.host) {
      // let host = urlObj.host.slice(0, -1);
      let host = urlObj.host.replace(/\.$/, '');
      url += `://${host}`;
    }
    if (urlObj.port) {
      url += `:${urlObj.port}`;
    }
    if (urlObj.path) {
      if (urlObj.path.constructor === String) {
        url += `/${urlObj.path}`;
      }
      if (urlObj.path.constructor === Array) {
        // do something
      }
    }
    if (urlObj.query && urlObj.query.length > 0) {
      let queryParams = urlObj.query;
      let urlQuery = '';
      queryParams.forEach(function (params) {
        if (!urlQuery) {
          urlQuery = `?${params.key}=${params.value}`;
        } else {
          urlQuery = `${urlQuery}&${params.key}=${params.value}`;
        }
      });
      url += `${urlQuery}`;
      // do something
    }
    if (urlObj.hash) {
      // do something
    }
    if (urlObj.variables && urlObj.variables.length > 0) {
      // do something
    }

    request.url = url;
  }

  if (request.header) {
    if (request.header.constructor === String) {
      let headersArray = request.header.split('\n');
      let headersObj = {};
      headersArray.forEach(function (headers) {
        if (headers) {
          let keyValue = headers.split(': ');
          headersObj[keyValue[0]] = keyValue[1];
        }
      });
      request.header = headersObj;
    } else if (request.header.constructor === Array) {
      let headersObj = {};
      request.header.forEach(function (arrayItem) {
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
    // let requestBody = {};
    // let bodyType;
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
            bodyObj.forEach(function (obj) {
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
}

function displayModal (data, tool) {
  let fileExt;
  let script;

  if (tool === 'artillery') {
    data = JSON.stringify(data, null, 1);
    script = `data:text/json;charset=utf-8,${encodeURIComponent(data)}`;
    fileExt = 'json';
  } else if (tool === 'gatling') {
    script = `data:,${encodeURIComponent(data)}`;
    fileExt = 'scala'
  }

  let file = `${fileName}_${tool}.${fileExt}`;

  $(`#download${tool}Header`).remove();
  $(`#download${tool}Footer`).remove();
  let scriptDisplay = document.querySelector(`#${tool}ScriptDisplay`);
  scriptDisplay.innerHTML = data;
  Prism.highlightAll();

  let downloadButtonHeader = `<a id="download${tool}Header" class="right btn orange darken-2 lighten-1 col waves-effect truncate" href="${script}" download="${file}"<a class="waves-effect waves-light btn white"><i class="material-icons right">file_download</i>download</a>`;

  let downloadButtonFooter = `<a id="download${tool}Footer" class="btn btn-primary orange darken-2 lighten-1 col waves-effect truncate" href="${script}" download="${file}"<a class="waves-effect waves-light btn white"><i class="material-icons right">file_download</i>download</a>`;

  $(`#${tool}Modal .modal-header`).prepend(downloadButtonHeader);
  $(`#${tool}Modal .modal-footer`).append(downloadButtonFooter);

  $(`#${tool}Modal`).openModal();
}

function artillery (items) {
  let relativeUrl = $('#relativeUrl').prop('checked');
  let artilleryFlow = [];
  let baseUrl = '';
  items.forEach(function (item) {
    let request = item.request;
    // check if the request method is supported by artillery if not skip.
    let artillerySupportedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];
    if (artillerySupportedMethods.indexOf(request.method) === -1) {
      return null;
    }

    // initialize request method as an object
    let artilleryRequest = {};
    let method;

    // check if request is object or string.
    if (request.method) {
      method = request.method.toLowerCase()
      artilleryRequest[method] = {}
    };

    let url = request.url;
    if (relativeUrl) {
      if (!baseUrl) baseUrl = getHostName(url);
      url = url.replace(baseUrl, '');
    }

    // transform url
    // if (request.url) artilleryRequest[method].url = request.url;
    if (request.url) artilleryRequest[method].url = url;

    // transform auth
    if (request.auth) {
      let artillerySupportedHawk = ['authId', 'authKey', 'algorithm', 'user', 'nonce'];
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

    // transform headers
    if (request.header) {
      let headers = {};
      for (let key in request.header) {
        headers[key.toLowerCase()] = request.header[key];
      }
      artilleryRequest[method].headers = headers;
    }

    if (request.hasOwnProperty('body')) {
      if (artilleryRequest[method].headers && 'content-type' in artilleryRequest[method].headers && artilleryRequest[method].headers['content-type'].includes('application/json') && isJson(request.body)) {
        // add new property json and remove body property.
        artilleryRequest[method]['json'] = JSON.parse(request.body);
      } else {
        // else do something with this body
        artilleryRequest[method]['body'] = request.body;
      }
    }

    if (request.hasOwnProperty('form')) {
      artilleryRequest[method]['form'] = request.form;
    }

    if (request.hasOwnProperty('formdata')) {
      artilleryRequest[method]['form'] = request.formdata;
    }
    artilleryFlow.push(artilleryRequest);
  });
  let scriptObject = generateArtilleryConfig(artilleryFlow, baseUrl);
  displayModal(scriptObject, 'artillery');
}

function generateArtilleryConfig (flow, baseUrl) {
  let defaultArtilleryConfig = {
    config: {
      phases: []
    },
    variables: {},
    scenarios: [
      {
        name: collectionName || fileName,
        flow: flow
      }
    ]
  };
  if (flow.length > 0) {
    if (baseUrl) defaultArtilleryConfig.config.target = baseUrl;
    return defaultArtilleryConfig;
  } else {
    return null;
  }
}

function replaceEnvVariablesInRequest (request) {
  for (let key in request) {
    if (request.hasOwnProperty(key) && key!== 'description') {
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

function replaceArray (array) {
  array.forEach(function (obj) {
    array[obj.key] = replaceStringWithEnvVariables(obj.value);
  });
  return array;
}

function replaceStringWithEnvVariables (stringValue) {
  let regex = /\{\{(.*?)\}\}/;

  let envVariable = stringValue.match(regex);
  if (envVariable && envCollection) {
    envVariable = envVariable[1];
    // let result = envCollection.find(x => x.key === envVariable).value;
    let findResult = envCollection.find(x => x.key === envVariable);
    let result = findResult ? findResult.value : null;
    if (result) {
      return stringValue.replace(regex, result);
    } else {
      return stringValue;
    }
  } else {
    return stringValue;
  }
}

function gatling (items) {
  let relativeUrl = $('#relativeUrl').prop('checked');
  let gatlingScenarioName = collectionName || fileName;
  let gatlingHttpRequest = '';
  let gatlingTestClass = `import io.gatling.core.Predef._\nimport io.gatling.http.Predef._\n\nclass Dakiya extends Simulation {`;
  // classname = ${gatlingScenarioName.replace(/\s/g,"_")}

  let gatlingScript = `val scn = scenario("${gatlingScenarioName}")\n`;
  let baseURL = '';
  items.forEach(function (item) {
    let name = item.name || item.request.url;
    let request = item.request;
    let method = request.method.toLowerCase();

    let gatlingSupportedMethods = ['get', 'post', 'put', 'delete', 'head', 'patch', 'options'];
    if (gatlingSupportedMethods.indexOf(method) === -1) {
      return null;
    }

    let url = request.url;
    // if base url is true change the url
    url = url.replace(/{{(.*?)}}/g, '$($1)');
    if (relativeUrl) {
      if (!baseURL) baseURL = getHostName(url);
      url = url.replace(baseURL, '');
    }
    gatlingHttpRequest = `\t.exec(http("${name}")\n\t\t.${method}("${url}")`;

    // handle authentication
    if (request.auth) {
      let auth = request.auth;
      let gatlingAuth = '';
      let authType='';
      for (let key in auth) {
        if (auth.hasOwnProperty(key) && key !== 'type') {
          if (key === 'basic') {
            authType = 'basicAuth';
          } else if (key === 'digest') {
            authType = 'digestAuth';
          }
          // TODO iterate through the object to get
          let authKey = auth[key].username;
          let authValue = auth[key].password;
          if (authType && authKey && authValue) gatlingAuth = `${gatlingAuth}\t.${authType}("${authKey}", "${authValue}")\n\t`;
        }
      }
      // remove last trailing newline from the gatlingHeaders;
      gatlingAuth = removeTrailingNewline(gatlingAuth);
      gatlingHttpRequest = `${gatlingHttpRequest}\n\t${gatlingAuth}`;
    }

    let headers = request.header;
    if (headers) {
      let gatlingHeaders = '';
      for (let key in headers) {
        if (headers.hasOwnProperty(key)) {
          let headerKey = stringStringify(key);
          let headerValue = stringStringify(headers[key]);
          gatlingHeaders = `${gatlingHeaders}\t.header("${headerKey}", "${headerValue}")\n\t`;
        }
      }
      // remove last trailing newline from the gatlingHeaders;
      gatlingHeaders = removeTrailingNewline(gatlingHeaders)
      gatlingHttpRequest = `${gatlingHttpRequest}\n\t${gatlingHeaders}`;
    }

    // handle form
    let form = request.form;
    if (form) {
      let gatlingForm = '';
      for (let key in form) {
        if (form.hasOwnProperty(key)) {
          let formKey = stringStringify(key);
          let formValue = stringStringify(form[key]);
          gatlingForm = `${gatlingForm}\t.formParam("${formKey}", "${formValue}")\n\t`;
        }
      }
      // remove last trailing newline from the gatlingForm;
      gatlingForm = removeTrailingNewline(gatlingForm)
      gatlingHttpRequest = `${gatlingHttpRequest}\n\t${gatlingForm}`;
    }

    // handle raw body
    let body = request.body;
    if (body && body instanceof String) {
      // align the body.
      body = body.replace(/\n\t/g, '\n').replace(/\n/g, "\n\t\t").replace(/{{(.*?)}}/g, '$($1)');
      let gatlingBody = `.body(StringBody("""${body}""")).asJSON`;
      gatlingHttpRequest = `${gatlingHttpRequest}\n\t\t${gatlingBody}`;
    }

    // handle multipart requests
    let formData = request.formdata;
    if (formData) {
      formData = JSON.stringify(formData);
      formData = formData.replace(/\n\t/g, "\n").replace(/\n/g, "\n\t\t").replace(/{{(.*?)}}/g, '$($1)');
      let gatlingFormData = `.bodyPart(StringBody("""${formData}"""))`;
      gatlingHttpRequest = `${gatlingHttpRequest}\n\t\t${gatlingFormData}`;
    }

    // closing exec
    gatlingHttpRequest = `${gatlingHttpRequest}\n\t)`;
    gatlingScript = `${gatlingScript}${gatlingHttpRequest}\n`;
  });

  let gatlingBaseUrl = '';
  if (baseURL) {
    gatlingBaseUrl = `val httpConf = http.baseURL("${baseURL}")\n`;
  }

  let gatlingClass = `${gatlingTestClass}\n${gatlingBaseUrl}${gatlingScript}}`;
  displayModal(gatlingClass, 'gatling');
}

function removeTrailingNewline (string) {
  return string.replace(/\n\t$/, '');
}

function stringStringify (string) {
  // convert postman variable to gatling variables
  string = string.replace(/{{(.*)}}/g, '$($1)');
  return string.replace(/\"/g,"\\\"");
}

function gatlingFormatString (string) {
  return string.replace(/\n\t/g, '\n').replace(/\n/g, '\n\t\t');
}

function getHostName (url) {
  let parser = document.createElement('a');
  parser.href = url;
  return parser.protocol + '//' + parser.host;
}

function isJson (str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
