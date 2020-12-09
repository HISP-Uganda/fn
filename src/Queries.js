import { useQuery, useMutation } from "react-query";
export function useIndicators(d2) {
  const api = d2.Api.getApi();
  return useQuery(
    "indicators",
    async () => {
      return await api.get("dataStore/functions");
    },
    { retryDelay: 1000, refetchOnWindowFocus: false }
  );
}

export function useIndicator(d2, id) {
  const api = d2.Api.getApi();
  return useQuery(
    ["concept", { id }],
    async () => {
      return await api.get(`dataStore/functions/${id}`);
    },
    { refetchOnWindowFocus: false }
  );
}

export function useDataElements(d2) {
  const api = d2.Api.getApi();
  return useQuery(
    "dataElements",
    async () => {
      return await api.get("dataElements", {
        paging: false,
        fields: "id,name,code,categoryCombo[categoryOptionCombos[id,name]]",
        filter: "domainType:eq:AGGREGATE",
      });
    },
    { refetchOnWindowFocus: false }
  );
}

export function useOUGroups(d2) {
  const api = d2.Api.getApi();
  return useQuery(
    "organisationUnitGroups",
    async () => {
      return await api.get("organisationUnitGroups", {
        fields: "id,name,code",
        paging: false,
      });
    },
    { refetchOnWindowFocus: false }
  );
}

export function useOULevels(d2) {
  const api = d2.Api.getApi();
  return useQuery(
    "filledOrganisationUnitLevels",
    async () => {
      return await api.get("filledOrganisationUnitLevels", {
        fields: "id,name,code,level",
        paging: false,
      });
    },
    { refetchOnWindowFocus: false }
  );
}

export function useRootTree(d2) {
  return useQuery(
    "rootUnit",
    async () => {
      const rootCollection = await d2.models.organisationUnits.list({
        paging: false,
        level: 1,
        fields: `id,path,displayShortName~rename(displayName),children::isNotEmpty`,
      });

      const collection = await d2.models.organisationUnitLevels.list({
        paging: false,
      });

      const groupsCollection = await d2.models.organisationUnitGroups.list({
        fields: `id,displayShortName~rename(displayName)`,
        paging: false,
      });
      const levels = collection.toArray();
      const groups = groupsCollection.toArray();
      const root = rootCollection.toArray()[0];

      return { levels, groups, root };
    },
    { refetchOnWindowFocus: false }
  );
}

export const indexConcept = (d2) => async (indicator) => {
  const namespace = await d2.dataStore.get("functions");
  return namespace.set(indicator.id, indicator);
};
