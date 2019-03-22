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


    var year = {value: '2008'};
    var countryCode = {value: 'CHN'}

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


    var myColor = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 19390604000000])

    var bardata = [];

    for (let i = 0; i < 10; i++) {
        bardata.push({});
    }

    var currentYearData = [];
    var bubbleData = [];

    for (let i = 0; i < csvdata.length; i++) {
        currentYearData.push({});
        bubbleData.push({});
    }

    var linedata = [{}];

    getCurrentYearData(csvdata, year, currentYearData)
    getBarData(countryCode, currentYearData, bardata)
    getBubbleData(currentYearData, bubbleData)
    getCurrentCountryData(csvdata, countryCode, linedata)


    d3.select('.gmap')
        .selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('class', 'countries')
        .attr('d', geoGenerator)
        .attr('fill', function (d) {
            const country = currentYearData.filter(dj => dj.code == d.properties.ADM0_A3)
            if (country.length == 0) {
                return myColor(0)
            } else {
                const dataGDP = country[0].GDP;
                return myColor(dataGDP)
            }
        })
        .style('stroke', 'white')
        .style('stroke-width', '0.1')
        .on('mouseover', function (d) {
            const country = currentYearData.filter(dj => dj.code == d.properties.ADM0_A3)
            let dataGDP = '';
            if (country.length != 0) {
                dataGDP = country[0].GDP;
            }
            d3.select('#info')
                .text(function () {
                    if (dataGDP != '') {
                        return d.properties.ADMIN + " (" + year.value + "): " + dataGDP;
                    } else return d.properties.ADMIN + " (" + year.value + ") : Not available."
                })

        })
        .on('mouseout', function () {
            // d3.select('#info').remove();
        })
        .on('click', function (d) {
            countryCode.value = d.properties.ADM0_A3;
            getBarData(countryCode, currentYearData, bardata)
            barUpdate(bardata)
            getCurrentCountryData(csvdata, countryCode, linedata)
            lineUpdate(linedata)
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
                updateSlider(x.invert(d3.event.x));
                getCurrentYearData(csvdata, year, currentYearData)
                updateColor(currentYearData, myColor)
                getBarData(countryCode, currentYearData, bardata)
                barUpdate(bardata)
                getBubbleData(currentYearData, bubbleData)
                bubbleUpdate(bubbleData);
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

    function updateSlider(h) {
        handle.attr("cx", x(h));
        year.value = Math.round(h)
    }


    d3.select("#play-button")
        .text('Play')
        .on("click", function () {
            var button = d3.select(this);
            if (button.text() == "Pause") {
                moving = false;
                clearInterval(window.timer1);
                button.text("Play");
            } else {
                moving = true;
                button.text("Pause");
                var i = 0;

                function timer() {
                    console.log('mmm');
                }

                window.timer1 = setInterval(timer(), 1000);
            }
        })

//bar chart

    bar(bardata)


    //bubble chart

    bubble(bubbleData)

    //line chart

    line(linedata)
}

function lineUpdate(linedata) {

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    var margin = {left: 100, right: 50, top: 20, bottom: 50}
    var width = windowWidth - margin.left - margin.right;
    var height = windowWidth / 4 - margin.top - margin.bottom;

    var data = []
    for (let i = 1960; i < 2018; i++) {
        data.push(parseFloat(linedata[0][0][d3.format("")(i)]))
    }


    var lined = []
    for (let i = 1960; i < 2018; i++) {
        lined.push({x: new Date(i, 1, 1), y: parseFloat(linedata[0][0][d3.format("")(i)])})
    }

    const xMax = d3.max(data)

    var g = d3.select('#lineg');


    var y = d3.scaleLinear()
        .domain([xMax, 0])
        .range([0, height]);

    var x = d3.scaleTime()
        .domain([new Date(1959, 9, 1), new Date(2019, 3, 1)])
        .range([0, width])

    var xAxis = d3.axisBottom(x)
        .tickSize(5)
        .ticks(10)

    var yAxis = d3.axisRight(y)
        .tickSize(width)
        .ticks(11)
        .tickFormat(function (d) {
            return d;
        });

    // function customYAxis(g) {
    //     g.call(yAxis);
    //     g.select(".domain").remove();
    // }

    d3.select('#lineXAxis')
        .transition()
        .duration(800)
        .call(xAxis)
        .selectAll("text")
        .attr("y", 8)
        .attr('class', 'bree')
        .style("text-anchor", "center")
        .style("font-size", "11px");

    d3.select('#lineYAxis')
        .transition()
        .duration(800)
        .call(yAxis)
        .selectAll("text")
        // .attr("y", 0)
        .attr("x", -6)
        .attr('class', 'bree')
        .style("text-anchor", "end")
        .style("font-size", "10px")


    var line = d3.line()
        .x(function (d) {
            return x(d.x);
        }) // set the x values for the line generator
        .y(function (d) {
            return y(d.y);
        }) // set the y values for the line generator
        .curve(d3.curveMonotoneX)

    d3.select('#linePath')
        .datum(lined)
        .attr("class", "line")
        .attr("d", line);


}

function getCurrentCountryData(csvdata, countryCode, linedata) {
    let country = csvdata.filter(dj => dj['Country Code'] == countryCode.value);
    linedata[0] = country;
}

function line(linedata) {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    var svg = d3.select("#divline")
        .append("svg")
        .attr('id', 'svgmap')
        .attr("width", windowWidth)
        .attr("height", windowWidth / 4)
        .style('background-color', '#eeeeee');

    var margin = {left: 100, right: 50, top: 20, bottom: 50}
    var width = windowWidth - margin.left - margin.right;
    var height = windowWidth / 4 - margin.top - margin.bottom;

    var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('id','lineg')

    var data = []
    for (let i = 1960; i < 2018; i++) {
        data.push(parseFloat(linedata[0][0][d3.format("")(i)]))
    }


    var lined = []
    for (let i = 1960; i < 2018; i++) {
        lined.push({x: new Date(i, 1, 1), y: parseFloat(linedata[0][0][d3.format("")(i)])})
    }


    const xMax = d3.max(data)


    var y = d3.scaleLinear()
        .domain([xMax, 0])
        .range([0, height]);

    var x = d3.scaleTime()
        .domain([new Date(1959, 9, 1), new Date(2019, 3, 1)])
        .range([0, width])

    var xAxis = d3.axisBottom(x)
        .tickSize(5)
        .ticks(10)

    var yAxis = d3.axisRight(y)
        .tickSize(width)
        .ticks(11)
        .tickFormat(function (d) {
            return d;
        });


    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr('id', 'lineXAxis')
        .call(xAxis)
        .selectAll("text")
        .attr("y", 8)
        .attr('class', 'bree')
        .style("text-anchor", "center")
        .style("font-size", "11px");

    g.append("g")
        .attr('id', 'lineYAxis')
        .call(customYAxis)
        .selectAll("text")
        // .attr("y", 0)
        .attr("x", -6)
        .attr('class', 'bree')
        .style("text-anchor", "end")
        .style("font-size", "10px")

    var line = d3.line()
        .x(function (d) {
            return x(d.x);
        }) // set the x values for the line generator
        .y(function (d) {
            return y(d.y);
        }) // set the y values for the line generator
        .curve(d3.curveMonotoneX)

    g.append("path")
        .attr('id', 'linePath')
        .datum(lined)
        .attr("class", "line")
        .attr("d", line);

    function customYAxis(g) {
        g.call(yAxis);
        g.select(".domain").remove();
    }
}

function bubble(bubbleData) {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    var svg = d3.select("#divbubble")
        .append("svg")
        .attr('id', 'svgmap')
        .attr("width", (windowWidth / 2) - 10)
        .attr("height", windowWidth / 4);

    var data = {'children': bubbleData};

    var color = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 40])

    var bubble = d3.pack(data)
        .size([(windowWidth / 2) - 12, (windowWidth / 4) - 2])
        .padding(1.5);

    var nodes = d3.hierarchy(data)
        .sum(function (d) {
            return d.GDP;
        });

    var node = svg.selectAll(".node")
        .data(bubble(nodes).descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    node.append("title")
        .attr('class', 'bubbleTitle')
        .text(function (d) {
            return d.data.name + ": " + d.data.GDP;
        });

    node.append("circle")
        .attr('class', 'bubbleCircle')
        .attr("r", function (d) {
            return d.r;
        })
        .style("fill", function (d) {
            return color(d.r);
        });

    d3.select(self.frameElement)
        .style("height", (windowWidth / 4) - 2 + "px");

}

