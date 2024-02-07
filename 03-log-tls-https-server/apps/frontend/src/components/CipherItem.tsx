import { TlsCipherSuiteDTO } from "dto-types";
import { FunctionComponent } from "react";

interface Props {
  cipher: TlsCipherSuiteDTO;
}

const CipherItem: FunctionComponent<Props> = ({ cipher }) => {
  const isRecommendedFragment = cipher.recommended ? (
    <span className="w-4 font-bold font-mono text-green-600">{"\u2713"}</span>
  ) : (
    <span className="w-4 font-bold font-mono text-orange-500">⚠</span>
  );
  return (
    <code className="flex">
      <span className="w-28 text-stone-300">{cipher.hex_value_str}</span>
      <span className="w-16 text-opacity-70 text-right mr-4">{cipher.hex_value_uint16}</span>
      <a className="w-[400px]">
        {cipher.description} {isRecommendedFragment}
      </a>

      <a>{cipher.reference}</a>
    </code>
  );
};

export default CipherItem;
