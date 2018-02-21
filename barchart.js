
window.onload = getData();

var globalData;
var otherData;
var currentYear;
var counter;

function getData() {

    // Get data.
    d3.csv("meteo.csv", function(error, data) {

        if(error) {
            throw error;
        }

        // Make numbers.
        data.forEach(function(d) {
            d.month = +d.month;
            d.year = +d.year;
            d.temperature = +d.temperature;
        });

        otherData = data;

        // Sort per year, then per month, and then get the average of that????? 
        var test = d3.nest()
            .key(function(d) { 
                return d.month;
            })
            .key(function(d) { 
                return parseInt(d.year); // WHY DOES THIS STAY A STRING I DONT LIKE IT
            })
            .rollup(function(v) { 
                return d3.mean(v, function(d) { return d.temperature; })     
            })
            .entries(data);


        console.log(JSON.stringify(test));
        //console.log(test[2011][1].average);

        // test avg of 2011 january
        test.forEach(function(d){

            // if it's january
            if(d.key == "1")
                console.log(d.values);
        })

    
        globalData = test;
        currentYear = 2011;
        makeBarchart(2013);
        setKeyThings();
    });    

}

function setKeyThings() {
    

    // WHY DOES THIS NOT WORK FFS
    d3.select("body")  
    .on("keydown", function() {
        console.log("testtt");
        console.log(d3.event.keyCode);
        switchYear();
    })
}

function switchYear() {
    
    counter++;
    currentYear += (counter % 5 ); // todo met modulos enzo
    // check input
    // remake bar shit
    makeBarchart(currentYear);
}

function makeBarchart(currentYear) {

     // TODO DELETE SVG IF EXISTS

    data = globalData;
    
    // Set the dimensions of the canvas.
    var margin = {
            top: 20,
            right: 20,
            bottom: 50,
            left: 50
        },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Set the domain and range.
    var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .05)
		.domain(data.map(function(d) {
			return d.key;
		}));
		
    var y = d3.scale.linear()
		.range([height, 0])
        .domain([0, d3.max(otherData, function(d) { // TODO
            
            // DETERMINE WHAT THE MAX IS FOR THAT MONTH
            // THIS IS REALLY CLUNKY
            if(d.year == currentYear) {
                return d.temperature; 
            }
        })]);
        console.log(d3.max(otherData, function(d) { // TODO
            
            // DETERMINE WHAT THE MAX IS FOR THAT MONTH
            // THIS IS REALLY CLUNKY
            if(d.year == currentYear) {
                return d.temperature; 
            }
        }));

    // Define the axes.
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(20);


    var svg = d3.select("#barchart").append("svg")
        .attr("id", "barchartsvg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add the Y axis.
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -43)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("fill", "#666666")
        .text("TESTERONIS");

    // Add X axis, done after bar chart so text is over it instead of under it.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("dx", "1em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)")

    // Add bar chart.
    svg.selectAll("bar")
        .data(data)
        .enter()

        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
            console.log("month: " + +d.key);
            return x(+d.key);
        })
        .attr("width", x.rangeBand())
        .attr("y", function(d) {

            // Grab array of temperatures of this month for each year
            var temperoni;
            var temp = d.values;

            // Iterate over the years, and get the correct one
            temp.forEach(function(i){

                if(i.key == currentYear) {
                    temperoni = y(i.values);
                }
            })

            return temperoni;
        })
        .attr("height", function(d, i) {

            console.log("HEIGHT IS CALLED FOR THE " + i + "TH TIME");
            var temperoni;

            // Grab array of temperatures of this month for each year
            var temp = d.values;

            // Iterate over the years, and get the correct one
            temp.forEach(function(i) {

                if(i.key == currentYear) {
                    console.log("YEAR MATCH: " + currentYear + " | " + i.key + " AVG: " + i.values);
                    console.log("final return " +  (height - y(i.values)));
                    temperoni = height - y(i.values);
                }
            })
            return temperoni;
        })
}