function bubbleUpdate(bubbleData) {

    var data = {'children': bubbleData};

    var color = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 40])

    var bubble = d3.pack(data)
        .size([(windowWidth / 2) - 12, (windowWidth / 4) - 2])
        .padding(1.5);

    var nodes = d3.hierarchy(data)
        .sum(function (d) {
            return d.GDP;
        });

    d3.selectAll(".node")
        .data(bubble(nodes).descendants())
        .each(function () {
            d3.select(this)
                .transition()
                .duration(800)
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
        })

    d3.selectAll(".bubbleCircle")
        .data(bubble(nodes).descendants())
        .each(function () {
            d3.select(this)
                .transition()
                .duration(800)
                .attr('r', function (d) {
                    return d.r;
                })
                .style("fill", function (d) {
                    return color(d.r);
                });
        })

    d3.selectAll(".bubbleTitle")
        .data(bubble(nodes).descendants())
        .each(function () {
            d3.select(this)
                .text(function (d) {
                    return d.data.name + ": " + d.data.GDP;
                })
        })


}

function release() {

}

function updateColor(currentYearData, myColor) {
    d3.selectAll('.countries')
        .each(function () {
            d3.select(this)
                .attr('fill', function (d) {
                    const country = currentYearData.filter(dj => dj.code == d.properties.ADM0_A3)
                    if (country.length == 0) {
                        return myColor(0)
                    } else {
                        const dataGDP = country[0].GDP;
                        return myColor(dataGDP)
                    }
                })
        })

}


