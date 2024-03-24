import { ConfigProvider, List } from "antd";
import { useState } from "react";
import { Search } from "../Search/Search";
import styles from "./StandartList.module.css";

export const StandartList = ({ items, searchHint, setSelected }) => {
  const openEditModal = (value) => {
    if (setSelected) setSelected(value);
  };

  const isEmpty = items?.length === 0;

  // const optionsArray = items.map(
  //   (item) => new Object({ label: item.title, value: item.title })
  // );

  const handleSearchSelect = (value) => {
    setSelected(value)
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          List: {
            titleMarginBottom: 0,
          },
          Pagination: {
            itemBg: "#000",
            itemInputBg: "#000",
            itemLinkBg: "#000",
          },
        },
      }}
    >
      {/* {!isEmpty && (
        <Search
          suffix
          style={
            !searchHint ? { marginBottom: 45, width: 300 } : { width: 200 }
          }
          hint={searchHint}
          options={items.map(
            (item) => new Object({ value: item.id, label: item.title })
          )}
          handleSelect={handleSearchSelect}
        />
      )} */}
      <List
        className={styles.container}
        pagination={
          items.length < 10
            ? false
            : {
                position: "bottom",
                align: "start",
                total: items.length || 10,
                showSizeChanger: false,
              }
        }
        dataSource={items}
        renderItem={(item, index) => (
          <List.Item style={{ borderRadius: 6, padding: 0 }}>
            <List.Item.Meta
              title={
                <div
                  style={{ display: "block", padding: "12px 16px" }}
                  onClick={() => openEditModal(item)}
                >
                  {item.title}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </ConfigProvider>
  );
};
