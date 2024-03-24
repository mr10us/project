import { EyeFilled } from "@ant-design/icons";
import { Button, Flex, Modal } from "antd";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { colors } from "../consts";
import { getUrl } from "../utils/Measurements/getUrl";
import { useGetCurrentSize } from "../hooks/useGetCurrentSize";
import { useTranslation } from 'react-i18next';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export const PDFViewer = ({ type, id, query, customerID, currentPage=1, showText=true }) => {
  const [numPages, setNumPages] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { t } = useTranslation();
  const { width } = useGetCurrentSize();

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const pdfUrl = getUrl.pdf(type, id, query, customerID, currentPage);

  if (width < 426) {
    return (
      <a href={pdfUrl} style={{ fontSize: 16 }} download={true} target="_blank">
        <Flex align="center" style={{ fontSize: 16, color: colors.blue }}>
          <EyeFilled style={{ marginRight: 5, fontSize: 20 }} />
          {showText && t("buttons.preview")}
        </Flex>
      </a>
    );
  }
  return (
    <>
      <Button type="ghost" onClick={showModal}>
        <Flex
          align="center"
          style={{ fontSize: 16, color: colors.blue, fontWeight: "500" }}
        >
          <EyeFilled style={{ marginRight: 5, fontSize: 20 }} />
          {showText && t("buttons.preview")}
        </Flex>
      </Button>

      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose={true}
        width={660}
      >
        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} />
          ))}
        </Document>
      </Modal>
    </>
  );
};
