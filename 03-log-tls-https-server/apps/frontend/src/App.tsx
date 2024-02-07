import { useState } from "react";
import "./App.css";
import { TlsCipherSuiteDTO } from "dto-types";
import { sampleClientCiphers } from "./data/sampleClientCiphers";
import ClientCiphers from "./components/ClientCiphers";

function App() {
  const [count, setCount] = useState(0);
  const [ciphers, setCiphers] = useState<TlsCipherSuiteDTO[]>([]);

  async function getTlsInfo() {
    let ciphers: TlsCipherSuiteDTO[] = [];
    const tlsInfoRes = await fetch("/my-cipher-suites");
    if (
      tlsInfoRes.ok &&
      tlsInfoRes.headers.get("Content-Type") === "application/json; charset=utf-8"
    ) {
      ciphers = (await tlsInfoRes.json()) as TlsCipherSuiteDTO[];
    } else {
      ciphers = sampleClientCiphers;
    }
    setCiphers(ciphers);
  }

  return (
    <>
      {/* <Section dataList={ciphers} /> */}
      <div className="h-[450px] m-2">
        <ClientCiphers ciphers={ciphers} />
      </div>

      <div>
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>

        <button className="ml-2" onClick={getTlsInfo}>
          Load tls info
        </button>
      </div>
    </>
  );
}

export default App;
