var svg = d3.select("body")
    .append("svg")
    .attr("width", "860")
    .attr("height", "500")
    .style("display", "block")
    .style('background-color','#f0f0f0');
margin = {top: 60, right: 60, bottom: 60, left: 60};
width = +svg.attr("width") - margin.left - margin.right;
height = +svg.attr("height") - margin.top - margin.bottom;
g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//var path = d3.geoPath();

g.attr('class', 'map');

var projection = d3.geoMercator()
    .scale(130)
    .translate( [width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);

g.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(['CHN','IND'])
    .enter().append("path")
    .attr("d", path)