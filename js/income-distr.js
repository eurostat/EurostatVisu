/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {
    $(function() {

        var quantiles = ["PERCENTILE100","PERCENTILE99","PERCENTILE98","PERCENTILE97","PERCENTILE96","PERCENTILE95","DECILE10","DECILE9","DECILE8","DECILE7","DECILE6","DECILE5","DECILE4","DECILE3","DECILE2","DECILE1","PERCENTILE5","PERCENTILE4","PERCENTILE3","PERCENTILE2","PERCENTILE1"];

        //build svg element
        var margin = {top: 0, right: 0, bottom: 10, left: 10};
        var width = 500 - margin.left - margin.right, height = 300 - margin.top - margin.bottom;
        var chart = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g").attr("transform", "translate("+margin.left+","+margin.top+ ")")
            ;

        //build legend svg element TODO remove!
        var lgd = d3.select("#legend").append("svg").attr("width", width).attr("height", height + margin.top + margin.bottom);
        var topLgd = 10;

        //geo list and time slider
        var geoList = $("#geoList"); //TODO reduce font size
        var sli = $("#timeslider");
        sli.css("width",width);

        //info div
        var infoDiv = d3.select("#info").attr("style", "height:"+ (height + margin.top + margin.bottom) + "px");

        $.when(
            //get income distribution data
            $.ajax({url:EstLib.getEstatDataURL("ilc_di01",{currency:"EUR",indic_il:"SHARE",quantile:quantiles})})
        ).then(function(data) {
                var i;

                //simplify geo label texts
                EstLib.overrideCountryNames(data.dimension.geo.category.label);

                //decode data
                data = JSONstat(data).Dataset(0);


                //the selection
                var geoSel = PrVis.getParameterByName("geo") || "EU28";
                var timeSel = PrVis.getParameterByName("time") || "2013";

                //build geolist
                var geos = data.Dimension("geo").id;
                PrVis.fillGeoList(geoList, geos, function(geo){return data.Dimension("geo").Category(geo).label;});
                $('#geoList option[value='+geoSel+']').attr('selected', 'selected');
                geoList.selectmenu({
                    change:function(){ geoSel=geoList.find(":selected").attr("value"); update(); }
                })
                    .selectmenu("menuWidget").css("height","200px")/*.css("font-size","70%")*/;


                //fill time legend TODO slider
                var times = data.Dimension("time").id;
                dy = margin.top+topLgd;
                lgd.append("g").selectAll("text").data(times).enter().append("text")
                    .attr("class", "lgd lgdT")
                    .attr("time", function(d) { return d; })
                    .attr("x", 0)
                    .attr("y", function() { dy+=10; return dy-10; })
                    .text(function(d) { return d; })
                    .on("mouseover", function() { timeSel= d3.select(this).attr("time"); update(); })
                    //.on("mouseout", function() { hideTime(d3.select(this).attr("time")); })
                ;


                //try to retrieve a quantile value
                var getValue = function(quantile){
                    var d = data.Data({currency:"EUR",indic_il:"SHARE",time:timeSel,geo:geoSel,quantile:quantile});
                    if(!d) return 0;
                    return d.value || 0;
                };

                //compute second twentile from first decile and five first percentiles
                var get2Twentilevalue = function(){
                    //TODO correct
                    var v = getValue("DECILE1");
                    for(i=1;i<=5;i++) v -= getValue("PERCENTILE"+i);
                    return v;
                };
                //compute 19th twentile from last decile and five last percentiles
                var get19Twentilevalue = function(){
                    //TODO correct
                    var v = getValue("DECILE10");
                    for(i=95;i<=99;i++) v -= getValue("PERCENTILE"+i);
                    return v;
                };

                //check if percentile data is available
                var detailledDataPresent = function(first){
                    //TODO
                    //check presence of 5 percentiles
                    //var d = data.Data({currency:"EUR",indic_il:"SHARE",time:timeSel,geo:geoSel,quantile:quantile});
                    return true;
                };


                //update the chart
                var update = function(){

                    //scales
                    var xScale = d3.scale.linear().domain([0,50]).range([0, width]); //TODO adapt max
                    var yScale = d3.scale.linear().domain([0,100]).range([0, height]);

                    //clear previous
                    chart.selectAll("*").remove();

                    //distribution rectangles group
                    var rects = chart.append("g").attr("id","disrect");

                    //draw distribution rectangle
                    var addRect = function(quantile,factor,value,pos,size){
                        rects.append("rect").attr("y",yScale(pos)).attr("x",xScale(0))
                            .attr("width",xScale( factor*value )).attr("height",yScale(size))
                            .on("mouseover", function() {
                                infoDiv.text(quantile + " = " + value + "%");
                                //TODO more text
                                //TODO do not center text
                                //TODO change rect style
                            })
                            .on("mouseout", function() {
                                infoDiv.text("");
                                //TODO change rect style
                            })
                        ;
                    };

                    if(detailledDataPresent(true)){
                        //first 5 percentiles
                        for(i=0;i<=4;i++) addRect("Percentile "+(i+1),10,getValue("PERCENTILE"+(i+1)),i,1);
                        //second twentile
                        addRect("Twentile 2",2,get2Twentilevalue(),5,5);
                    } else {
                        //first decile
                        addRect("Decile 1",1,getValue("DECILE1"),0,10);
                    }

                    //8 deciles in the middle
                    for(i=2;i<=9;i++) addRect("Decile "+i,1,getValue("DECILE"+i),10*(i-1),10);

                    if(detailledDataPresent(false)){
                        //19th twentile
                        addRect("Twentile 19",2,get19Twentilevalue(),90,5);
                        //last 5 percentiles
                        for(i=95;i<=99;i++) addRect("Percentile "+i,10,getValue("PERCENTILE"+i),i,1);
                    } else {
                        //last decile
                        addRect("Decile 10",1,getValue("DECILE10"),90,10);
                    }

                    //select geoSel in list
                    $('#geoList option[value='+geoSel+']').attr('selected', 'selected');
                    //bold time legend label
                    d3.selectAll(".lgdT").attr("font-weight","normal").attr("fill","black");
                    d3.selectAll(".lgdT[time='"+timeSel+"']").attr("font-weight","bold").attr("fill","maroon");
                    //update title
                    d3.select("#geoTitle").text(data.Dimension("geo").Category(geoSel).label);
                    d3.select("#timeTitle").text(timeSel);
                };

                update();

            }, function() {
                console.log("Could not load data");
            }
        );
    });
}(jQuery));
