import { Button, Col, Form, Input, Row } from "antd";
import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useD2 } from "../Context";
import { useIndicator } from "../Queries";
import Expression from "./Expression";
import IndicatorTable from "./IndicatorTable";
import OuTreeDialog from "./OuTreeDialog";
import PeriodDialog from "./PeriodDialog";
import { call } from "../Computations";

const { TextArea } = Input;

const IndicatorDetails = () => {
  const [numDialogOpen, setNumDialogOpen] = useState(false);
  const [denDialogOpen, setDenDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const { id } = useParams();
  const history = useHistory();
  const d2 = useD2();
  const { status, data, error, isFetching } = useIndicator(d2, id);
  const [form] = Form.useForm();

  const toggleDialog = () => {
    setOpen(!open);
  };

  const togglePeriodDialog = () => {
    setPeriodDialogOpen(!periodDialogOpen);
  };

  const onClose = () => {
    setPeriodDialogOpen(false);
  };

  const onOrgUnitSelect = (data) => {
    console.log(data);
  };

  const onPeriodSelect = (data) => {
    console.log(data);
  };

  const cancel = () => {
    history.push("/");
  };

  const update = (key, field, value) => {
    const rules = form.getFieldValue("rules");
    Object.assign(rules[key], { [field]: value });
    form.setFieldsValue({ rules });
  };

  const openNumDialog = () => {
    setNumDialogOpen(true);
  };

  const closeNumDialog = () => {
    setNumDialogOpen(false);
  };

  const okNumDialog = (value, index) => {
    update(index, "numerator", value);
    closeNumDialog();
  };

  const openDenDialog = () => {
    setDenDialogOpen(true);
  };

  const closeDenDialog = () => {
    setDenDialogOpen(false);
  };

  const okDenDialog = (value, index) => {
    update(index, "denominator", value);
    closeDenDialog();
  };

  const fetchApi = async (url) => {
    const api = d2.Api.getApi();
    return await api.get(url);
  };

  const preview = async () => {
    await call(
      "THIS_YEAR",
      "O6uvpzGd5pu;fdc6uOvgoji",
      { numerator: "OU_LEVEL{3}", denominator: "OU_LEVEL{4}" },
      fetchApi
    );
  };

  if (status === "loading") {
    return <div>Loading</div>;
  } else if (status === "error") {
    return <div>{error.message}</div>;
  } else {
    return (
      <>
        <Form
          layout="vertical"
          size="large"
          form={form}
          name="details"
          initialValues={data}
        >
          <Row>
            <Col span={12}>
              <Form.Item name="name" label="Indicator Name">
                <Input />
              </Form.Item>

              <Form.Item name="description" label="Indicator Description">
                <TextArea rows={6} style={{ fontSize: "16px" }} />
              </Form.Item>

              <Form.List name="rules">
                {(fields) => (
                  <>
                    {fields.map((field) => (
                      <div
                        style={{ display: "flex", marginBottom: 20 }}
                        key={field.fieldKey}
                      >
                        <Form.Item
                          name={[field.name, "numerator"]}
                          fieldKey={[field.fieldKey, "numerator"]}
                        >
                          <Expression
                            initial={data.rules[field.fieldKey].numerator}
                            index={field.fieldKey}
                            openDialog={openNumDialog}
                            dialogOpen={numDialogOpen}
                            okDialog={okNumDialog}
                            closeDialog={closeNumDialog}
                            title="Numerator"
                            okButtonProps={{}}
                            style={{}}
                          />
                        </Form.Item>
                        <Form.Item
                          style={{ marginLeft: "auto" }}
                          name={[field.name, "denominator"]}
                          fieldKey={[field.fieldKey, "denominator"]}
                        >
                          <Expression
                            initial={data.rules[field.fieldKey].denominator}
                            index={field.fieldKey}
                            openDialog={openDenDialog}
                            dialogOpen={denDialogOpen}
                            okDialog={okDenDialog}
                            closeDialog={closeDenDialog}
                            title="Denominator"
                            okButtonProps={{}}
                            style={{}}
                          />
                        </Form.Item>
                      </div>
                    ))}
                  </>
                )}
              </Form.List>
              <div style={{ display: "flex" }}>
                <Button htmlType="button" onClick={cancel}>
                  Cancel
                </Button>
                <Button style={{ marginLeft: "auto" }}>Save Indicator</Button>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ display: "flex", marginTop: 30 }}>
                <PeriodDialog
                  dialogOpened={periodDialogOpen}
                  onClose={onClose}
                  togglePeriodDialog={togglePeriodDialog}
                  onUpdate={onPeriodSelect}
                />
                <OuTreeDialog
                  open={open}
                  toggleDialog={toggleDialog}
                  onOrgUnitSelect={onOrgUnitSelect}
                />
                <Button
                  htmlType="button"
                  type="primary"
                  onClick={preview}
                  style={{ marginLeft: "auto" }}
                >
                  View
                </Button>
              </div>
              <div
                style={{
                  overflow: "auto",
                  marginTop: 20,
                  marginBottom: 20,
                }}
              >
                <IndicatorTable />
              </div>
            </Col>
          </Row>
        </Form>
        <div>{isFetching ? "Background Updating..." : " "}</div>
      </>
    );
  }
};

export default IndicatorDetails;
