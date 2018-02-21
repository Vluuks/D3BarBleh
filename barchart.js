
window.onload = getData();

var globalData;
var otherData;
var currentYear;
var counter = 0;
var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

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

        globalData = test;
        currentYear = 2011;
        makeBarchart(2011);
        setKeyThings();
    });    

}

function setKeyThings() {
    d3.select("body")  
    .on("keydown", function() {
        console.log(d3.event.key);
        if(d3.event.key == 'ArrowLeft') {
            counter--;
            counter < 0 ? counter = 4 : counter = counter; 
            currentYear = 2011 + (counter % 5 );
            makeBarchart(currentYear); 
        }
        else if(d3.event.key == 'ArrowRight') {
            counter++;
            currentYear = 2011 + (counter % 5 ); 
            makeBarchart(currentYear);
        }
    });
}

function makeBarchart(currentYear) {

    data = globalData;
    
    d3.select("#title")
        .text("Average temperature per month in " + currentYear)

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
        .domain([0, d3.max(otherData, function(d) { 
            if(d.year == currentYear) {
                return d.temperature; 
            }
        })]);

    // Define the axes.
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    // Delete the svg if it exists.
    if(d3.select("#barchartsvg") != undefined ) {
        d3.select("#barchartsvg").remove();
    }

    // Add the svg.
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
        .style("stroke-width", "1px")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("fill", "#666666")
        .text("degrees celcius x 10");

    // Add X axis, done after bar chart so text is over it instead of under it.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .text(function(d, i) {
            return months[i];
        })
        .style("text-anchor", "end")
        .attr("fill", "#666666")
        .attr("dx", "-1em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)")

    // Add bar chart.

    var barElements = svg.selectAll("bar")
        .data(data)
        .enter()
        .append("g")
    
    barElements
        .append("text")
        .text(function(d, i) {
            // Grab array of temperatures of this month for each year
            var temperoni;
            var temp = d.values;

            // Iterate over the years, and get the correct one
            temp.forEach(function(i){

                if(i.key == currentYear) {
                    temperoni = y(i.values);
                }
            })

            var label = temperoni.toString().substring(0, 6);

            return label;
        })
        .style("text-anchor", "middle")
        .attr("x", function(d) {
            return 25 + x(+d.key);
        })
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

            return temperoni - 5;
        })
    
    barElements
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
            return x(+d.key);
        })
        .attr("fill", "#D3D3D3")
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

            var temperoni;

            // Grab array of temperatures of this month for each year
            var temp = d.values;

            // Iterate over the years, and get the correct one
            temp.forEach(function(i) {

                if(i.key == currentYear) {
                    temperoni = height - y(i.values);
                }
            })
            return temperoni;
        })
}