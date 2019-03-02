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