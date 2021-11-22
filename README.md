# MailMan: a javascript Pub/Sub library

![npm](https://img.shields.io/npm/v/@js-cloud/mailman?style=plastic)
[![CI](https://github.com/jscloud-org/FlashQueue/actions/workflows/npm-packages-workflow.yml/badge.svg)](https://github.com/jscloud-org/FlashQueue/actions/workflows/npm-packages-workflow.yml)
![npm](https://img.shields.io/npm/dw/@js-cloud/mailman?label=installs&style=plastic)
![GitHub issues](https://img.shields.io/github/issues-raw/jscloud-org/mailman)
![GitHub](https://img.shields.io/github/license/jscloud-org/mailman?style=plastic)


A superfast and light-weight message broker for pub/sub communication over network. Suitable for realtime low latency applications and intra-service communication.

## Table of Contents

- [About](#about)
- [Installation](#installation)
- [Modules](#modules)
  - [FlashQ](#flashq)
  - [AutoQ](#autoq)
- [FAQ](#faq)
- [Contribute](#contribute)
- [Support](#support)
- [License](#license)



## About

JS Cloud Suite is an open source project developed with an aim to simplify the effort of creating scalable and performance oriented cloud applications. This suite hosts a series of libraries, which can be integrated into any projects to enable cloud capabilities. We currently do not support in house hosted solutions, but with our tools and libraries, you can build customized solutions your own. All you need to have is a simple server setup (in old PCs, laptops, raspberry Pis, AWS EC2, etc).

You can also contribute to this project. Navigate to [contribute](#contribute) section to know how.

**This library is developed using Node.js and do not support any other frameworks yet. In order to install and use this library you are required to have a working installation of node.js (preferrably latest version).**

## Installation

Open up a terminal and install this library like this,

```javascript
npm install @js-cloud/mailman
```

## Start Server

```js
import { MMServer } from '@js-cloud/mailman'

MMServer.init(4000);
```

### customize server

```js

const sslconfig: SSLConfig = {
    cert: 'path to cert',
    key: 'path to key'
}
//custom handler for new connection request
const verifyClientCallback: VerifyClientCallback = (req, done) => {
    const newId = uuid();
    //if verified successfully
    done(null /*Error object is null for success*/, newId /*New generated Id for client*/);
    //if not verified
    const error=new ApiError('some error message')/*Define Api error customized for your application*/
    done(error,null);
}

//Initialize Server at PORT 4000
MMServer.init(4000, sslconfig, undefined, verifyClientCallback);
```


## Contribute

We welcome feedback, bug reports, and pull requests!

For pull requests, please stick to the following guidelines:

* Add tests for any new features and bug fixes. Ideally, each PR should increase the test coverage.
* Follow the existing code style. (Run `npm run format` and `npm run lint` before checking in your code).
* Put a reasonable amount of comments into the code.
* Fork this repo on your GitHub user account, do your changes there and then create a PR against main repository.
* Separate unrelated changes into multiple pull requests.

Please note that by contributing any code or documentation to this repository (by
raising pull requests, or otherwise) you explicitly agree to the.