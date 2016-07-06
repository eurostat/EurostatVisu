EurostatVisu
======

EurostatVisu is a web visualisation project of [Eurostat](http://ec.europa.eu/eurostat/) data (mainly). The visualisations currently available are the following:

- [Income disparities in European countries](http://jgaffuri.github.io/EurostatVisu/income_distr.html)
- [Economy’s twists and turns](http://jgaffuri.github.io/EurostatVisu/crisis_route.html)
- [Price levels time series](http://jgaffuri.github.io/EurostatVisu/timeser.html)
- [Country baskets composition, detailled by product](http://jgaffuri.github.io/EurostatVisu/coicop_sunburst.html)
- [Country baskets composition evolution accross time](http://jgaffuri.github.io/EurostatVisu/coicop_time_stack.html)
- [Fishing quotas](http://jgaffuri.github.io/EurostatVisu/fq/quotas.html)
- [The COICOP classification](http://jgaffuri.github.io/EurostatVisu/coicop_hierarchy.html)
- [Food prices time series](http://jgaffuri.github.io/EurostatVisu/FPMT_timeser.html)
- [Inflation table](http://jgaffuri.github.io/EurostatVisu/table1.html)

# Technical details

Data are accessed using the [Eurostat REST webservice](http://ec.europa.eu/eurostat/web/json-and-unicode-web-services/getting-started/rest-request) for [JSON-stat](https://json-stat.org/) data. The data are decoded and queried using [JSON-stat library](https://json-stat.com/). The visualisations are built using [JQuery](https://jquery.com/) and [D3](https://d3js.org/) libraries.
