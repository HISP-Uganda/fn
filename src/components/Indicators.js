import { Button } from "antd";
import React from "react";
import { useHistory } from "react-router-dom";
import { useD2 } from "../Context";
import { useIndicators } from "../Queries";
import Indicator from "./Indicator";

const Indicators = () => {
  const histrory = useHistory();
  const d2 = useD2();
  const { status, data } = useIndicators(d2);

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
        <Indicator indicators={data} />
        <Button size="large" onClick={() => addIndicator()}>
          Add Indicator
        </Button>
      </>
    );
  }
};

export default Indicators;
