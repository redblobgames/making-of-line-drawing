// From http://www.redblobgames.com/making-of/line-drawing/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

// Assuming the svg has a bunch of <g> elements "explode" them all so
// that you can see the layers. See the CSS for the styling+animation.
d3.select("svg").selectAll("g")
    .each(function(_, i) {
        let g = d3.select(this);
        g.attr('class', `layer layer-${i}`);
        g.insert('rect', ":first-child")
            .attr('class', "glass");
    });
d3.select("body").insert('button', ":first-child")
    .text("hide layers")
    .on('click', () => { d3.select("svg").attr('class', ""); });
d3.select("body").insert('button', ":first-child")
    .text("show layers")
    .on('click', () => { d3.select("svg").attr('class', "rotated"); });
