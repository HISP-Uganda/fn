import React, { useState } from "react";
import { Tabs, Modal, Button, Input, Row, Col, Form } from "antd";
import DataElementTable from "./DataElementTable";
import OUGroupTable from "./OUGroupTable";
import OULevelTable from "./OULevelTable";

const { TabPane } = Tabs;
const { TextArea } = Input;

const Expression = ({
  initial,
  index,
  openDialog,
  dialogOpen,
  okDialog,
  closeDialog,
  title,
  style,
  okButtonProps = {},
}) => {
  const [form] = Form.useForm();
  const [selectionEnd, setSelectionEnd] = useState(0);
  const handlePadClick = (id) => {
    if (selectionEnd === 0) {
      form.setFieldsValue({
        expression: id + form.getFieldValue("expression"),
      });
      setSelectionEnd(form.getFieldValue("expression").length);
    } else if (selectionEnd === form.getFieldValue("expression").length) {
      form.setFieldsValue({
        expression: form.getFieldValue("expression") + id,
      });
      setSelectionEnd(form.getFieldValue("expression").length);
    } else {
      const startString =
        form.getFieldValue("expression").substring(0, selectionEnd) + id;
      const endString = form
        .getFieldValue("expression")
        .substring(selectionEnd, form.getFieldValue("expression").length);
      form.setFieldsValue({ expression: startString + endString });
      setSelectionEnd(startString.length);
    }
  };

  const onConditionClick = (event) => {
    setSelectionEnd(event.target.selectionStart);
  };

  const onOk = async () => {
    try {
      await form.validateFields();
      okDialog(condition, index);
      // form.resetFields();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={style}>
      <div>
        <Button
          size="large"
          htmlType="button"
          type="primary"
          onClick={openDialog}
        >
          {title}
        </Button>
      </div>
      <Modal
        title="Adding Condition"
        visible={dialogOpen}
        onOk={onOk}
        onCancel={closeDialog}
        width="90%"
        maskClosable={false}
        destroyOnClose
        okButtonProps={{ ...okButtonProps, size: "large" }}
        cancelButtonProps={{ size: "large" }}
        align={null}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{ expression: initial }}
        >
          <Row>
            <Col span={12} style={{ paddingRight: 5 }}>
              <Form.Item
                label="Expression"
                rules={[{ required: true }]}
                name="expression"
              >
                <TextArea rows={4} onClick={onConditionClick} />
              </Form.Item>

              <Button onClick={() => handlePadClick("&&")}>AND</Button>
              <Button onClick={() => handlePadClick("||")}>OR</Button>
              <Button onClick={() => handlePadClick("!")}>NOT</Button>
              <Button onClick={() => handlePadClick("!=")}>NOT EQUAL</Button>
            </Col>
            <Col span={12} style={{ paddingLeft: 5 }}>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Data Elements" key="1">
                  <DataElementTable handlePadClick={handlePadClick} />
                </TabPane>
                <TabPane tab="Organisation Groups" key="2">
                  <OUGroupTable handlePadClick={handlePadClick} />
                </TabPane>
                <TabPane tab="Organisation Levels" key="3">
                  <OULevelTable handlePadClick={handlePadClick} />
                </TabPane>
              </Tabs>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Expression;
