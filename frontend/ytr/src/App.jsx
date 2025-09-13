import './App.css'
import Header from "./components/Header";
import Description from "./components/Description";
import Tracks from "./components/Tracks";
import WebcamStream from "./components/WebcamStream.tsx";

function App() {
  return (
    <>
      <Header />
      <Description />
      <Tracks />
      <div className="first-block" id="section3">
        <h2>Dance! (Or Try To)</h2>
        <WebcamStream />
      </div>
    </>
  );
}

export default App;