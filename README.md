# Herald
> Contact owner of item directly via our app

> HackZurich 2015 Project

## Libraries
* hapi.js - main framework
* leveldb - tiny nosql database
* levelup - leveldb nodejs way https://github.com/Level/levelup
* winston - for convenient logging
* node-gcm - for google cloud messaging integration

## Running the server
Server is preconfigured to run on a RedHat's OpenShift platform.
If you want to use the server locally:
> npm install

> node server.js

Then the api is available at
>localhost:3000/api

Please don't use our google API key, apply for your own.

## Client application
Client app is currently only Android, but webapp is necessary! If you are interested please contribute.

## How it works?
1. Authentication
  * JSON Web Tokens as a form of authentication, currently there's signup only for username/password

2. Sending messages
  * message to other Herald app goes to the server. The server translates id of item to user id, receives his token and sends the request to show notification through Google Cloud messaging
