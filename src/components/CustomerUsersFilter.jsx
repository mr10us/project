import { StandartFilter } from "./UI/Filters/StandartFilter/StandartFilter";
import { Evaluation } from "./Evaluation";
import { useTranslation } from 'react-i18next';
import { useGetCurrentLang } from "../hooks/useGetCurrentLang";

export const CustomerUsersFilter = ({setQuery}) => {
  const { t } = useTranslation();
  const currentLang = useGetCurrentLang();


  const filterItems = [
    {
      key: "order by",
      type: "ordering",
      label: t("filter.by.order"),
      children: (
        <StandartFilter.Radio
          buttons={[
            { value: "+name", name: t("filter.options.+name") },
            { value: "-name", name: t("filter.options.-name") },
            { value: "+level", name: t("filter.options.+level") },
            { value: "-level", name: t("filter.options.-level") },
          ]}
        />
      ),
    },
    {
      key: "status",
      type: "is_active",
      label: t("filter.by.status"),
      children: (
        <StandartFilter.Radio
          buttons={[
            { value: "+active", name: t("filter.options.active") },
            { value: "-active", name: t("filter.options.inactive") },
          ]}
        />
      ),
    },
    {
      key: "level",
      type: "notify_level",
      label: t("filter.by.level"),
      children: (
        <StandartFilter.Checkbox
          buttons={[
            { value: "good", children: <Evaluation type="good" text /> },
            {
              value: "suspicious",
              children: <Evaluation type="suspicious" text />,
            },
            { value: "warning", children: <Evaluation type="warning" text /> },
            {
              value: "critical",
              children: <Evaluation type="critical" text />,
            },
          ]}
        />
      ),
    },
  ];

  return <StandartFilter filterItems={filterItems} setQuery={setQuery} />;
};
