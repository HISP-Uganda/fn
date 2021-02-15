import { useEffect, useState } from "react";
import { useQueries, useMutation } from "react-query";
import { Popconfirm, Table, Button } from "antd";
import { useD2, useStore } from "../Context";
import { deleteIndicator, getIndicator } from "../Queries";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

const Indicator = observer(() => {
  const d2 = useD2();
  const [data, setData] = useState([]);
  const store = useStore();
  const { mutateAsync } = useMutation(deleteIndicator(d2));

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
            onConfirm={() => deleteCurrentIndicator(id)}
          >
            <Button type="text" style={{ color: "red" }}>
              Delete
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  const deleteCurrentIndicator = async (id) => {
    await mutateAsync(id);
    store.removeIndicator(id);
  };

  const indicatorQueries = useQueries(
    store.indicators.map((indicator) => {
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
});

export default Indicator;
