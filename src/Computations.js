// async function fetchApi(url, credentials = null) {
//   const response = await fetch(url, {});
//   return await response.json();
// }
import _ from "lodash";

async function fetchAnalyticsStructure(periods, orgs, fetchApi) {
  return await fetchApi(
    `analytics.json?dimension=pe:${periods}&dimension=ou:${orgs}&skipData=true&hierarchyMeta=true`
  );
}

async function fetchOrganisationsByGroups(allGroups, fetchApi) {
  return await fetchApi(
    `organisationUnitGroups.json?filter=id:in:[${allGroups}]&fields=id,organisationUnits[id]&paging=false`
  );
}

async function fetchOrganisationsByLevels(allGroups, fetchApi) {
  return await fetchApi(
    `organisationUnits.json?filter=level:in:[${allGroups}]&fields=id,level&paging=false`
  );
}

async function fetchAnalyticsData(allDataElements, periods, ous, fetchApi) {
  return await fetchApi(
    `analytics.json?dimension=pe:${periods}&dimension=ou:${ous}&dimension=dx:${allDataElements}&hierarchyMeta=true`
  );
}

export async function call(periods, orgs, rule, fetchApi) {
  try {
    let num = rule.numerator;
    let den = rule.denominator;
    const indicatorId = rule.id;
    const dummy = await fetchAnalyticsStructure(periods, orgs, fetchApi);

    const dimensions = dummy.metaData.dimensions;

    const numeratorDataElements = num.match(/#{\w+.?\w*}/g);
    const denominatorDataElements = den.match(/#{\w+.?\w*}/g);

    const numeratorGroups = num.match(/OU_GROUP{\w+.?\w*}/g);
    const denominatorGroups = den.match(/OU_GROUP{\w+.?\w*}/g);

    const numeratorLevels = num.match(/OU_LEVEL{\w+.?\w*}/g);
    const denominatorLevels = den.match(/OU_LEVEL{\w+.?\w*}/g);

    let allDataElements = [];
    let allGroups = [];
    let allLevels = [];

    if (numeratorDataElements) {
      const des = numeratorDataElements.map((de) => {
        const replacement = de.replace("#{", "").replace("}", "");
        const we = replacement.replace(".", "");
        num = num.replace(de, `obj['${we}']`);
        return replacement;
      });
      allDataElements = _.concat(allDataElements, des);
    }

    if (denominatorDataElements) {
      const des = denominatorDataElements.map(function (de) {
        const replacement = de.replace("#{", "").replace("}", "");
        const we = replacement.replace(".", "");
        den = den.replace(de, `obj['${we}']`);
        return replacement;
      });
      allDataElements = _.concat(allDataElements, des);
    }

    if (numeratorGroups) {
      const gps = numeratorGroups.map(function (oug) {
        const replacement = oug.replace("OU_GROUP{", "").replace("}", "");
        num = num.replace(
          oug,
          `!!filterGroups.${replacement}.find(function(x){return obj.ou.indexOf(x) !== -1})`
        );
        return replacement;
      });
      allGroups = _.concat(allGroups, gps);
    }

    if (denominatorGroups) {
      const gps = denominatorGroups.map((oug) => {
        const replacement = oug.replace("OU_GROUP{", "").replace("}", "");
        den = den.replace(
          oug,
          `!!filterGroups.${replacement}.find(function(x){return obj.ou.indexOf(x) !== -1})`
        );
        return replacement;
      });
      allGroups = _.concat(allGroups, gps);
    }

    if (numeratorLevels) {
      const levels = numeratorLevels.map((level) => {
        const replacement = level.replace("OU_LEVEL{", "").replace("}", "");
        num = num.replace(
          level,
          `!!filterLevels['${replacement}'].find(function(x){return obj.ou.indexOf(x) !== -1})`
        );
        return replacement;
      });
      allLevels = _.concat(allLevels, levels);
    }

    if (denominatorLevels) {
      const levels = denominatorLevels.map((level) => {
        const replacement = level.replace("OU_LEVEL{", "").replace("}", "");
        den = den.replace(
          level,
          `!!filterLevels['${replacement}'].find(function(x){return obj.ou.indexOf(x) !== -1})`
        );
        return replacement;
      });
      allLevels = _.concat(allLevels, levels);
    }

    let filterGroups = {};
    let filterLevels = {};

    if (allGroups.length > 0) {
      const groups = await fetchOrganisationsByGroups(allGroups.join(","));
      const processedGroups = groups.organisationUnitGroups.map(function (gp) {
        const units = gp.organisationUnits.map(function (o) {
          return o.id;
        });
        return [gp.id, units];
      });
      filterGroups = _.fromPairs(processedGroups);
    }

    if (allLevels.length > 0) {
      const { organisationUnits } = await fetchOrganisationsByLevels(
        allLevels.join(","),
        fetchApi
      );

      filterLevels = _.groupBy(organisationUnits, "level");
    }

    if (rule.level) {
      orgs = `${orgs};${rule.level}`;
    }

    const data = await fetchAnalyticsData(
      allDataElements.join(";"),
      periods,
      orgs,
      fetchApi
    );

    const whatToGroup = data.rows.map(function (r) {
      const obj = _.fromPairs([
        [r[0].replace(".", ""), parseFloat(r[3])],
        ["pe", r[1]],
        ["ou", `${data.metaData.ouHierarchy[r[2]]}/${r[2]}`],
      ]);
      return obj;
    });

    const grouped = _.groupBy(whatToGroup, function (x) {
      return `${x.pe}${x.ou}`;
    });

    const searches = _.keys(grouped).map(function (x) {
      const val = grouped[x];
      const obj = Object.assign.apply(Object, val);
      const what = _.pick(obj, ["pe", "ou"]);
      what.numerator = eval(num) ? 1 : 0;
      what.denominator = eval(den) ? 1 : 0;
      return what;
    });

    const pp = dimensions.ou.map(function (o) {
      return _(
        searches.filter(function (s) {
          return s.ou.indexOf(o) !== -1;
        })
      )
        .groupBy("pe")
        .map((objs, key) => {
          console.log(objs);
          const numerator = _.sumBy(objs, "numerator");
          const denominator = _.sumBy(objs, "denominator");
          let value = 0;

          if (denominator !== 0) {
            value = String(Number((numerator * 100) / denominator).toFixed(2));
          }
          return {
            pe: key,
            value: value,
          };
        })
        .value()
        .map(function (vv) {
          return [indicatorId, vv.pe, o, vv.value];
        });
    });

    // dummy.metaData.items[indicatorId] = {
    //     name: rule.name
    // };
    // dummy.metaData.dimensions.dx = [indicatorId];
    // dummy.rows = _.flatten(pp);
    // dummy.height = _.flatten(pp).length;
    dummy.width = 4;
    dummy.headers = [
      {
        name: "dx",
        column: "Data",
        valueType: "TEXT",
        type: "java.lang.String",
        hidden: false,
        meta: true,
      },
      {
        name: "pe",
        column: "Period",
        valueType: "TEXT",
        type: "java.lang.String",
        hidden: false,
        meta: true,
      },
      {
        name: "ou",
        column: "Organisation unit",
        valueType: "TEXT",
        type: "java.lang.String",
        hidden: false,
        meta: true,
      },
      {
        name: "value",
        column: "Value",
        valueType: "NUMBER",
        type: "java.lang.Double",
        hidden: false,
        meta: false,
      },
    ];
    // parameters.success(dummy);
    console.log(dummy);
  } catch (e) {
    console.log(e);
    // parameters.error({});
  }
}

// call(parameters.pe, parameters.ou, parameters.rule);
