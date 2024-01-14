import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/games")
      .then((res) => res.json())
      .then((data) => setMessage(data.games[0].id));
  }, []);

  return (
    <div className="App">
      <h1>Hi {message}</h1>
    </div>
  );
}

export default App