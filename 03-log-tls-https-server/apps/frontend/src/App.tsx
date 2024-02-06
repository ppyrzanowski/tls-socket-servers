import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Section from "./components/Section";
import { TlsCipherSuiteDTO } from "lib";

// interface CipherSuite {
//   value: string;
//   valueHex: string;
//   description: string;
// }

function App() {
  const [count, setCount] = useState(0);

  const [data, setData] = useState<TlsCipherSuiteDTO[]>([]);

  async function getTlsInfo() {
    const tlsInfoRes = await fetch("/tls-info");
    if (!tlsInfoRes.ok) {
      return null;
    }
    const tlsInfo = await tlsInfoRes.json();
    setData(tlsInfo.clientCiphers);
  }

  return (
    <>
      <Section dataList={data} />

      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>

        <button onClick={getTlsInfo}>Load tls info</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
