import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { useD2 } from "../Context";
import { getIndicator } from "../Queries";
import IndicatorDetails from "./IndicatorDetails";

const IndicatorUpdate = () => {
  const d2 = useD2();
  const { id } = useParams();

  const { isLoading, isError, error, data } = useQuery(
    ["indicator", id],
    () => getIndicator(d2, id),
    {
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return <div>Loading</div>;
  }
  if (isError) {
    return <div>{error.message}</div>;
  }

  return <IndicatorDetails indicator={data} type="EDIT" />;
};

export default IndicatorUpdate;
