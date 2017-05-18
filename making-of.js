// From http://www.redblobgames.com/making-of/line-drawing/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

console.info("I'm happy to answer questions about the code; email me at redblobgames@gmail.com");

/*
  I want to make an "exploded" view of the layers in a diagram.

  The diagrams are inside iframes. They're <svg> <g>…</g> <g>…</g> … </svg>.
  I'm going to take each of those <g>s and put them inside a <g.layer> that
  has css 3d transforms to make the exploded view. See exploded-view.css.
  Also inside the <g.layer> but above its original contents I'm putting a
  <rect.glass> that gives it a greenish tint and a green border.
*/

function injectLayers(iframe) {
    let root = d3.select(iframe.node().contentDocument);
    if (root.select("svg").size() == 0) {
        // Document not ready yet
        iframe.on('load', () => { injectLayers(iframe); });
        return;
    }

    console.log('injecting into', iframe.node());
    root.select("head").append('link')
        .attr('rel', "stylesheet")
        .attr('href', "../exploded-view.css");
    root.selectAll("svg > g")
        .each(function(_, i) {
            let g = root.select("svg").append('g')
                .attr('class', `layer layer-${i}`);
            g.node().appendChild(d3.select(this).remove().node());
            g.append('rect').attr('class', "glass");
        });

    let controls = d3.select(iframe.node().parentNode.insertBefore(document.createElement('div'), iframe.node().nextElementSibling));
    controls.append('button')
        .text("show layers")
        .on('click', () => { root.select("svg").attr('class', "rotated"); });
    controls.append('button')
        .text("hide layers")
        .on('click', () => { root.select("svg").attr('class', ""); });
}

injectLayers(d3.select('iframe[src="7/"]'));
injectLayers(d3.select('iframe[src="8/"]'));
injectLayers(d3.select('iframe[src="9/"]'));
injectLayers(d3.select('iframe[src="10/"]'));
