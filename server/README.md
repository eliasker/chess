### Chess server

`chess\server> npm install`
Install dependencies

`chess\server> npm start`
Start the server

`chess\server> npm run dev`
Optionally: start the server using nodemon (when developing)

![Client-server diagram](../docs/img/diagram.PNG "Client-server diagram")

After each event the server emits the updated object.  
At the moment this is how things are handled. I am planning on doing a rewrite before the server becomes too big of a mess.