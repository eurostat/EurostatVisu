/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
    $(function() {

        var quantiles = ["PERCENTILE100","PERCENTILE99","PERCENTILE98","PERCENTILE97","PERCENTILE96","PERCENTILE95","DECILE10","DECILE9","DECILE8","DECILE7","DECILE6","DECILE5","DECILE4","DECILE3","DECILE2","DECILE1","PERCENTILE5","PERCENTILE4","PERCENTILE3","PERCENTILE2","PERCENTILE1"];

        $.when(
            //get income distribution data
            $.ajax({url:EstLib.getEstatDataURL("ilc_di01",{currency:"EUR",indic_il:"SHARE",quantile:quantiles})})
        ).then(function(data) {

                //simplify geo labels
                EstLib.overrideCountryNames(data.dimension.geo.category.label);

                //decode data
                data = JSONstat(data).Dataset(0);

                var getGeoSelection = function(){ return "FR"; }; //TODO get from UI
                var getTimeSelection = function(){ return "2015"; }; //TODO get from UI

                var updateChart = function(){
                    var geoSel = getGeoSelection();
                    var timeSel = getTimeSelection();

                    //TODO clear chart
                    //TODO draw chart
                };

                //TODO add geo list
                //TODO add time slider

            }, function() {
                console.log("Could not load data");
            }
        );
    });
}(jQuery));
