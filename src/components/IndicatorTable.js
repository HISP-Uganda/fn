import React from "react";

const IndicatorTable = ({ data }) => {
  if (Object.keys(data).length === 0 && data.constructor === Object) {
    return <div>No data</div>;
  }
  return (
    <table style={{ width: "100%", padding: 5 }} border="1">
      <thead>
        <tr>
          <th>Period/Organisation</th>
          {data.periods.map((p) => (
            <th key={p} style={{ textAlign: "center", padding: 5 }}>
              {data.items[p].name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.units.map((o) => (
          <tr key={o}>
            <th style={{ padding: 5 }}>{data.items[o].name}</th>
            {data.periods.map((p) => (
              <td key={p} style={{ textAlign: "center" }}>
                {data.data[`${p}${o}`]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default IndicatorTable;
