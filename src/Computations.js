export const func = `
function groupBy( array , f ){
  var groups = {};
  array.forEach( function( o ){
    var group = JSON.stringify( f(o) );
    groups[group] = groups[group] || [];
    groups[group].push( o );
  });
  return Object.keys(groups).map( function( group ){
    return groups[group];
  });
}

Array.prototype.unique = function() {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

async function fetchAnalyticsStructure(periods, orgs, fetchApi) {
  return await fetchApi(
    "analytics.json?dimension=pe:" +
      periods +
      "&dimension=ou:" +
      orgs +
      "&skipData=true&hierarchyMeta=true"
  );
}

async function fetchMax() {
  const response = await fetchApi("organisationUnitLevels.json?order=level:desc&pageSize=1&fields=level");
  return response.organisationUnitLevels[0].level;
}

async function fetchOrganisations(orgs, allGroups, periods, fetchApi) {
  const requests = allGroups.map(function (gp) {
    return fetchAnalyticsStructure(periods, gp + ";" + orgs, fetchApi);
  });
  const results = await Promise.all(requests);
  const processed = results.map(function (data, index) {
    return [
      allGroups[index],
      data.metaData.dimensions["ou"].map(function (ou) {
        return data.metaData.ouHierarchy[ou] + "/" + ou;
      }),
    ];
  });
  return Object.fromEntries(processed);
}

async function fetchAnalyticsData(allDataElements, periods, ous, fetchApi) {
  return await fetchApi(
    "analytics.json?dimension=pe:" +
      periods +
      "&dimension=ou:" +
      ous +
      "&dimension=dx:" +
      allDataElements +
      "&hierarchyMeta=true"
  );
}

async function call(periods, orgs, rule, fetchApi, addParams = false) {
  try {
    const maxLevel = await fetchMax();

    let num = rule.numerator;
    let den = rule.denominator;
    const countUnits = rule.countUnits;
    const indicatorId = rule.id;
    const dummy = await fetchAnalyticsStructure(periods, orgs, fetchApi);
    const dimensions = dummy.metaData.dimensions;

    const numeratorDataElements = num.match(/#{\\w+.?\\w*}/g);
    const denominatorDataElements = den.match(/#{\\w+.?\\w*}/g);

    const numeratorGroups = num.match(/OU_GROUP{\\w+.?\\w*}/g);
    const denominatorGroups = den.match(/OU_GROUP{\\w+.?\\w*}/g);

    const numeratorLevels = num.match(/OU_LEVEL{\\w+.?\\w*}/g);
    const denominatorLevels = den.match(/OU_LEVEL{\\w+.?\\w*}/g);

    let allDataElements = [];
    let numeratorUnits = [];
    let denominatorUnits = [];

    if (numeratorDataElements) {
      const des = numeratorDataElements.map((de) => {
        const replacement = de.replace("#{", "").replace("}", "");
        num = num.replace(de, "obj['" + replacement + "']");
        return replacement;
      });
      allDataElements = allDataElements.concat(des);
    }

    if (denominatorDataElements) {
      const des = denominatorDataElements.map(function (de) {
        const replacement = de.replace("#{", "").replace("}", "");
        den = den.replace(de, "obj['" + replacement + "']");
        return replacement;
      });
      allDataElements = allDataElements.concat(des);
    }

    if (numeratorGroups) {
      const gps = numeratorGroups.map(function (oug) {
        const replacement = oug
          .replace("OU_GROUP{", "OU_GROUP-")
          .replace("}", "");
        num = num.replace(
          oug,
          "ous['"+replacement+"'].find(function(x){return obj.ou.indexOf(x) !== -1})"
        );
        return replacement;
      });
      numeratorUnits = numeratorUnits.concat(gps);
    }

    if (denominatorGroups) {
      const gps = denominatorGroups.map((oug) => {
        const replacement = oug
          .replace("OU_GROUP{", "OU_GROUP-")
          .replace("}", "");
        den = den.replace(
          oug,
          "ous['"+replacement+"'].find(function(x){return obj.ou.indexOf(x) !== -1})"
        );
        return replacement;
      });
      denominatorUnits = denominatorUnits.concat(gps);
    }

    if (numeratorLevels) {
      const levels = numeratorLevels.map((level) => {
        const replacement = level
          .replace("OU_LEVEL{", "LEVEL-")
          .replace("}", "");
        num = num.replace(
          level,
          "ous['"+replacement+"'].find(function(x){return obj.ou.indexOf(x) !== -1})"
        );
        return replacement;
      });
      numeratorUnits = numeratorUnits.concat(levels);
    }

    if (denominatorLevels) {
      const levels = denominatorLevels.map((level) => {
        const replacement = level
          .replace("OU_LEVEL{", "LEVEL-")
          .replace("}", "");
        den = den.replace(
          level,
          "ous['"+replacement+"'].find(function(x){return obj.ou.indexOf(x) !== -1})"
        );
        return replacement;
      });
      denominatorUnits = denominatorUnits.concat(levels);
    }

    let ous = {};
    let units = orgs;

    let numeratorData = [];
    let denominatorData = [];
    const allOrganisations = numeratorUnits.concat(denominatorUnits);

    if (allOrganisations.length > 0) {
      ous = await fetchOrganisations(orgs, allOrganisations, periods, fetchApi);
      units = units + ";" + allOrganisations.join(";");

      if(numeratorUnits.length > 0){
        const nums = {};

        Object.keys(ous).filter(function(sob){
          return numeratorUnits.some(function(key){
              return sob === key;
          });
        }).forEach(function (key) {
          nums[key] = ous[key];
        });

        const otherDataNum = Array.from(new Set(Object.values(nums).flat()));
        numeratorData = dimensions.pe.map(function (pe) {
          return otherDataNum
            .map(function (ou) {
              return { pe: pe, ou: ou };
            })
            .flat();
        }).flat();
      }

      if(denominatorUnits.length > 0){
        const dens = {};
        Object.keys(ous).filter(function(sob){
          return denominatorUnits.some(function(key){
              return sob === key;
          });
        }).forEach(function (key) {
          dens[key] = ous[key];
        });
        const otherDataDen = Array.from(new Set(Object.values(dens).flat()));
        denominatorData = dimensions.pe.map(function (pe) {
          return otherDataDen
            .map(function (ou) {
              return { pe: pe, ou: ou };
            })
            .flat();
        }).flat();
      }
    } else {
      units = units + ";LEVEL-" + maxLevel;
    }

    if (allDataElements.length > 0) {
      const response = await fetchAnalyticsData(
        allDataElements.unique().join(";"),
        periods,
        units,
        fetchApi
      );

      const analyticsData = response.rows.map(function (r) {
        const obj = Object.fromEntries([
          [r[0], parseFloat(r[3])],
          ["pe", r[1]],
          ["ou", response.metaData.ouHierarchy[r[2]] + "/" + r[2]],
        ]);
        return obj;
      });

      const results = groupBy(analyticsData, function(item){
        return [item.pe, item.ou];
      }).map(function(re){
        return re.reduce(function(result, current) {
          return Object.assign(result, current);
        }, {});
      });

      if (numeratorDataElements !== null) {
        numeratorData = results;
      }
      if (denominatorDataElements !== null) {
        denominatorData = results;
      }
    }
    const numerators = numeratorData.filter(function (obj) {
      return eval(num);
    });

    const denominators = denominatorData.filter(function (obj) {
      return eval(den);
    });

    const pp = dimensions.ou.map(function (ou) {
      return dimensions.pe.map(function (pe) {
        const num = numerators.filter(function (n) {
          return n.pe === pe && String(n.ou).indexOf(ou) !== -1;
        });

        const den = denominators.filter(function (n) {
          return n.pe === pe && String(n.ou).indexOf(ou) !== -1;
        });

        let indicator = 0;

        if(countUnits){
          const n = Array.from(new Set(num.map(function(p){return p.ou}))).length;
          const d = Array.from(new Set(den.map(function(p){return p.ou}))).length;

          if(d !== 0){
            indicator = Number((n*100)/d).toFixed(2);
          }
        }
        return [indicatorId, pe, ou, indicator];
      });
    });

    dummy.metaData.items[indicatorId] = {
      name: rule.name,
    };
    dummy.metaData.dimensions.dx = [indicatorId];
    dummy.rows = pp.flat();
    dummy.height = pp.flat().length;
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
    if (addParams) {
      parameters.success(dummy);
    } else {
      return dummy;
    }
  } catch (e) {
    if (addParams) {
      parameters.error({});
    } else {
      console.log(e);
    }
  }
}`;
