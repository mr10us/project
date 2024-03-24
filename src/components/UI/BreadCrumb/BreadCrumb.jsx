import { useLocation } from "react-router-dom";
import { Breadcrumb } from "antd";
import buildBreadcrumbs from "../../../utils/breadcrumb";
import { Link } from "react-router-dom";
import { useGetCurrentSize } from "../../../hooks/useGetCurrentSize";

export const BreadCrumb = (props) => {
  const { width } = useGetCurrentSize();
  const { pathname } = useLocation();
  const items = buildBreadcrumbs(pathname);

  const fontSize = width < 565 ? 12 : 16;

  const breadcrumbs = items.map((crumb, index) => {
    if (items[0].title == "Customers" && items.length > 1) {
      if (index === 1 && !isNaN(Number(crumb.title))) {
        const customer = localStorage.getItem("customer");
        if (customer) {
          const customerName = JSON.parse(customer).name;
          return {
            title: (
              <Link to={crumb?.link} style={{ fontSize: fontSize }}>
                {customerName}
              </Link>
            ),
          };
        } else return crumb;
      }
    }
    return {
      title: (
        <Link to={crumb?.link} style={{ fontSize: fontSize }}>
          {crumb.title}
        </Link>
      ),
    };
  });

  // return <div {...props}/>;
  return <Breadcrumb items={breadcrumbs} {...props} />;
};
