EurostatVisu
======

EurostatVisu is a web visualisation project of [Eurostat](http://ec.europa.eu/eurostat/) data (mainly). The visualisations currently available are the following:

- [Income disparities in European countries](http://jgaffuri.github.io/EurostatVisu/income_distr.html). Focus on [country comparison](http://jgaffuri.github.io/EurostatVisu/income_distr_2.html)
- [Economy's twists and turns](http://jgaffuri.github.io/EurostatVisu/crisis_route.html)
- [Population map](http://jgaffuri.github.io/EurostatVisu/population_map.html?lvl=3&time=2014&s=1200&proj=laea) of Europe, based on [Nuts2json](https://github.com/jgaffuri/Nuts2json/blob/gh-pages/README.md) datasets
- [Fishing quotas](http://jgaffuri.github.io/EurostatVisu/fq/quotas.html) repartition accross countries and fishing zones
- [Government expenditure by function](http://jgaffuri.github.io/EurostatVisu/cofog_sunburst.html) based on the [COFOG classification](http://unstats.un.org/unsd/cr/registry/regcst.asp?Cl=4).
- The COICOP classification as [sunburst](http://jgaffuri.github.io/EurostatVisu/coicop_sunburst_5.html) and [star tree](http://jgaffuri.github.io/EurostatVisu/coicop_hierarchy.html)
- Household expenditures composition, [detailled by product](http://jgaffuri.github.io/EurostatVisu/coicop_sunburst.html) and [evolution accross time](http://jgaffuri.github.io/EurostatVisu/coicop_time_stack.html)
- [Price time series](http://jgaffuri.github.io/EurostatVisu/timeser.html). Focus on [food prices](http://jgaffuri.github.io/EurostatVisu/FPMT_timeser.html)
- [GDP evolution in Europe](http://jgaffuri.github.io/EurostatVisu/driving_forces.html?geo=DE,FR,IT,UK,ES,PT,PL,EL)

## Technical details

Data are accessed using the [Eurostat REST webservice](http://ec.europa.eu/eurostat/web/json-and-unicode-web-services/getting-started/rest-request) for [JSON-stat](https://json-stat.org/) data. The data are decoded and queried using [JSON-stat library](https://json-stat.com/). The visualisations are built using mainly [JQuery](https://jquery.com/) and [D3](https://d3js.org/) libraries. Maps based on <a href="http://ec.europa.eu/eurostat/web/nuts/overview" target="_blank">NUTS regions</a> rely on [Nuts2json](https://github.com/jgaffuri/Nuts2json/blob/gh-pages/README.md).

## Support and contribution

Feel free to [ask support](https://github.com/jgaffuri/EurostatVisu/issues/new), fork the project or simply star it (it's always a pleasure).
