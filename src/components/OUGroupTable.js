import { Table, Input } from "antd";
import React, { useState, useEffect } from "react";
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
  const { status, data } = useOUGroups(d2);

  const [organisationUnitGroups, setOrganisationUnitGroups] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (data) {
      setOrganisationUnitGroups(data.organisationUnitGroups);
    }
  }, [data]);

  const filterOrganisationUnitGroups = (e) => {
    const value = e.target.value;
    setSearch(value);
    setOrganisationUnitGroups(
      data.organisationUnitGroups.filter((ele) =>
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
        onChange={filterOrganisationUnitGroups}
      />
      <Table
        dataSource={organisationUnitGroups}
        columns={columns}
        rowKey="id"
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handlePadClick(`OU_GROUP{${record.id}}`),
          };
        }}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default OUGroupTable;
