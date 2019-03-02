d3.json('data/worldmap.json').then(function (geojson) {
    d3.csv("data/GDP.csv").then(function (csvdata) {
        all(geojson, csvdata)
    });

})

function all(geojson, csvdata) {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    var svg = d3.select("#divmap")
        .append("svg")
        .attr('id', 'svgmap')
        .attr("width", windowWidth)
        .attr("height", windowWidth / 2)
        .style('background-color', '#f0f0f0');
    margin = {top: 50, right: 30, bottom: 30, left: 30};
    width = +svg.attr("width") - margin.left - margin.right;
    height = +svg.attr("height") - margin.top - margin.bottom;
    svg.append("g")
        .attr('class', 'gmap')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var year = '2008';

    svg.append('text')
        .attr('id', 'info')
        .text('Hover your mouse over a country')
        .attr('x', 20)
        .attr('y', 50)

    var projection = d3.geoEquirectangular()
        .scale(Math.min(width / Math.PI, height / Math.PI))
        .translate([width / 2, height / 2])

    var geoGenerator = d3.geoPath()
        .projection(projection);


    var myColor = d3.scaleSequential(d3.interpolateInferno)
        .domain([0, 100000000000])

    d3.select('.gmap')
        .selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('class', 'countries')
        .attr('d', geoGenerator)
        .attr('fill', function (d) {
            const country = csvdata.filter(dj => dj['Country Code'] == d.properties.ADM0_A3)
            if (country.length == 0) {
                return myColor(0)
            } else {
                const dataGDP = country[0][year];
                return myColor(dataGDP)
            }
        })
        .style('stroke', 'white')
        .style('stroke-width', '0.1')
        .on('mouseover', function (d) {
            const country = csvdata.filter(dj => dj['Country Code'] == d.properties.ADM0_A3)
            let dataGDP = '';
            if (country.length == 0) {
                dataGDP = ''
            } else {
                dataGDP = country[0][year];
            }
            d3.select('#info')
                .text(function () {
                    if (dataGDP != '') {
                        return d.properties.ADMIN + " (" + year + "): " + dataGDP;
                    } else return d.properties.ADMIN + " (" + year + ") : Not available."
                })

        })
        .on('mouseout', function () {
            // d3.select('#info').remove();
        })
        .on('click', function () {
            let fakedata2 = [
                {"Country Name": 'CHN', "GDP": 5},
                {"Country Name": 'USA', "GDP": 2},
                {"Country Name": 'UK', "GDP": 3},
                {"Country Name": 'RUS', "GDP": 4},
                {"Country Name": 'KRA', "GDP": 5},
                {"Country Name": 'JPN', "GDP": 6},
                {"Country Name": 'GRM', "GDP": 7},
                {"Country Name": 'FRC', "GDP": 8},
                {"Country Name": 'IND', "GDP": 9},
                {"Country Name": 'CAN', "GDP": 10},
            ];

            barUpdate(fakedata2)
        })

    //Drag Slider
    var sliderWidth = width;

    var x = d3.scaleLinear()
        .domain([1960, 2017])
        .range([0, sliderWidth])
        .clamp(true);

    var slider = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + (height + 30) + ")");

    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function () {
                slider.interrupt();
            })
            .on("start drag", function () {
                hue(x.invert(d3.event.x));
                updateColor()
            }));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(10))
        .enter().append("text")
        .attr("x", x)
        .attr("text-anchor", "middle")
        .text(function (d) {
            return d;
        });

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);


    function updateColor() {
        d3.selectAll('.countries')
            .each(function () {
                d3.select(this)
                    .attr('fill', function (d) {
                        const country = csvdata.filter(dj => dj['Country Code'] == d.properties.ADM0_A3)
                        if (country.length == 0) {
                            return myColor(0)
                        } else {
                            const dataGDP = country[0][year];
                            return myColor(dataGDP)
                        }
                    })
            })

    }

    function hue(h) {
        handle.attr("cx", x(h));
        year = Math.round(h)
    }


    //bar chart

    var fakedata = [
        {"Country Name": 'CHN', "GDP": 1},
        {"Country Name": 'USA', "GDP": 2},
        {"Country Name": 'UK', "GDP": 3},
        {"Country Name": 'RUS', "GDP": 4},
        {"Country Name": 'KRA', "GDP": 5},
        {"Country Name": 'JPN', "GDP": 6},
        {"Country Name": 'GRM', "GDP": 7},
        {"Country Name": 'FRC', "GDP": 8},
        {"Country Name": 'IND', "GDP": 9},
        {"Country Name": 'CAN', "GDP": 10},
    ];



    bar(fakedata)
}


function bar(fakedata) {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    var svg = d3.select("#divbar")
        .append("svg")
        .attr('id', 'svgmap')
        .attr("width", (windowWidth / 2) - 10)
        .attr("height", windowWidth / 4)

    margin = {top: 20, right: 30, bottom: 30, left: 30};
    width = +svg.attr("width") - margin.left - margin.right;
    height = +svg.attr("height") - margin.top - margin.bottom;

    var g = svg.append('g')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#f0f0f0')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    let arrCountry = [];
    let arrGDP = [];
    for (let i = 0; i < fakedata.length; i++) {
        arrCountry.push(fakedata[i]['Country Name'])
        arrGDP.push(fakedata[i]['GDP'])
    }

    var xMax = d3.max(arrGDP)

    var rectPadding = 10;

    let arrRange = [];
    for(let i=0;i<=fakedata.length;i++){
        arrRange.push((i)*height/fakedata.length)
    }

    var x = d3.scaleLinear()
        .domain([0, xMax])
        .range([0, width]);

    var y = d3.scaleOrdinal()
        .domain(arrCountry)
        .range(arrRange);

    var xAxis = d3.axisBottom(x)
        .tickSize(5)
        .ticks(10)

    var yAxis = d3.axisRight(y)
        .tickSize(0)
        .ticks(11)
        .tickFormat(function (d) {
            return d;
        });


    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 8)
        .attr('class', 'bree')
        .style("text-anchor", "center")
        .style("font-size", "11px");

    g.append("g")
        .call(yAxis)
        .selectAll("text")
        .attr("y", rectPadding)
        .attr("x", -6)
        .attr('class', 'bree')
        .style("text-anchor", "end")
        .style("font-size", "10px");

    g.selectAll('rect')
        .data(fakedata)
        .enter()
        .append('rect')
        .attr('x',0)
        .attr('y', function (d, i) {
            return i * (height / fakedata.length);
        })
        .attr('width', function (d) {
            return (d.GDP / xMax) * width;
        })
        .attr('height', function () {
            return height / fakedata.length - rectPadding;
        })
        .attr('fill', 'red')
}


function barUpdate(fakedata){

}


