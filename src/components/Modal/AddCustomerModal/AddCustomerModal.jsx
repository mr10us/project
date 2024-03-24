import { useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { useForm } from "antd/es/form/Form";

export const AddCustomerModal = ({ open, setOpen }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOk = () => {
    setConfirmLoading(true);
    // запрос на сервак
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
  };
  const handleCancel = () => {
    setOpen(false);
  };

  const modalContainer = {
    padding: "30px 50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 25,
  };
  const [form] = useForm();

  return (
    <Modal
      open={open}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      centered
      styles={{ body: modalContainer }}
    >
      <Form
        form={form}
        name="addCustomer"
        layout="vertical"
        style={{ width: "80%" }}
        initialValues={{
          name: "",
          mixer: "Choose Mixer",
          cuttingFluid: "Choose Fluid",
        }}
      >
        <h1 style={{textAlign: "center"}}>Add User</h1>
        <Form.Item label="Name" name={"name"}>
          <Input />
        </Form.Item>
        <Form.Item label="Mixer" name={"mixer"}>
          <Select
            options={[
              { value: "samsung", label: "Samsung" },
              { value: "apple", label: "Apple" },
              { value: "xiaomi", label: "Xiaomi" },
            ]}
          />
        </Form.Item>
        <Form.Item label="Cutting fluid" name={"cuttingFluid"}>
          <Select
            options={[
              { value: "samsung", label: "Samsung" },
              { value: "apple", label: "Apple" },
              { value: "xiaomi", label: "Xiaomi" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
