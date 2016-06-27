/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
	$(function() {
		//http://www.nytimes.com/interactive/2013/10/09/us/yellen-fed-chart.html?_r=0

		$.when(
				//get inflation data
				$.ajax({url:EstLib.getEstatDataURL("prc_hicp_manr",{unit:"RCH_A",coicop:"CP00"})}),
				//get unemployment data
				$.ajax({url:EstLib.getEstatDataURL("une_rt_m",{age:"TOTAL",sex:"T",s_adj:"NSA",unit:"PC_ACT"})}) //TODO use seasonal adjusted?
		).then(function(inflationData, unemploymentData) {

			//decode data
			inflationData = JSONstat(inflationData).Dataset(0);
			unemploymentData = JSONstat(unemploymentData).Dataset(0);

			//function to compute intersection of two arrays
			var intersection = function(array1,array2){ return array1.filter(function(n) { return array2.indexOf(n) != -1; }); }

			//get time and geo
			var months = intersection(inflationData.Dimension("time").id, unemploymentData.Dimension("time").id)
			var geos = intersection(inflationData.Dimension("geo").id, unemploymentData.Dimension("geo").id)

			//build chart
			//TODO

		}, function() {
			console.log("Could not load data");
		}
		);
	});
}(jQuery));
