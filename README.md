# Red5 Pro HTML5 HLS Example

<!-- MarkdownTOC -->

1. [Requirements](#requirements)
2. [Getting Up and Running](#getting-up-and-running)
  1. [For Local Development](#for-local-development)
  2. [With a Prebuilt Distribution](#with-a-prebuilt-distribution)
  3. [Building a Distribution](#building-a-distribution)
3. [Overview of the HTML5 Client](#overview-of-the-html5-client)
4. [Modifying](#modifying)

<!-- /MarkdownTOC -->


An example of how to build an HTML client for [Red5 Pro's](http://red5pro.com/) HLS streams, built with:

* [ES2015 (a.k.a ES6)](https://github.com/bevacqua/es6) via [Babelify](http://babeljs.io/)
* [video.js](https://github.com/videojs/video.js)
* [videojs-contrib-media-sources](https://github.com/videojs/videojs-contrib-media-sources)
* [videojs-contrib-hls](https://github.com/videojs/videojs-contrib-hls)
* [bootstrap](https://github.com/twbs/bootstrap) and it's dependencies

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Requirements

This example requires that you have the following in order to use it:

1. A [Red5 Pro][r5p] server running on a server, such as an AWS instance
2. A mobile client to publish to your Red5 Pro server from, such as this [iOS example](https://github.com/red5pro/red5pro-ios-app) or this [Android example](https://github.com/red5pro/red5pro-android-app). Alternatively, using the [Red5 Pro Streaming SDK][r5s] you can build your own or incoporate streaming into your existing application(s)!

If you would like to **run, modify, or build it locally** you will also need the following:

1. [Node/NPM](https://nodejs.org/)

Make sure to set these up before you proceed! :+1:

## Getting Up and Running

### For HLS VOD

To provide HLS media content, your Red5 Pro server may require extra configuration.

All Red5 Pro applications (those that reside in the `webapps` directory) which provide HLS content require support for [Cross-origin resource sharing](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) or CORS. That means the following `servlet filter` has to be configured in the applications web application configuration file, its `web.xml`. The example below will work for serving HLS content.

```xml
    <filter>
        <filter-name>CORS</filter-name>
        <filter-class>com.thetransactioncompany.cors.CORSFilter</filter-class>
        <async-supported>true</async-supported>
        <init-param>
            <param-name>cors.allowOrigin</param-name>
            <param-value>*</param-value>
        </init-param>
        <init-param>
            <param-name>cors.allowSubdomains</param-name>
            <param-value>true</param-value>
        </init-param>
        <init-param>
            <param-name>cors.supportedMethods</param-name>
            <param-value>GET, HEAD</param-value>
        </init-param>
        <init-param>
            <param-name>cors.maxAge</param-name>
            <param-value>3600</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>CORS</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
```

To support listing of HLS VOD media files, the `M3U8ListingServlet` must be enabled in your applications `web.xml` file as shown below.

```xml
    <servlet>
        <servlet-name>playlists</servlet-name>
        <servlet-class>com.red5pro.stream.transform.mpegts.server.M3U8ListingServlet</servlet-class>
    </servlet>    
    <servlet-mapping>
        <servlet-name>playlists</servlet-name>
        <url-pattern>/playlists/*</url-pattern>
    </servlet-mapping>
```


### For Local Development

1. Clone the repo
2. Inside the repo, run `npm install`
3. After that, run `npm run start` which will transpile all the ES2015 source to ES5 Javascript and start a local Node server
  1. If you'd prefer to run a different server, such as a Pyton server for instance, then you can just run `npm run publish` to transpile the ES2015 source to ES5 Javascript
4. Open up [http://localhost:3000/](http://localhost:3000/) to see the Red5 Pro HLS HTML5 client example

### With a Prebuilt Distribution

Visit our [releases](https://github.com/red5pro/red5pro-html5-hls/releases) to find a prebuilt distribution you can download **&mdash; or &mdash;** view the [live example](http://red5pro.github.io/red5pro-html5-hls/) and use one of our example publishing apps ([iOS](https://github.com/red5pro/red5pro-ios-app) or [Android](https://github.com/red5pro/red5pro-android-app)).

### Building a Distribution

Should you ever find the need to build a distribution yourself, you can run the following to accomplish that:

```sh
npm run dist
```

## Overview of the HTML5 Client

The example HTML5 client has 5 fields allowing you to connect to whatever [Red5 Pro][r5p] server and stream you'd like.

| Field                 | Purpose                                                                                                                                                                                         |
|:----------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Stream URL or IP      | This is the base URL or IP for your [Red5 Pro][r5p] server, e.g. http://my-test-server.com/ or http://99.98.97.96/                                                                              |
| Stream Port           | This is the port for your stream connection on the [Red5 Pro][r5p] server. By default, this is 5080 in the server.                                                                              |
| Stream Websocket Port | This is the port for your websocket connection on the [Red5 Pro][r5p] server. By default, this is 6262 in the server.                                                                           |
| Stream Context        | This is the context under which your stream is running on the [Red5 Pro][r5p] server. By default, this is "live" in the server and the example mobile apps.                                     |
| Stream Name           | This is the name for your stream on the [Red5 Pro][r5p] server. You specify this in either the example mobile apps when you publish or in your own apps using the [Red5 Pro Streaming SDK][r5s] |

You can Save/Update the form and it will use the default values (shown as placeholders) for any fields you haven't filled in.

## Modifying

There are 4 "moving" pieces to the Red5 Pro HLS HTML5 client example, only 3 of which (noted below with checkmarks) that you should need to modify to extend or modify the current example:

1. :heavy_check_mark: [js/main.js](./js/main.js), the entry point of the app, which instantiates the other "moving" pieces
2. :heavy_check_mark: [js/demo-video-handler.js](./js/demo-video-handler.js) which handles updating the video
3. :heavy_check_mark: [js/demo-socket-handler.js](./js/demo-socket-handler.js) which handles communication with the websocket
4. :heavy_multiplication_x: [js/src/form-handler.js](./js/src/form-handler.js) which notifies other pieces of changes ("inputchange" for live editing, "change" for Save/Update) to the example form

By modifying these "moving" pieces, you can reshape the behavior of the Red5 Pro HLS HTML5 client example to suit your needs.

[r5p]:      https://red5pro.com                                 "Red5 Pro"
[r5s]:      https://www.red5pro.com/docs/streaming/overview/    "Red5 Pro Streaming SDK"
[![Analytics](https://ga-beacon.appspot.com/UA-59819838-3/red5pro/red5pro-html5-hls?pixel)](https://github.com/igrigorik/ga-beacon)
