/**
 *
 * Generic functions for eurostat statistics
 *
 * @author julien Gaffuri
 *
 */
(function($, EstLib) {

	EstLib.getEstatRestDataURLBase = "http://ec.europa.eu/eurostat/wdds/rest/data/";
	EstLib.getEstatDataURL = function(table, params, language, format, version){
		language = language || "en";
		format = format || "json";
		version = version || "2.1";
		var url = [];
		url.push(EstLib.getEstatRestDataURLBase,"v",version,"/",format,"/",language,"/",table,"?");
		if(params)
			for (param in params) {
				var o = params[param];
				if(Array.isArray(o))
					for(var i=0;i<o.length;i++)
						url.push("&",param,"=",o[i]);
				else url.push("&",param,"=",o);
			}
		url = url.join("");
		//console.log(url);
		return url;
	};

	EstLib.getMonthTXT = function(monthInt){
		return monthInt<=9?"0"+monthInt:""+monthInt;
	};

	//override country names, to shoter ones
	EstLib.overrideCountryNames = function(dict){
		if(dict.EA) dict.EA = "Euro area";
		if(dict.EU) dict.EU = "European Union";
		if(dict.EEA) dict.EEA = "European Economic Area";
		if(dict.DE) dict.DE = "Germany";
	};

	EstLib.isGeoAggregate = function(geo){
		return geo.indexOf("EA") > -1 || geo.indexOf("EU") > -1 || geo.indexOf("NMS") > -1;
	};

	EstLib.geoComparison = function(g1, g2) {
		if(EstLib.isGeoAggregate(g1) && !EstLib.isGeoAggregate(g2)) return 1;
		if(!EstLib.isGeoAggregate(g1) && EstLib.isGeoAggregate(g2)) return -1;
		return g1.localeCompare(g2);
	};


	EstLib.countryCodes3To2 = {
		AUT : "AT",
		BEL : "BE",
		CHE : "CH",
		CYP : "CY",
		CZE : "CZ",
		DEU : "DE",
		EST : "EE",
		GRC : "EL",
		HRV : "HR",
		FRA : "FR",
		HUN : "HU",
		IRL : "IE",
		ISL : "IS",
		LTU : "LT",
		LUX : "LU",
		LVA : "LV",
		MKD : "MK",
		MLT : "MT",
		NLD : "NL",
		NOR : "NO",
		SVN : "SI",
		BGR : "BG",
		DNK : "DK",
		ESP : "ES",
		POL : "PL",
		ITA : "IT",
		PRT : "PT",
		ROU : "RO",
		ROM : "RO",
		SVK : "SK",
		FIN : "FI",
		SWE : "SE",
		GBR : "UK",
		TUR : "TR",
		MNE : "ME",
		SRB : "RS",
		USA : "US"
	};

}(jQuery, window.EstLib = window.EstLib || {} ));
