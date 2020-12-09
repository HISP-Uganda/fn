import React from "react";
import { Link } from "react-router-dom";
import { useD2 } from "../Context";
import { useIndicator } from "../Queries";

const Indicator = ({ id }) => {
  const d2 = useD2();
  const { status, data, error, isFetching } = useIndicator(d2, id);
  return (
    <div>
      {status === "loading" ? (
        "Loading..."
      ) : status === "error" ? (
        <div>{error.message}</div>
      ) : (
        <>
          <Link to={`/indicators/${id}`}>{data.id}</Link>
          <div>{isFetching ? "Background Updating..." : " "}</div>
        </>
      )}
    </div>
  );
};

export default Indicator;
