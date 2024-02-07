import { FunctionComponent } from "react";
import { TlsCipherSuiteDTO } from "dto-types";
import CipherItem from "./CipherItem";

interface Props {
  ciphers: TlsCipherSuiteDTO[];
}

const ClientCiphers: FunctionComponent<Props> = ({ ciphers }) => {
  return (
    <ul className="">
      {ciphers.map((cipher) => (
        <li>
          <CipherItem key={cipher.hex_value_uint16} cipher={cipher} />
        </li>
      ))}
    </ul>
  );
};

export default ClientCiphers;
