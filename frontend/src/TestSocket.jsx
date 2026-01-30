import socket from "./api/socket";

export default function TestSocket() {
  const testUserId = "TEST_USER_123";

  const connectSocket = () => {
    socket.connect();
    console.log("🔌 socket.connect()");
  };

  const joinUser = () => {
    socket.emit("joinUser", testUserId);
    console.log("📡 joinUser emitted:", testUserId);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Socket Test</h2>
      <button onClick={connectSocket}>Connect Socket</button>
      <br /><br />
      <button onClick={joinUser}>Join User Room</button>
    </div>
  );
}
