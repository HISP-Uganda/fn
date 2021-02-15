import { Button } from "antd";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useD2, useStore } from "../Context";
import { useIndicators } from "../Queries";
import Indicator from "./Indicator";

const Indicators = observer(() => {
  const store = useStore();
  const histrory = useHistory();
  const d2 = useD2();
  const { status, data } = useIndicators(d2);

  useEffect(() => {
    if (data) {
      store.setIndicators(data);
    }
  }, [data]);

  const addIndicator = async () => {
    histrory.push(`/new-indicator`);
  };

  if (status === "loading") {
    return <div>Loading</div>;
  } else if (status === "error") {
    return <Button onClick={() => addIndicator()}>Add Indicator</Button>;
  } else {
    return (
      <>
        <Indicator/>
        <Button size="large" onClick={() => addIndicator()}>
          Add Indicator
        </Button>
      </>
    );
  }
});

export default Indicators;
