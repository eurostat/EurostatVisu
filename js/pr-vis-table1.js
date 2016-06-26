/**
 *
 * @author julien Gaffuri
 *
 */
(function($) {

    $(function() {
        //http://ec.europa.eu/eurostat/statistics-explained/index.php/Inflation_in_the_euro_area

        //coicop codes corresponding to table raws
        var coicops = ["CP00", "TOT_X_NRG", "TOT_X_NRG_FOOD", "TOT_X_NRG_FOOD_NP", "FOOD", "FOOD_P", "FOOD_NP", "NRG", "IGD_NNRG", "SERV"];

        $.when(
            //get weight data
            $.ajax({url:EstLib.getEstatDataURL("prc_hicp_inw",{geo:"EA",coicop:coicops,lastTimePeriod:1})}),
            //get rate of change (ROC) data
            $.ajax({url:EstLib.getEstatDataURL("prc_hicp_manr",{geo:"EA",unit:"RCH_A",coicop:coicops,lastTimePeriod:7})})
        ).then(function(weightData, rocData) {
                var ds;


                //decode weight data
                ds = JSONstat(weightData).Dataset(0);

                //write weight year in table header
                $("#wlabely").text( ds.Dimension("time").Category(0).label ).removeAttr("id");

                //fill weight column
                for(var i=0; i<coicops.length; i++){
                    //get weight data
                    var coicop = coicops[i];
                    var d = ds.Data({coicop:coicop});
                    var value = d? d3.round(d.value, 1) + (d.status||"") : ":";

                    //fill table cell
                    $("#w"+coicop).text(value).removeAttr("id");
                }



                //decode rate of change data
                ds = JSONstat(rocData).Dataset(0);

                //retrieve months
                var months = ds.Dimension("time").Category();

                //build header cells and fill with month labels
                var hrow = $("#hrow");
                for(j=0; j<months.length; j++){
                    var month = months[j].label;
                    var y=month.substring(0,4), m=month.substring(5,7);
                    $("<td>").html(moment(y+"-"+m,"YYYY-MM").format("MMM YYYY")).appendTo(hrow);
                }
                hrow.removeAttr("id");

                //build table cells and fill with ROC data
                for(i=0; i<coicops.length; i++){
                    coicop = coicops[i];
                    var row = $("#row"+coicop).removeAttr("id");
                    for(var j=0; j<months.length; j++){
                        month = months[j].label;

                        //get ROC data
                        d = ds.Data({coicop:coicop,time:month});
                        value = d? d3.round(d.value, 1).toFixed(1) + (d.status||"") : ":";

                        //last month in bold
                        if(j==(months.length-1)) value = "<b>"+value+"</b>";

                        //fill table cell
                        $("<td>").html(value).appendTo(row);
                    }
                }

                //show as an image
                var table1 = $("#table1"), img_out = $("#img-out");
                html2canvas(table1, { onrendered: function(canvas) { img_out.empty(); img_out.append(canvas); }});

                //show html code
                $("#table1html").text( table1.html() );

            }, function() {
                console.log("Could not load data");
            }
        );
    });
}(jQuery));
