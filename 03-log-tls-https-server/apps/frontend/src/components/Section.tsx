import { TlsCipherSuiteDTO } from "dto-types";
import { FunctionComponent } from "react";

type Props = {
  dataList: TlsCipherSuiteDTO[];
};

const Section: FunctionComponent<Props> = (props) => {
  return (
    <section>
      <ul>
        {props.dataList.map((item) => (
          <li>
            <code>
              {item.hex_value_str} {item.description} {item.reference}
            </code>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Section;
