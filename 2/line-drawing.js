// From http://www.redblobgames.com/making-of/line-drawing/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

const scale = 22;
let parent = d3.select("#demo svg");

for (let x = 0; x < 25; x++) {
    for (let y = 0; y < 10; y++) {
        parent.append('rect')
            .attr('transform', `translate(${x*scale}, ${y*scale})`)
            .attr('width', scale)
            .attr('height', scale)
            .attr('fill', "white")
            .attr('stroke', "gray");
    }
}