function bar(bardata) {
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
    for (let i = 0; i < bardata.length; i++) {
        arrCountry.push(bardata[i]['Country Code'])
        arrGDP.push(bardata[i]['GDP'])
    }

    var xMax = d3.max(arrGDP)

    var rectPadding = 10;

    let arrRange = [];
    for (let i = 0; i <= bardata.length; i++) {
        arrRange.push((i) * height / bardata.length)
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
        .attr('id', 'barX')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 8)
        .attr('class', 'bree')
        .style("text-anchor", "center")
        .style("font-size", "11px");

    g.append("g")
        .attr('id', 'barY')
        .call(yAxis)
        .selectAll("text")
        .attr("y", rectPadding)
        .attr("x", -6)
        .attr('class', 'bree')
        .style("text-anchor", "end")
        .style("font-size", "10px");

    g.selectAll('.bars')
        .data(bardata)
        .enter()
        .append('rect')
        .attr('class', 'bars')
        .attr('x', 0)
        .attr('y', function (d, i) {
            return i * (height / bardata.length);
        })
        .attr('width', function (d) {
            return (d.GDP / xMax) * width;
        })
        .attr('height', function () {
            return height / bardata.length - rectPadding;
        })
        .attr('fill', function (d, i) {
            if (i == 4) {
                return 'orange'
            } else {
                return 'red'
            }
        })
}


function barUpdate(bardata) {
    var rectPadding = 10;

    let arrCountry = [];
    let arrGDP = [];
    for (let i = 0; i < bardata.length; i++) {
        arrCountry.push(bardata[i]['Country Code'])
        arrGDP.push(bardata[i]['GDP'])
    }

    let arrRange = [];
    for (let i = 0; i <= bardata.length; i++) {
        arrRange.push((i) * height / bardata.length)
    }

    var xMax = d3.max(arrGDP)

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

    d3.select('#barX')
        .transition()
        .duration(800)
        .call(xAxis)
        .selectAll("text")
        .attr("y", 8)
        .attr('class', 'bree')
        .style("text-anchor", "center")
        .style("font-size", "11px");

    d3.select('#barY')
        .transition()
        .duration(800)
        .call(yAxis)
        .selectAll("text")
        .attr("y", rectPadding)
        .attr("x", -6)
        .attr('class', 'bree')
        .style("text-anchor", "end")
        .style("font-size", "10px");

    d3.selectAll('.bars')
        .data(bardata)
        .each(function () {
            d3.select(this)
                .transition()
                .duration(800)
                .attr('width', function (d) {
                    return (d.GDP / xMax) * width;
                })
        })
}

function getBarData(countryCode, currentYearData, bardata) {
    let country = currentYearData.filter(dj => dj.code == countryCode.value);
    let index = currentYearData.indexOf(country[0])
    if (index < 5) {
        updateBarData(0)
    } else if (currentYearData.length - index < 5) {
        updateBarData(currentYearData.length - 10)
    } else {
        updateBarData(index - 4)
    }

    function updateBarData(index) {
        for (let i = 0; i < 10; i++) {
            bardata[i] = {'Country Code': currentYearData[index + i].code, "GDP": currentYearData[index + i].GDP};
        }
    }
}

function getCurrentYearData(csvdata, year, currentYearData) {
    let toBeSort = [];
    for (let i = 0; i < csvdata.length; i++) {
        toBeSort.push([csvdata[i]['Country Name'], csvdata[i]['Country Code'], csvdata[i][year.value]]);
    }
    toBeSort.sort(function (a, b) {
        return b[2] - a[2];
    })
    for (let i = 0; i < csvdata.length; i++) {
        currentYearData[i] = {name: toBeSort[i][0], code: toBeSort[i][1], GDP: toBeSort[i][2]};
    }
}

function getBubbleData(currentYearData, bubbleData) {
    for (let i = 0; i < currentYearData.length; i++) {
        bubbleData[i] = currentYearData[i];
    }
}


