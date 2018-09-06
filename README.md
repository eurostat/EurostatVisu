EurostatVisu
======

EurostatVisu is a web visualisation project of [Eurostat](http://ec.europa.eu/eurostat/) data (mainly). The visualisations currently available are the following:

- [Income disparities in European countries](http://eurostat.github.io/EurostatVisu/income_distr.html). Focus on [country comparison](http://eurostat.github.io/EurostatVisu/income_distr_2.html)
- [Economy's twists and turns](http://eurostat.github.io/EurostatVisu/crisis_route.html)
- [Population map](https://bl.ocks.org/jgaffuri/raw/0d6e1b1c6f9e1297829f38b9c37737fe/?proj=3035&lvl=3&w=1000&s=20M&time=2016) of Europe, based on [Nuts2json](https://github.com/eurostat/Nuts2json/blob/gh-pages/README.md) API
<!--- [//]: # (- [Fishing quotas](http://eurostat.github.io/EurostatVisu/fq/quotas.html) repartition accross countries and fishing zones) -->
- [Government expenditure by function](http://eurostat.github.io/EurostatVisu/cofog_sunburst.html) based on the [COFOG classification](http://ec.europa.eu/eurostat/statistics-explained/index.php/Glossary:Classification_of_the_functions_of_government_(COFOG)).
- The COICOP classification as [sunburst](http://eurostat.github.io/EurostatVisu/coicop_sunburst_5.html) and [star tree](http://eurostat.github.io/EurostatVisu/coicop_hierarchy.html)
- Household expenditures composition, [detailled by product](http://eurostat.github.io/EurostatVisu/coicop_sunburst.html) and [evolution accross time](http://eurostat.github.io/EurostatVisu/coicop_time_stack.html)
- [Price time series](http://eurostat.github.io/EurostatVisu/timeser.html)<!--- . Focus on [food prices](http://eurostat.github.io/EurostatVisu/FPMT_timeser.html) -->
- [GDP evolution in Europe](http://eurostat.github.io/EurostatVisu/driving_forces.html?geo=DE,FR,IT,ES,PT,PL,EL)

## Technical details

Data are accessed using the [Eurostat REST webservice](http://ec.europa.eu/eurostat/web/json-and-unicode-web-services/getting-started/rest-request) for [JSON-stat](https://json-stat.org/) data. The data are decoded and queried using [JSON-stat library](https://json-stat.com/). The visualisations are built using mainly [eurostat.js](https://github.com/eurostat/eurostat.js) and [D3](https://d3js.org/) libraries. Maps based on <a href="http://ec.europa.eu/eurostat/web/nuts/overview" target="_blank">NUTS regions</a> rely on [eurostat-map.js](https://github.com/eurostat/eurostat.js) and [Nuts2json] (https://github.com/eurostat/Nuts2json/blob/gh-pages/README.md) API.

## Support and contribution

Feel free to [ask support](https://github.com/eurostat/EurostatVisu/issues/new), fork the project or simply star it (it's always a pleasure).
