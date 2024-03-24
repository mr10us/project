import { cloneElement } from "react";
import { Button, Flex, Space, Spin } from "antd";
import { PlusSquareFilled } from "@ant-design/icons";
import { PageHeaderLayout } from "../../layouts/PageHeaderLayout";
import { Link } from "react-router-dom";
import { colors } from "../../consts";
import styles from "./PageHeader.module.css";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";

/**
 * Accepts page title and buttons array of objects with name, onClick handler, and link fields.
 * @param {Object} { title, buttons }
 */

const sizes = {
  LARGE: (title) => <h1>{title}</h1>,
  MEDIUM: (title) => <h2>{title}</h2>,
  SMALL: (title) => <h3>{title}</h3>,
};

export const PageHeader = ({ title, buttons, size, margin }) => {
  const renderTitle = sizes[size?.toUpperCase()] || sizes.LARGE;
  const { width } = useGetCurrentSize();

  const fontSize = () => {
    switch (size) {
      case "large": {
        if (width < 485) return { fontSize: 14 };
        return { fontSize: 18 };
      }
      case "middle": {
        if (width < 485) return { fontSize: 14 };
        return { fontSize: 16 };
      }
      case "small": {
        if (width < 485) return { fontSize: 12 };
        return { fontSize: 14 };
      }
      default:
        return { fontSize: 16 };
    }
  };

  const imageFontSize = () => {
    switch (size) {
      case "large": {
        if (width < 485) return { fontSize: 18 };
        return { fontSize: 24 };
      }
      case "middle": {
        if (width < 485) return { fontSize: 14 };
        return { fontSize: 18 };
      }
      case "small": {
        if (width < 485) return { fontSize: 12 };
        return { fontSize: 14 };
      }
      default:
        return { fontSize: 18 };
    }
  };

  return (
    <PageHeaderLayout margin={margin}>
      <Flex wrap="wrap" align="center" gap="large">
        {renderTitle(title)}
        <Flex wrap="wrap" gap="middle" align="center">
          {buttons &&
            buttons.map((button, idx) => {
              if (button.loading) return <Spin spinning key={button.name} />;
              if (button.hidden) return null;
              if (button.element) return button.element;
              if (button.link)
                return (
                  <Link to={button.link} key={button.name || idx}>
                    <Space className={styles.linkContainer} align="center">
                      {button.icon ? (
                        cloneElement(button.icon, {
                          style: {
                            ...imageFontSize(),
                            ...button.icon.props.style,
                          },
                        })
                      ) : (
                        <PlusSquareFilled
                          style={{ ...imageFontSize(), color: colors.blue }}
                        />
                      )}

                      <p style={fontSize()}>{button.name}</p>
                    </Space>
                  </Link>
                );
              else
                return (
                  <Button
                    key={button.name || idx}
                    type="link"
                    icon={
                      button.icon ? (
                        cloneElement(button.icon, {
                          style: {
                            ...imageFontSize(),
                            ...button.icon.props.style,
                            padding: 0,
                          },
                        })
                      ) : (
                        <PlusSquareFilled style={imageFontSize()} />
                      )
                    }
                    style={{ ...fontSize(), padding: 0 }}
                    className="addBtn"
                    onClick={button.handler || null}
                  >
                    {button.name || ""}
                  </Button>
                );
            })}
        </Flex>
      </Flex>
    </PageHeaderLayout>
  );
};
