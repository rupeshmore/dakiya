# Dakiya (डाकिया)

Dakiya (डाकिया) means postman.

Dakiya collects [Postman](https://www.getpostman.com) collections, sorts and delivers transformed scripts.

NOTE: This is an attempt to provide conversion utility for postman api's. This project is in its early stage. It has not been tested in complex postman api's.

## Hosted
Start Using Dakiya Now

[https://dakiya.now.sh](https://dakiya.now.sh)

[https://dakiya.herokuapp.com/](https://dakiya.herokuapp.com/)

## Video Demo
[Dakiya Demo](https://youtu.be/ll9nneFegL8)

## Getting Started

- Clone or Download the repo
```
  git clone https://github.com/rupeshmore/dakiya
```

- Run the app
```
  open index.html
```

- Upload Postman Collections (v2 and above)
```
  1. Postman environment variables collection. (optional)
  2. Postman api collections. (mandatory)
  3. Select if base url is needed in the script. (off by default)
  4. Select the load test tool for conversion.
  5. Download script file (or copy from the browser).
```

## Features
1. No installation: Convert postman api's using the browser.
2. Secure: No uploading of collections to any server.
3. Supports Postman folders.
4. Add postman environment collection and Dakiya replaces the variables in the script.
5. Convert postman collections to Artillery load testing script.
6. Convert postman collections to Gatling load testing script.

## Postman variables
Dakiya converts the postman variables syntax to the load testing tool syntax.

1. ***Environment variables***: Dakiya replaces variables within collection when environment collection is supplied.


## Auth conversion in Dakiya
1. **Artillery** - currently supporting only `Basic` auth. Other authentication/authorization will be provided as it is from postman collection.
2. **Gatling** - currently supporting `Basic` & `Digest` auth.
Look at the tool documentation to make relevant changes.

## More Info
1. Dakiya assumes a valid postman json schema is supplied. Take a look this blog on how to validate your collection [http://blog.getpostman.com/2015/07/02/introducing-postman-collection-format-schema/]
2. The app has been created with limited collection examples and postman documentation. If there are bugs kindly log issues.

## RoadMap
1. [Loadrunner](http://www8.hp.com/nz/en/software-solutions/loadrunner-load-testing/) load testing tool script generation.
2. Dakiya has limited support for postman url as an object. This is due to limited collection examples.

## License
MIT License

Copyright (c) 2016 Rupesh More

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
