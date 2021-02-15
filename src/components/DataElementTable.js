import { Input, Table } from "antd";
import { useD2 } from "../Context";
import { useDataElements } from "../Queries";
import { useState } from "react";
import { useEffect } from "react";

const columns = [
  {
    title: "UID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
];

const dataElementColumns = [
  {
    title: "Code",
    dataIndex: "code",
    key: "code",
  },
  ...columns,
];

const DataElementTable = ({ handlePadClick }) => {
  const d2 = useD2();
  const { status, data, isFetching, error } = useDataElements(d2);
  const [dataElements, setDataElements] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (data) {
      setDataElements(data.dataElements);
    }
  }, [data]);

  const filterDataElements = (e) => {
    const value = e.target.value;
    setSearch(value);
    setDataElements(
      data.dataElements.filter((ele) =>
        String(ele.name).toLowerCase().includes(String(value).toLowerCase())
      )
    );
  };

  if (status === "loading") {
    return <div>Loading</div>;
  }
  if (status === "error") {
    return <div>{error.message}</div>;
  }

  return (
    <div>
      <Input
        style={{ marginBottom: 10 }}
        value={search}
        onChange={filterDataElements}
      />
      <Table
        dataSource={dataElements}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handlePadClick(`#{${record.id}}`),
          };
        }}
        columns={dataElementColumns}
        rowKey="id"
        expandedRowRender={(dataElement) => (
          <Table
            rowKey="id"
            dataSource={dataElement.categoryCombo.categoryOptionCombos}
            onRow={(record, rowIndex) => {
              return {
                onClick: () =>
                  handlePadClick(`#{${dataElement.id}.${record.id}}`),
              };
            }}
            columns={columns}
            pagination={false}
          />
        )}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default DataElementTable;
