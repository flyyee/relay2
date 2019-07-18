# relay2
Node proxy server that sends user a version of a restricted page stripped off any external (potentially restrictive) pages.  
Hosted on a heroku postgresql database.  
Comes in two flavours:
+ server-side only - hosted on a ngrok.io server, allows anyone to connect to server and redirect traffic through there
+ server-side and client-side - client send requests through the postgresql database to the server which redirects traffic
back the same way
