/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
    $(function() {

        var quantiles = ["PERCENTILE100","PERCENTILE99","PERCENTILE98","PERCENTILE97","PERCENTILE96","PERCENTILE95","DECILE10","DECILE9","DECILE8","DECILE7","DECILE6","DECILE5","DECILE4","DECILE3","DECILE2","DECILE1","PERCENTILE5","PERCENTILE4","PERCENTILE3","PERCENTILE2","PERCENTILE1"];

        //build svg element
        var margin = {top: 20, right: 20, bottom: 20, left: 20};
        var width = 500 - margin.left - margin.right, height = 300 - margin.top - margin.bottom;
        var chart = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g").attr("transform", "translate("+margin.left+","+margin.top+ ")")
            ;

        $.when(
            //get income distribution data
            $.ajax({url:EstLib.getEstatDataURL("ilc_di01",{currency:"EUR",indic_il:"SHARE",quantile:quantiles})})
        ).then(function(data) {

                //simplify geo label texts
                EstLib.overrideCountryNames(data.dimension.geo.category.label);

                //decode data
                data = JSONstat(data).Dataset(0);

                var getGeoSelection = function(){ return "FR"; }; //TODO get from UI
                var getTimeSelection = function(){ return "2014"; }; //TODO get from UI

                var updateChart = function(){
                    var geoSel = getGeoSelection();
                    var timeSel = getTimeSelection();

                    var getValue = function(quantile){
                        var d = data.Data({currency:"EUR",indic_il:"SHARE",time:timeSel,geo:geoSel,quantile:quantile});
                        if(!d) return 0;
                        return d.value || 0;
                    };

                    var get19Twentilevalue = function(){
                        //TODO
                        return 0.5*getValue("DECILE10");
                    };
                    var get2Twentilevalue = function(){
                        //TODO
                        return 0.5*getValue("DECILE1");
                    };

                    //scales
                    var xScale = d3.scale.linear().domain([0,50]).range([0, width]); //TODO adapt max
                    var yScale = d3.scale.linear().domain([0,100]).range([0, height]);

                    //clear previous
                    chart.selectAll("*").remove();

                    //background
                    chart.append("rect").attr("fill","#eee")
                        .attr("y",yScale(0)).attr("x",xScale(0)).attr("width",xScale(100)).attr("height",yScale(100));


                    //draw chart rectangles
                    var rects = chart.append("g").attr("id","disrect");

                    var addRect = function(group,value,pos,size){
                        group.append("rect").attr("y",yScale(pos)).attr("x",xScale(0))
                            .attr("width",xScale(value)).attr("height",yScale(size));
                    };

                    var i;
                    //first 5 percentiles
                    for(i=0;i<=4;i++) addRect(rects,10*getValue("PERCENTILE"+(i+1)),i,1);
                    //second twentile
                    addRect(rects,5*get2Twentilevalue(),5,5);
                    //8 deciles in the middle
                    for(i=2;i<=9;i++) addRect(rects,getValue("DECILE"+i),10*(i-1),10);
                    //19th twentile
                    addRect(rects,5*get19Twentilevalue(),90,5);
                    //last 5 percentiles
                    for(i=95;i<=99;i++) addRect(rects,10*getValue("PERCENTILE"+i),i,1);

                };
                updateChart();

                //TODO add geo list
                //TODO add time slider

            }, function() {
                console.log("Could not load data");
            }
        );
    });
}(jQuery));
