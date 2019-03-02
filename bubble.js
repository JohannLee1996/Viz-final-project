windowWidth = window.innerWidth;
windowHeight = window.innerHeight;

var svg = d3.select("#divbubble")
    .append("svg")
    .attr('id', 'svgmap')
    .attr("width", (windowWidth / 2)-10)
    .attr("height", windowWidth / 4)
    .style('background-color', '#550055');

function test() {
    console.log('good')
}