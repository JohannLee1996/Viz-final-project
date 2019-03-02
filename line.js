windowWidth = window.innerWidth;
windowHeight = window.innerHeight;

var svg = d3.select("#divline")
    .append("svg")
    .attr('id', 'svgmap')
    .attr("width", windowWidth)
    .attr("height", windowWidth / 4)
    .style('background-color', '#005555');