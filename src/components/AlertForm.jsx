import {
  Form,
  Input,
  Select,
  Flex,
  Upload,
  Modal,
  message,
  Divider,
  Checkbox,
  App,
} from "antd";
import { alertLevels } from "../consts";
import { Evaluation } from "./Evaluation";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { uploadMedia } from "../http/packetsApi";
import { useGetCurrentSize } from "../hooks/useGetCurrentSize";
import { findNestedValue } from "../utils/findNestedValue";
import { useTranslation } from "react-i18next";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const isValidLevel = (level) => {
  return Object.values(alertLevels).includes(level) && level;
};

export const AlertForm = ({ alert, readOnly, onChange }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const [alertData, setAlertData] = useState(alert);

  const [fileList, setFileList] = useState(alert?.media || []);

  const { t } = useTranslation();
  const { width } = useGetCurrentSize();
  const { message } = App.useApp();

  const handleCancel = () => setPreviewOpen(false);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };
  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const handleMediaUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadMedia(formData);

      if (response) {
        onSuccess(response.id);
      } else {
        onError(new Error(response));
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
      onError(error);
    }
  };

  const alertArr = Object.values(alertLevels);

  const searchOptions = alertArr.map((alert) => {
    return new Object({
      label: <Evaluation type={alert} text />,
      value: alert,
    });
  });

  const handleChangeLevel = (level) => {
    setAlertData((prev) => ({ ...prev, level: level }));
  };
  const handleChangeTitle = (title) => {
    setAlertData((prev) => ({ ...prev, title: title }));
  };
  const handleChangeDescription = (description) => {
    setAlertData((prev) => ({ ...prev, description: description }));
  };
  const handleChangeRecommendation = (recommendation) => {
    setAlertData((prev) => ({ ...prev, recommendation: recommendation }));
  };
  const handleChangeRecommendationState = (recommendation_done) => {
    if (!alertData?.recommendation) {
      message.error(t("rules.recommendation_done"));
      return;
    }
    setAlertData((prev) => ({
      ...prev,
      recommendation_done: recommendation_done,
    }));
  };
  const handleChangeMedia = (media) => {
    setAlertData((prev) => ({ ...prev, media: media }));
  };

  useEffect(() => {
    onChange((prev) =>
      prev.map((item) => {
        if (item.machine.id === alertData.machine.id) {
          if (!item?.level) alertData.level = "suspicious";
          return alertData;
        }
        return item;
      })
    );
  }, [alertData]);

  useEffect(() => {
    handleChangeMedia(fileList.map((media) => media));
  }, [fileList]);

  return (
    <>
      <Flex justify="space-between" gap="large" wrap="wrap">
        <Form.Item
          name={"alertTitle_" + alertData.machine.id}
          initialValue={alertData?.title || ""}
          label={t("labels.title")}
          style={{ width: width < 1000 ? "100%" : "75%" }}
          rules={[{ required: true, message: t("rules.title") }]}
        >
          <Input
            disabled={readOnly}
            onChange={(e) => handleChangeTitle(e.target.value)}
            placeholder={t("placeholders.title")}
          />
        </Form.Item>
        <Form.Item
          label={t("labels.level")}
          style={{ width: width < 1000 ? "100%" : "20%" }}
        >
          <Select
            disabled={readOnly}
            value={isValidLevel(alertData?.level) || "suspicious"}
            options={searchOptions}
            onChange={handleChangeLevel}
          />
        </Form.Item>
      </Flex>
      <Form.Item
        name={"alertDesc" + alertData.machine.id}
        initialValue={alertData?.description || ""}
        label={t("labels.description")}
        rules={[{ required: true, message: t("rules.description") }]}
      >
        <Input.TextArea
          disabled={readOnly}
          placeholder={t("placeholders.description")}
          rows={4}
          onChange={(e) => handleChangeDescription(e.target.value)}
        />
      </Form.Item>
      <Form.Item>
        <p style={{ marginLeft: 15, marginBottom: 10 }}>{t("labels.media")}</p>
        <Form.Item>
          <Upload
            disabled={readOnly}
            accept="image/*,video/*"
            multiple
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleChange}
            customRequest={handleMediaUpload}
          >
            <div>
              <PlusOutlined />
              <div
                style={{
                  marginTop: 8,
                }}
              >
                {t("buttons.upload")}
              </div>
            </div>
          </Upload>
        </Form.Item>

        <Modal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={handleCancel}
        >
          <img
            alt="uploaded media"
            style={{
              width: "100%",
            }}
            src={previewImage}
          />
        </Modal>
      </Form.Item>
      <Divider />
      <Form.Item label={t("labels.recommendation")} style={{ width: "100%" }}>
        <Input.TextArea
          disabled={readOnly}
          value={alertData?.recommendation || ""}
          placeholder={t("placeholders.recommendation")}
          rows={4}
          onChange={(e) => handleChangeRecommendation(e.target.value)}
        />
      </Form.Item>
      <Form.Item style={{ width: "100%" }}>
        <Checkbox
          disabled={readOnly}
          checked={alertData?.recommendation_done}
          onChange={(e) => handleChangeRecommendationState(e.target.checked)}
          style={{ marginRight: 5 }}
        >
          <span>{t("labels.recommendation_done")}</span>
        </Checkbox>
      </Form.Item>
    </>
  );
};
