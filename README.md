# Dakiya (डाकिया)

Dakiya (डाकिया) means postman.

Dakiya collects [Postman](https://www.getpostman.com) collections, sorts and delivers transformed scripts.

NOTE: This is an attempt to provide conversion utility for postman api's. This project is in it's early stage. It has not been tested in complex postman api's.

## Demo
[Dakiya Demo](https://dakiya-tfshaipvfy.now.sh)

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
  3. select the load test tool for conversion.
  4. Download script file (or copy from the browser).
```

## Features
1. No installation: Convert postman api's using browser.
2. Secure: No uploading of collections to any server.
3. Supports Postman folders.
4. Add postman environment collection and Dakiya replaces the variables in the script.
5. Convert the collections to Artillery load testing tool script.

## What about postman variables?
1. ***Environment variables***: Dakiya replaces variables within collection when environment collection is supplied.

2. ***Data variables***: Are used within postman collections by test runner. Look at the respective tool documentation on how to replace data variables during test execution.

## URL as object in Postman Collection
Dakiya has limited support for postman url as an object`{}`. This is due to limited collection examples.

## Auth support in Dakiya
Currently supporting only `Basic` conversion. Other authentication/authorization will be provided as it is from postman collection.
Look at the tool documentation to make relevant changes.

## More Info
1. Dakiya assumes a valid postman json schema is supplied. Take a look a this blog on how to validate your collection [http://blog.getpostman.com/2015/07/02/introducing-postman-collection-format-schema/]
2. The app has been created with limited collection examples and postman documentation. If there are bugs kindly log issues.

## TODO
1. Full support for postman url as an object.
2. [Gatling](http://gatling.io/#/) load testing tool script generation.
3. [Loadrunner](http://www8.hp.com/nz/en/software-solutions/loadrunner-load-testing/) load testing tool script generation.

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
