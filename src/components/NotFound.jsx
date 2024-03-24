import { Result } from "antd";
import { Link } from "react-router-dom";
import { _routes } from "../consts";

export const NotFound = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <a className="btn" href={_routes.CUSTOMERS}>
          Back Home
        </a>
      }
    />
  );
};
