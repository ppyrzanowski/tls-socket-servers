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
          <li>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </section>
  );
};

export default Section;
