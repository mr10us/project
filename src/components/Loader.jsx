import { Flex, Spin } from "antd";
import { colors } from "../consts";
import { useState, useEffect } from "react";
import { ExclamationCircleFilled } from "@ant-design/icons";

export const Loader = ({ isLoading }) => {
  return (
    <Flex justify="center" align="center"
      style={{
        width: "100%",
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        padding: 40,
      }}
    >
      <Spin spinning={isLoading} size>
        {/* <Alert
        type="info"
        message={message?.title || DEFAULT_TITLE}
        description={message?.details || DEFAULT_DESC}
      /> */}
      </Spin>
    </Flex>
  );
};
