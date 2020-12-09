import React from "react";
import { Table } from "antd";
import { useD2 } from "../Context";
import { useDataElements } from "../Queries";

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
  const { status, data, isFetching } = useDataElements(d2);

  if (status === "loading") {
    return <div>Loading</div>;
  }
  if (status === "error") {
    return <div>{error.message}</div>;
  }
  return (
    <Table
      dataSource={data.dataElements}
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
  );
};

export default DataElementTable;
