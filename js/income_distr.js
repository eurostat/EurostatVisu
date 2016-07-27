/**
 *
 * Generic functions for income distribution visualisations
 *
 * @author julien Gaffuri
 *
 */
(function($, EstLib) {

	//some quantile data
	EstLib.quantileDict = {P:{percentage:1,text:"percent"},T:{percentage:5,text:"twentieth"},F:{percentage:4,text:"twentyfifth"},D:{percentage:10,text:"tenth"}};

	//translation dictionnary
    //TODO add german translation
	EstLib.dictIncomeDistr = {
			en:{
				title:"Income disparities in Europe",
				title1:"Income disparities",
				title2:"in",
				countryText:"Country",
				yearText:"Year",
				avincome:"Average income",
				lowincome:"Lowest incomes",
				higincome:"Highest incomes",
				incomelev:"Income level",
				incomeof:"The income of the",
				ofpopwith:"of the population with the",
				lowest:"lowest",
				highest:"highest",
				incomeis:"income is",
				oftotal:"of the total country income",
				ifincomewas:"If the country income was equally distributed, it would be",
				thisincis:"This income is",
				times:"times",
				higher:"higher",
				lower:"lower",
				thanav:"than the average income",
				percent:"percent",
				twentieth:"twentieth",
				twentyfifth:"twentyfifth",
				tenth:"tenth",
				sourceTxt:"Sources: <a href='http://ec.europa.eu/eurostat/'>Eurostat</a> databases on income distribution (<a href='http://ec.europa.eu/eurostat/web/income-and-living-conditions/overview'>EU-SILC</a>). More information <a href='http://ec.europa.eu/eurostat/statistics-explained/index.php/Income_distribution_statistics'>here</a>.",
				focusCntr:"Focus on country comparison.",
				nodata:"No data"
			},
			fr:{
				title:"Disparités de revenus en Europe",
				title1:"Disparités de revenus",
				title2:"en",
				countryText:"Pays",
				yearText:"Année",
				avincome:"Revenu moyen",
				lowincome:"Bas revenus",
				higincome:"Hauts revenus",
				incomelev:"Niveau de revenu",
				incomeof:"Les revenus du",
				ofpopwith:"de la population avec les",
				lowest:"plus bas",
				highest:"plus hauts",
				incomeis:"revenus est",
				oftotal:"du total des revenus du pays",
				ifincomewas:"Si les revenus étaient équitablement répartis, ce serait",
				thisincis:"Ces revenus sont",
				times:"fois",
				higher:"plus hauts",
				lower:"plus bas",
				thanav:"que le revenu moyen",
				percent:"pourcent",
				twentieth:"vingtième",
				twentyfifth:"vingtcinquième",
				tenth:"dixième",
				sourceTxt:"Sources: Bases de données <a href='http://ec.europa.eu/eurostat/'>Eurostat</a> sur la répartition des revenus (<a href='http://ec.europa.eu/eurostat/web/income-and-living-conditions/overview'>EU-SILC</a>). Plus d'information <a href='http://ec.europa.eu/eurostat/statistics-explained/index.php/Income_distribution_statistics'>ici</a>.",
				focusCntr:"Comparaison par pays.",
				nodata:"Pas de données"
			}
	};

	EstLib.getRectText = function(d, value, lg){
		var html = [], quantileNb = +d.substring(1,d.length), q = EstLib.quantileDict[d.charAt(0)],
		lowestIncome = 100/(quantileNb*q.percentage) >= 2, coeff = value/q.percentage
		dict = EstLib.dictIncomeDistr[lg];
		if(value<0)
			html.push(
					"The income of the <b>", PrVis.getNumbered(lowestIncome?quantileNb:100/q.percentage-quantileNb+1),
					" ", q.text, "</b> of the population with the ",
					lowestIncome?"lowest":"highest", " income is <span style='color: crimson'>negative</span>: <b>",
							value, "%</b> of the total country income."
			);
		else
			html.push(
					dict.incomeof, " <b>",
					PrVis.getNumbered(lowestIncome?quantileNb:100/q.percentage-quantileNb+1, lg),
					" ", dict[q.text], "</b> ",dict.ofpopwith," ", lowestIncome?dict.lowest:dict.highest,
							" ",dict.incomeis," <b>", value, "%</b> ",dict.oftotal,".<br>",
							dict.ifincomewas," <b>", q.percentage, "%</b>. ",dict.thisincis," ",
							coeff>2||coeff<0.5?"<span style='color: crimson'>":"",
									"<b>", Math.round(10*(coeff>1?coeff:1/coeff))/10, " ",dict.times," ",
									coeff>1?dict.higher:dict.lower, "</b>", coeff>2||coeff<0.5?"</span>":"", " ",dict.thanav,"."
			);
		return html.join("");
	};


}(jQuery, window.EstLib = window.EstLib || {} ));

