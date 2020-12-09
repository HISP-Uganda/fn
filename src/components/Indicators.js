import { Button } from "antd";
import React from "react";
import { useHistory } from "react-router-dom";
import { useD2 } from "../Context";
import { useIndicators } from "../Queries";
import { generateUid } from "../utils";
import Indicator from "./Indicator";

const Indicators = () => {
  const histrory = useHistory();
  const d2 = useD2();
  const { status, data, isFetching } = useIndicators(d2);

  const addIndicator = async () => {
    const id = generateUid();
    try {
      const namespace = await d2.dataStore.get("functions");
      namespace.set(id, {
        id,
        name: "",
        description: "",
        rules: [
          {
            id: generateUid(),
            type: "FUNCTION_RULE",
            name: "",
            description: "",
            isDefault: false,
            numerator: "",
            denominator: "",
          },
        ],
        created: new Date(),
        lastUpdated: new Date(),
        href: `http://localhost:8080/api/dataStore/functions/${id}`,
        function: "",
      });
    } catch (error) {
      const namespace = await d2.dataStore.create("functions");
      namespace.set(id, { id });
    }
    histrory.push(`/indicators/${id}`);
  };

  return (
    <div>
      {status === "loading" ? (
        "Loading..."
      ) : status === "error" ? (
        <Button onClick={() => addIndicator()}>Add Indicator</Button>
      ) : (
        <>
          <div>
            {data.map((id) => (
              <Indicator id={id} key={id} />
            ))}
          </div>
          <div>{isFetching ? "Background Updating..." : " "}</div>
          <Button onClick={() => addIndicator()}>Add Indicator</Button>
        </>
      )}
    </div>
  );
};

export default Indicators;
