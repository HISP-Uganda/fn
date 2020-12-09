import React, { useState } from "react";
import { Button } from "antd";
import PeriodSelectorDialog from "@dhis2/d2-ui-period-selector-dialog";
import { useD2 } from "../Context";

const PeriodDialog = ({
  togglePeriodDialog,
  dialogOpened,
  onClose,
  onUpdate,
}) => {
  const d2 = useD2();
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const onOk = () => {
    onUpdate(selectedPeriods);
    togglePeriodDialog();
  };
  const onDeselect = () => {
    setSelectedPeriods([]);
  };

  const onReorder = () => {};
  return (
    <div>
      <div style={{ paddingRight: 10 }}>
        <Button
          size="large"
          htmlType="button"
          type="primary"
          onClick={togglePeriodDialog}
        >
          Select period
        </Button>
      </div>
      <PeriodSelectorDialog
        d2={d2}
        open={dialogOpened}
        onClose={onClose}
        onUpdate={onOk}
        selectedItems={selectedPeriods}
        onReorder={onReorder}
        onSelect={setSelectedPeriods}
        onDeselect={onDeselect}
      />
    </div>
  );
};

export default PeriodDialog;
