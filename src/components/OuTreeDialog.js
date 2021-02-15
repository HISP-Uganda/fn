import OrgUnitDialog from "@dhis2/d2-ui-org-unit-dialog";
import { Button } from "antd";
import { useState } from "react";
import { useD2 } from "../Context";

const OuTreeDialog = ({
  toggleDialog,
  initial,
  open,
  onOrgUnitSelect,
  levels,
  groups,
  root,
}) => {
  const d2 = useD2();
  const [level, setLevel] = useState();
  const [group, setGroup] = useState();
  const [selected, setSelected] = useState(initial);
  const [userOrgUnits, setUserOrgUnits] = useState([]);

  const onLevelChange = (event) => {
    setLevel(event.target.value);
  };
  const onGroupChange = (event) => {
    setGroup(event.target.value);
  };

  const onDeselectAllClick = () => {
    setSelected([]);
  };

  const handleUserOrgUnitClick = (event, checked) => {
    if (checked) {
      setUserOrgUnits([...userOrgUnits, { id: event.target.name }]);
    } else {
      setUserOrgUnits(userOrgUnits.filter((ou) => ou.id !== event.target.name));
    }

    if (userOrgUnits.length > 0) {
      setSelected([]);
    }
  };

  const handleOrgUnitClick = (event, orgUnit) => {
    if (selected.some((ou) => ou.path === orgUnit.path)) {
      setSelected(selected.filter((ou) => ou.path !== orgUnit.path));
    } else {
      setSelected([
        ...selected,
        {
          id: orgUnit.id,
          displayName: orgUnit.displayName,
          path: orgUnit.path,
        },
      ]);
    }
  };

  const handleMultipleOrgUnitsSelect = (children) => {
    const selected = [
      ...selected,
      ...children.map((orgUnit) => ({
        id: orgUnit.id,
        displayName: orgUnit.displayName,
        path: orgUnit.path,
      })),
    ];
    setSelected(selected);
  };

  const onOk = () => {
    onOrgUnitSelect({ selected, userOrgUnits, level, group });
    toggleDialog();
  };

  return (
    <div>
      <div style={{ paddingLeft: 10 }}>
        <Button
          size="large"
          htmlType="button"
          type="primary"
          onClick={toggleDialog}
        >
          Select org units
        </Button>
      </div>
      <OrgUnitDialog
        open={open}
        root={root}
        d2={d2}
        selected={selected}
        userOrgUnits={userOrgUnits}
        level={level}
        group={group}
        levelOptions={levels}
        groupOptions={groups}
        onLevelChange={onLevelChange}
        onGroupChange={onGroupChange}
        onDeselectAllClick={onDeselectAllClick}
        handleUserOrgUnitClick={handleUserOrgUnitClick}
        handleOrgUnitClick={handleOrgUnitClick}
        handleMultipleOrgUnitsSelect={handleMultipleOrgUnitsSelect}
        deselectAllTooltipBackgroundColor="#E0E0E0"
        deselectAllTooltipFontColor="#000000"
        displayNameProperty={"displayName"}
        onClose={toggleDialog}
        onUpdate={onOk}
        checkboxColor="secondary"
        maxWidth="lg"
      />
    </div>
  );
};

export default OuTreeDialog;
