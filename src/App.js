import React , {useState} from 'react'
import logo from './logo.svg';
import './App.css';
import VideoCall from './VideoCall/index'
function App() {
  const [isCall, setIsCall] = useState(false)
  return (
<>
{
  isCall ? <>
  <a onClick={()=>setIsCall(false)}>change</a>
<VideoCall/>
  </> :
  (    <div className="App">
  <header className="App-header">
  <a onClick={()=>setIsCall(true)}>change</a>

    <img src={logo} className="App-logo" alt="logo" />
    <p>
      Edit <code>src/App.js</code> and save to reload.
    </p>
    <a
      className="App-link"
      href="https://reactjs.org"
      target="_blank"
      rel="noopener noreferrer"
    >
      Learn Hello
    </a>
  </header>
</div>)
}
</>
  );
}

export default App;
