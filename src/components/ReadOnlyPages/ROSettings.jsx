import { Flex, Space, Form, Input } from "antd";
import { Search } from "../UI/Search/Search";
import { PageHeader } from "../PageHeader/PageHeader";
import { colors, routes } from "../../consts";
import { Link } from "react-router-dom";
import { DisplayedParameters } from "../DisplayedParameters/DisplayedParameters";
import { AbstractParamWidget } from "../AbstractParamWidget";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";

export const ROSettings = ({ customer }) => {
  const { width } = useGetCurrentSize();

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        vertical={width < 1035}
        gap={"small"}
      >
        <PageHeader title="Settings" margin />
        <AbstractParamWidget />
      </Flex>

      <Form
        layout="vertical"
        size="large"
        style={{ marginTop: 40 }}
        initialValues={{ name: customer.name }}
      >
        <Flex justify="space-between" wrap="wrap">
          <Form.Item
            name="name"
            label="Name"
            style={{ width: width < 525 ? "100%" : "45%" }}
          >
            <Input placeholder="Enter Customer Name" disabled />
          </Form.Item>
          <Flex
            style={{ width: width < 525 ? "100%" : "45%" }}
            gap="middle"
            align="end"
          >
            <Form.Item label="Mixer" style={{ width: "100%" }}>
              <Search
                disabled
                defaultValue={{
                  label: customer.mixer.name,
                  value: customer.mixer.id,
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Flex>
        </Flex>

        <Flex justify="space-between" wrap="wrap">
          <Form.Item
            label="Active status"
            style={{ width: width < 525 ? "100%" : "45%" }}
          >
            <Search
              disabled
              defaultValue={
                customer.activeStatus
                  ? { label: "Active", value: "active" }
                  : { label: "Inactive", value: "inactive" }
              }
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Flex
            style={{ width: width < 525 ? "100%" : "45%" }}
            gap="middle"
            align="end"
          >
            <Form.Item label="Cutting fluid" style={{ width: "100%" }}>
              <Search
                disabled
                defaultValue={{
                  label:
                    width < 525
                      ? customer.cuttingFluid.name?.slice(0, width / 50) + "..."
                      : customer.cuttingFluid.name,
                  value: customer.cuttingFluid.id,
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Flex>
        </Flex>
        <DisplayedParameters params={customer.displayedParameters} readOnly/>
      </Form>
    </>
  );
};
