import { PeriodDimension } from "@dhis2/analytics";
import { Button, Modal } from "antd";
import { useState } from "react";
import * as PropTypes from "prop-types";

const PeriodDialog = ({
  d2,
  togglePeriodDialog,
  dialogOpened,
  onClose,
  onUpdate,
  initial,
}) => {
  const [selectedPeriods, setSelectedPeriods] = useState(initial);
  const onOk = () => {
    onUpdate(selectedPeriods);
    togglePeriodDialog();
  };
  const onDeselect = () => {
    setSelectedPeriods([]);
  };

  const onSelect = (sss) => {
    setSelectedPeriods([sss]);
  };

  return (
    <>
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
      <Modal
        title="Period Selector"
        visible={dialogOpened}
        onOk={onOk}
        onCancel={onClose}
        centered
        width="700px"
      >
        <PeriodDimension
          selectedPeriods={selectedPeriods}
          onSelect={onSelect}
        />
      </Modal>
    </>
  );
};

PeriodDialog.propTypes = {
  d2: PropTypes.object.isRequired,
};

export default PeriodDialog;
