import { Table } from "antd";
import React from "react";
import { useD2 } from "../Context";
import { useOUGroups } from "../Queries";

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

const OUGroupTable = ({ handlePadClick }) => {
  const d2 = useD2();
  const { status, data, isFetching } = useOUGroups(d2);

  if (status === "loading") {
    return <div>Loading</div>;
  }
  if (status === "error") {
    return <div>{error.message}</div>;
  }
  return (
    <Table
      dataSource={data.organisationUnitGroups}
      columns={columns}
      rowKey="id"
      onRow={(record, rowIndex) => {
        return {
          onClick: () => handlePadClick(`OU_GROUP{${record.id}}`),
        };
      }}
      pagination={{ pageSize: 5 }}
    />
  );
};

export default OUGroupTable;
