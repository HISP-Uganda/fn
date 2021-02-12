import React, { useEffect, useState } from "react";
import { useQueries, useQueryClient } from "react-query";
import { Popconfirm, Table, Button } from "antd";
import { useD2 } from "../Context";
import { getIndicator } from "../Queries";
import { Link } from "react-router-dom";

const Indicator = ({ indicators }) => {
  const d2 = useD2();
  const [data, setData] = useState([]);
  const [currentIndicators, setCurrentIndicators] = useState(indicators);
  const queryClient = useQueryClient();

  const columns = [
    {
      title: "UID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      key: "name",
      render: (_, { id, name }) => {
        return <Link to={`/indicators/${id}`}>{name}</Link>;
      },
    },
    {
      title: "",
      key: "delete",
      render: (_, { id }) => {
        return (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => deleteIndicator(id)}
          >
            <Button>Delete</Button>
          </Popconfirm>
        );
      },
    },
  ];

  const deleteIndicator = (id) => {
    setCurrentIndicators(indicators.filter((ind) => ind !== id));
    // setData(data.filter((d) => d.id !== id));
  };

  const indicatorQueries = useQueries(
    currentIndicators.map((indicator) => {
      return {
        queryKey: ["indicator", indicator],
        queryFn: () => getIndicator(d2, indicator),
      };
    })
  );

  useEffect(() => {
    setData(indicatorQueries.filter((i) => !!i.data).map((i) => i.data));
  }, [indicatorQueries]);

  return <Table dataSource={data} columns={columns} rowKey="id" />;
};

export default Indicator;
