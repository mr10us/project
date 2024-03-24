import { Form, Flex, Input, Button } from "antd";
import { PageHeader } from "../PageHeader/PageHeader";
import { Search } from "../UI/Search/Search";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";
import { EditFilled } from "@ant-design/icons";

export const ROCustomerMachine = ({ customerMachine }) => {
  const { width } = useGetCurrentSize();

  return (
    <>
      <PageHeader title="Machine" margin />

      {customerMachine.machineName && (
        <Form
          layout="vertical"
          size="large"
          initialValues={{ customer: customerMachine.customerID }}
        >
          <Flex
            align="center"
            gap={width < 425 ? 0 : "large"}
            wrap={width < 425 ? "wrap" : ""}
          >
            <Form.Item
              name="customer"
              label="Customer ID"
              style={{ width: width < 475 ? "100%" : "50%" }}
            >
              <Input disabled placeholder="Enter customer ID" />
            </Form.Item>
            <Flex
              align="end"
              gap={"large"}
              style={{ width: width < 475 ? "100%" : "50%" }}
              justify="space-between"
            >
              <Form.Item label="Model" style={{ width: "100%" }}>
                <Search
                  disabled
                  defaultValue={
                    customerMachine.model?.name && {
                      label: customerMachine.model.name,
                      value: customerMachine.model.id,
                    }
                  }
                />
              </Form.Item>
              <Form.Item style={{ width: "fit-content" }}>
                <Button disabled>
                  <EditFilled />
                  Edit
                </Button>
              </Form.Item>
            </Flex>
          </Flex>

          <Flex
            align="center"
            gap={width < 425 ? 0 : "large"}
            wrap={width < 425 ? "wrap" : ""}
          >
            <Form.Item
              label="Active Status"
              style={{ width: width < 475 ? "100%" : "50%" }}
            >
              <Search
                disabled
                defaultValue={
                  customerMachine.activeStatus
                    ? { label: "Active", value: "active" }
                    : { label: "Inactive", value: "inactive" }
                }
              />
            </Form.Item>
            <Flex
              align="end"
              gap={"large"}
              style={{ width: width < 475 ? "100%" : "50%" }}
              justify="space-between"
            >
              <Form.Item label="Cutting Fluid" style={{ width: "100%" }}>
                <Search
                  disabled
                  defaultValue={
                    customerMachine.cuttingFluid?.name && {
                      label: customerMachine.cuttingFluid.name,
                      value: customerMachine.cuttingFluid.id,
                    }
                  }
                />
              </Form.Item>
              <Form.Item style={{ width: "fit-content" }}>
                <Button disabled>
                  <EditFilled />
                  Edit
                </Button>
              </Form.Item>
            </Flex>
          </Flex>
        </Form>
      )}
    </>
  );
};
