import { Table } from "antd";
import React from "react";
import { useD2 } from "../Context";
import { useOULevels } from "../Queries";

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

const organisationColumns = [
  ...columns,
  {
    title: "Level",
    dataIndex: "level",
    key: "level",
  },
];

const OULevelTable = ({ handlePadClick }) => {
  const d2 = useD2();
  const { status, data } = useOULevels(d2);

  if (status === "loading") {
    return <div>Loading</div>;
  }
  if (status === "error") {
    return <div>{error.message}</div>;
  }
  return (
    <Table
      dataSource={data}
      onRow={(record, rowIndex) => {
        return {
          onClick: () => handlePadClick(`OU_LEVEL{${record.level}}`),
        };
      }}
      columns={organisationColumns}
      rowKey="id"
      size="default"
      pagination={false}
    />
  );
};

export default OULevelTable;
