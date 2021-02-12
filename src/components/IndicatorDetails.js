import { Button, Checkbox, Col, Form, Input, Row } from "antd";
import React, { useState } from "react";
import { useMutation } from "react-query";
import { useHistory } from "react-router-dom";
import { func } from "../Computations";
import { useD2 } from "../Context";
import { indexConcept, useMeta } from "../Queries";
import Expression from "./Expression";
import IndicatorTable from "./IndicatorTable";
import OuTreeDialog from "./OuTreeDialog";
import PeriodDialog from "./PeriodDialog";

const { TextArea } = Input;

const IndicatorDetails = ({ indicator }) => {
  const [numDialogOpen, setNumDialogOpen] = useState(false);
  const [denDialogOpen, setDenDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const history = useHistory();
  const d2 = useD2();
  const { status, data, error, isFetching } = useMeta(d2);
  const { mutate } = useMutation(indexConcept(d2));
  const [form] = Form.useForm();
  const [selectedPeriods, setSelectedPeriods] = useState([
    { id: "LAST_12_MONTHS", name: "Last 12 months", idx: 4 },
  ]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [processedData, setProcessedData] = useState({});
  const [loading, setLoading] = useState(false);
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
    if (data.selected && data.selected.length > 0) {
      setSelectedUnits(data.selected);
    }
  };

  const onPeriodSelect = (data) => {
    setSelectedPeriods(data);
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

  const getIndicatorAndDenominator = () => {
    const rules = form.getFieldValue("rules");
    if (rules && rules.length > 0) {
      return {
        id: rules[0].id,
        name: rules[0].name,
        numerator: rules[0].numerator,
        denominator: rules[0].denominator,
        countUnits: rules[0].countUnits,
      };
    }
    return {
      numerator: "",
      denominator: "",
      countUnits: true,
    };
  };

  const fetchApi = `const fetchApi = async (url) => {
    const api = d2.Api.getApi();
    return await api.get(url);
  };`;

  const preview = async () => {
    setLoading(true);
    const call = `call(
      "${selectedPeriods.map((p) => p.id).join(";")}",
      "${selectedUnits.map((p) => p.id).join(";")}",
      {
        id: "${getIndicatorAndDenominator().id}",
        name: "${getIndicatorAndDenominator().name}",
        numerator: "${getIndicatorAndDenominator().numerator}",
        denominator: "${getIndicatorAndDenominator().denominator}",
        countUnits: ${getIndicatorAndDenominator().countUnits},
      },
      fetchApi,
      false
    )`;
    const fn = `${func}
    ${fetchApi}
    ${call}
    `;
    const indicatorValue = await eval(fn);

    if (indicatorValue) {
      let data = {};

      indicatorValue.rows.forEach((r) => {
        data = { ...data, [`${r[1]}${r[2]}`]: r[3] };
      });

      setProcessedData({
        data,
        periods: indicatorValue.metaData.dimensions.pe,
        units: indicatorValue.metaData.dimensions.ou,
        items: indicatorValue.metaData.items,
      });
    }
    setLoading(false);
  };

  const change = (e) => {
    const rules = form.getFieldValue("rules");
    Object.assign(rules[0], { name: e.target.value });
    form.setFieldsValue({ rules });
  };

  const onFinish = async (values) => {
    mutate(values);
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
          onFinish={onFinish}
          initialValues={indicator}
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item name="id" hidden={true}>
                <Input />
              </Form.Item>
              <Form.Item
                name="name"
                label="Indicator Name"
                rules={[{ required: true }]}
              >
                <Input onChange={change} />
              </Form.Item>

              <Form.Item
                name="description"
                label="Indicator Description"
                rules={[{ required: true }]}
              >
                <TextArea rows={4} style={{ fontSize: "16px" }} />
              </Form.Item>

              <Form.List name="rules" rules={[{ required: true }]}>
                {(fields) => (
                  <>
                    {fields.map((field) => (
                      <div
                        style={{ display: "flex", flexDirection: "column" }}
                        key={field.fieldKey}
                      >
                        <Form.Item
                          name={[field.name, "countUnits"]}
                          fieldKey={[field.fieldKey, "countUnits"]}
                          valuePropName="checked"
                        >
                          <Checkbox>Count Organisation Units</Checkbox>
                        </Form.Item>
                        <div style={{ display: "flex", marginBottom: 20 }}>
                          <Form.Item
                            name={[field.name, "numerator"]}
                            fieldKey={[field.fieldKey, "numerator"]}
                          >
                            <Expression
                              initial={
                                indicator.rules[field.fieldKey].numerator
                              }
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
                              initial={
                                indicator.rules[field.fieldKey].denominator
                              }
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
                      </div>
                    ))}
                  </>
                )}
              </Form.List>
              <Form.Item name="created" hidden={true}>
                <Input />
              </Form.Item>
              <Form.Item name="lastUpdated" hidden={true}>
                <Input />
              </Form.Item>
              <Form.Item name="href" hidden={true}>
                <Input />
              </Form.Item>
              <Form.Item name="function" hidden={true}>
                <Input />
              </Form.Item>
              <div style={{ display: "flex" }}>
                <Button htmlType="button" onClick={cancel}>
                  Cancel
                </Button>
                <Button htmlType="submit" style={{ marginLeft: "auto" }}>
                  Save Indicator
                </Button>
              </div>
            </Col>
            <Col span={16}>
              <div style={{ display: "flex", marginTop: 30 }}>
                <PeriodDialog
                  dialogOpened={periodDialogOpen}
                  onClose={onClose}
                  togglePeriodDialog={togglePeriodDialog}
                  onUpdate={onPeriodSelect}
                  initial={selectedPeriods}
                />
                <OuTreeDialog
                  open={open}
                  toggleDialog={toggleDialog}
                  onOrgUnitSelect={onOrgUnitSelect}
                  root={data.root}
                  levels={data.levels}
                  groups={data.groups}
                  initial={selectedUnits}
                />
                <Button
                  htmlType="button"
                  type="primary"
                  onClick={preview}
                  style={{ marginLeft: "auto" }}
                  disabled={
                    selectedPeriods.length === 0 || selectedUnits.length === 0
                  }
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
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <IndicatorTable data={processedData} />
                )}
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
