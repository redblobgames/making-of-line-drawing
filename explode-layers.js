// From http://www.redblobgames.com/making-of/line-drawing/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

// Assuming the svg has a bunch of <g> elements that are 550x220,
// "explode" them all so that you can see the layers.
d3.select("svg").selectAll("g")
    .each(function(_, i) {
        let width = 550, height = 220;
        let g = d3.select(this);
        g.attr('class', `layer layer-${i}`);
        g.insert('rect', ":first-child")
            .attr('class', "glass")
            .attr('width', width)
            .attr('height', height)
            .attr('fill', "hsl(120,10%,90%)")
            .attr('fill-opacity', 0.3)
            .attr('stroke', "hsl(120,50%,10%)")
            .attr('stroke-opacity', 0.7)
            .attr('stroke-width', 2);
    });
d3.select("body").insert('button', ":first-child")
    .text("hide layers")
    .on('click', () => { d3.select("svg").attr('class', ""); });
d3.select("body").insert('button', ":first-child")
    .text("show layers")
    .on('click', () => { d3.select("svg").attr('class', "rotated"); });
