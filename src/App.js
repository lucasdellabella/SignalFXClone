import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';


function App() {
  const [singleShotDataInput, setSingleShotDataInput] = useState({count: 1})
  const [multiShotDataInput, setMultiShotDataInput] = useState({count: 1, interval: 10000})

  const sendDataPoints = ({ count }) => {
    // do graphql mutation
    console.log(count)
  }

  const initiateMultishotDataSequence = ({ count, interval }) => {
    const intervalId = setInterval(() => {
      sendDataPoints({count})
    }, interval);
    // TODO add rows for activate multishot sequences, make them cancellable
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1
          className="App-link"
        >
          Send Data To SignalFXClone
        </h1>
        <div className="contents">
          {/* Single shot burst */}
          <div className="datapoint-input">
            <div>
              Send <input type="text" onChange={(e) => setSingleShotDataInput({count: e.target.value})} value={singleShotDataInput.count}/> 
              datapoints.
            </div>
            <button onClick={() => sendDataPoints(singleShotDataInput)}>Send</button>
          </div>
          {/* repeated burst */}
          <div className="datapoint-input">
            <div>
              Send <input type="text" onChange={(e) => setMultiShotDataInput({...multiShotDataInput, count: e.target.value})} value={multiShotDataInput.count}/> 
              datapoints every <input type="text" onChange={(e) => setMultiShotDataInput({...multiShotDataInput, interval: e.target.value})} value={multiShotDataInput.interval}/>
              seconds.
            </div>
            <button onClick={() => initiateMultishotDataSequence(multiShotDataInput)}>Send</button>
          </div>
          {/* Link to frontend app with graphs*/}
        </div>
      </header>
    </div>
  );
}

export default App;
