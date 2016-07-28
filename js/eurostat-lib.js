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
			for (var param in params) {
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
		if(dict.MK) dict.MK = "Macedonia (FYRM)";
	};

	EstLib.isGeoAggregate = function(geo){
		return geo.indexOf("EA") > -1 || geo.indexOf("EU") > -1 || geo.indexOf("NMS") > -1;
	};

	EstLib.geoComparison = function(geoToNameFun){
		geoToNameFun = geoToNameFun || function(a){return a;};
		return function(g1, g2) {
			if(EstLib.isGeoAggregate(g1) && !EstLib.isGeoAggregate(g2)) return 1;
			if(!EstLib.isGeoAggregate(g1) && EstLib.isGeoAggregate(g2)) return -1;
			var g1_ = geoToNameFun(g1);
			var g2_ = geoToNameFun(g2);
			return g1_.localeCompare(g2_);
		}
	};

	EstLib.geoOrderedList = ["EU","EU28","EU27","EU15","EA","EA19","EA18","NMS12","EA17","EA12","BE","BG","CZ","DK","DE","EE","IE","EL","ES","FR","HR","IT","CY","LV","LT","LU","HU","MT","NL","AT","PL","PT","RO","SI","SK","FI","SE","UK","IS","LI","NO","CH","ME","MK","AL","RS","TR","US","JP","MX"];
	EstLib.geoComparisonEstatPublications = function(g1, g2) { return EstLib.geoOrderedList.indexOf(g1) - EstLib.geoOrderedList.indexOf(g2); };

	//build geolist
	EstLib.buildGeoList = function(geoList, geos, geoToNameFun, geoValue, changeFun, width, height){
		geoToNameFun = geoToNameFun || function(a){return a;};

		//sort by name
		geos.sort(EstLib.geoComparison(geoToNameFun));

		//sort aggregates and countries
		var geosA = [], geosC = [];
		for(var i=0; i<geos.length; i++)
			if(EstLib.isGeoAggregate(geos[i]))
				geosA.push(geos[i]);
			else
				geosC.push(geos[i]);

		//build option group for aggregates
		var optgroupA = $("<optgroup>").attr("label", "European aggregates").appendTo(geoList);
		for(i=0; i<geosA.length; i++)
			$("<option>").attr("value",geosA[i]).text( geoToNameFun(geosA[i]) ).appendTo(optgroupA);

		//build option group for countries
		var optgroupC = $("<optgroup>").attr("label", "Countries").appendTo(geoList);
		for(i=0; i<geosC.length; i++)
			$("<option>").attr("value",geosC[i]).text( geoToNameFun(geosC[i]) ).appendTo(optgroupC);

		$('#geoList option[value='+geoValue+']').attr('selected', 'selected');
		geoList
			.selectmenu({change:changeFun,width:width||"auto"})
			.selectmenu("menuWidget").css("height",(height||200)+"px");
	};

	EstLib.countryCodes3To2 = {AUT:"AT",BEL:"BE",CHE:"CH",CYP:"CY",CZE:"CZ",DEU:"DE",EST:"EE",GRC:"EL",HRV:"HR",FRA:"FR",HUN:"HU",IRL:"IE",ISL:"IS",LTU:"LT",LUX:"LU",LVA:"LV",MKD:"MK",MLT:"MT",NLD:"NL",NOR:"NO",SVN:"SI",BGR:"BG",DNK:"DK",ESP:"ES",POL:"PL",ITA:"IT",PRT:"PT",ROU:"RO",ROM:"RO",SVK:"SK",FIN:"FI",SWE:"SE",GBR:"UK",TUR:"TR",MNE:"ME",SRB:"RS",USA:"US"};

	EstLib.buildTimeSlider = function(sli, times, timeValue, labelInterval, changeFun){
		sli.slider({
			min: +times[0],
			max: +times[times.length-1],
			step: 1,
			value: timeValue,
			change: changeFun
			//slide: function() { timeSel= ""+sli.slider("value"); update(); }
		}).each(function() {
			var opt = $(this).data().uiSlider.options;
			var www = opt.max - opt.min;
			for (var i = opt.min; i <= opt.max; i+=labelInterval)
				sli.append( $('<label>' + i + '</label>').css('left', ((i-opt.min)/www*100) + '%') );
		});
	};


}(jQuery, window.EstLib = window.EstLib || {} ));
