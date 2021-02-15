import { useD2 } from "../Context";
import { generateUid } from "../utils";
import IndicatorDetails from "./IndicatorDetails";
import { func } from "../Computations";

const NewIndicator = () => {
  const d2 = useD2();
  const id = generateUid();

  const fetchApi = `async function fetchApi(url) {
      const response = await fetch("${d2.Api.getApi().baseUrl}/"+url);
      return response.json();
    }`;
  const call = `call(parameters.pe, parameters.ou, parameters.rule,fetchApi,true)`;

  const fn = `${func}
    ${fetchApi}
    ${call}
    `;

  const template = {
    id,
    name: "",
    description: "",
    rules: [
      {
        id: generateUid(),
        type: "FUNCTION_RULE",
        name: "",
        description: "",
        isDefault: false,
        numerator: "",
        denominator: "",
        countUnits: true,
      },
    ],
    created: new Date(),
    lastUpdated: new Date(),
    href: `${d2.Api.getApi().baseUrl}/${id}`,
    function: fn,
  };

  return <IndicatorDetails indicator={template} type="NEW" />;
};

export default NewIndicator;
