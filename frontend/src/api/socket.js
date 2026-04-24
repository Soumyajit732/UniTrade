import { io } from "socket.io-client";

// auth is a function so the token is read fresh each time the socket connects
const socket = io("http://localhost:5001", {
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("token") })
});

export default socket;
