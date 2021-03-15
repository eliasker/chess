### Chess server

Handles traffic to&from clients connected via socket.io.  

`chess\server> npm install`
Install dependencies

`chess\server> npm start`
Starts the server and serves production frontend from /build in localhost:3001.  Alternatively development frontend can be started from /chess-client in localhost:3000

`chess\server> npm run dev`
Optionally: start the server using nodemon (when developing)  

![Client-server diagram](../docs/img/chess_diagram.PNG "Client-server diagram")

After each event the server emits the updated object (users, games, game).  
'game updates' are only sent to clients that are connected to that game.