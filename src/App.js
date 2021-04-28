import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { gql, useMutation } from '@apollo/client';

function App() {
  const [singleShotDataInput, setSingleShotDataInput] = useState({id: null, count: 1})
  const [multiShotDataInput, setMultiShotDataInput] = useState({id: null, count: 1, interval: 10000})
  
  const LOG_EVENT = gql`
    mutation logEvent($dataStreamId: ID!) {
      logEvent(dataStreamId: $dataStreamId)
    }
  `;

  const [logEvent, { data, loading, error }] = useMutation(LOG_EVENT);  

  const sendDataPoints = ({ id, count }) => {
    // do graphql mutation
    console.log(id, count) //????????

    while (count) {
      logEvent({ variables: { dataStreamId: id }})
      count--;
    }
  }

  const initiateMultishotDataSequence = ({ id, count, interval }) => {
    const intervalId = setInterval(() => {
      sendDataPoints({id, count})
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
              Send <input type="text" onChange={(e) => setSingleShotDataInput({...singleShotDataInput, count: e.target.value})} value={singleShotDataInput.count}/> 
              datapoints of ID <input type="text" onChange={(e) => setSingleShotDataInput({...singleShotDataInput, id: e.target.value})}/>.
            </div>
            <button onClick={() => sendDataPoints(singleShotDataInput)}>Send</button>
          </div>
          {/* repeated burst */}
          <div className="datapoint-input">
            <div>
              Send <input type="text" onChange={(e) => setMultiShotDataInput({...multiShotDataInput, count: e.target.value})} value={multiShotDataInput.count}/> 
              datapoints of ID <input type="text" onChange={(e) => setMultiShotDataInput({...multiShotDataInput, id: e.target.value})}/> 
              every <input type="text" onChange={(e) => setMultiShotDataInput({...multiShotDataInput, interval: e.target.value})} value={multiShotDataInput.interval}/>
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
