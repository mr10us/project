import React from "react";
import { ConfigProvider, Collapse } from "antd";
import { useDispatch } from "react-redux";
import { changeLang } from "../features/CurrentLang/currentLang";
import { colors } from "../consts";


export const RenderMenuItem = ({ item, handleCloseDrawer }) => {
  const dispatch = useDispatch();

  if (Array.isArray(item?.children) && item?.children.length > 0) {
    const items = [
      {
        label: item.label,
        key: item.key,
        children: item?.children
          ? item.children.map((child) => (
              <RenderMenuItem
                key={child.key}
                item={child}
                handleCloseDrawer={handleCloseDrawer}
              />
            ))
          : null,
      },
    ];

    return (
      <ConfigProvider
        theme={{
          token: {
            colorText: colors.blue,
          },
          components: {
            Collapse: {
              contentPadding: 1,
              headerBg: "transparent",
              contentBg: "transparent",
            },
          },
        }}
      >
        <Collapse
          accordion
          key={item.key}
          ghost
          size="small"
          style={{ margin: "15px 0", fontWeight: 500 }}
          items={items}
        />
      </ConfigProvider>
    );
  } else {
    const isNotReactElement = typeof item.label === "string";

    return (
      <div
        key={item.key}
        style={{
          margin: "15px 0",
        }}
      >
        {isNotReactElement
          ? React.createElement("p", {
              style: { display: "block", padding: "8px 12px 8px 8px" },
              onClick: () => {
                dispatch(changeLang(item.key));
                handleCloseDrawer();
              },
              children: (
                <>
                  {item?.icon} {item.label}
                </>
              ),
            })
          : item.label &&
            React.cloneElement(item.label, {
              style: { display: "block", padding: "8px 12px 8px 8px" },
              onClick: handleCloseDrawer,
              children: (
                <>
                  {item?.icon} {item.label?.props?.children}
                </>
              ),
            })}
      </div>
    );
  }
};
