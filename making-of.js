// From http://www.redblobgames.com/making-of/line-drawing/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

/*
  I want to make an "exploded" view of the layers in a diagram.

  The diagrams are inside iframes. They're <svg> <g>…</g> <g>…</g> … </svg>.

  I find the one diagram that matches the iframe's data-show=, then
  I'm going to take each of those <g>s and put them inside a <g.layer> that
  has css 3d transforms to make the exploded view. See exploded-view.css.
  Also inside the <g.layer> but above its original contents I'm putting a
  <rect.glass> that gives it a greenish tint and a green border.
*/

function addCssToggleCheckbox(selection, controls, className, label) {
    let container = controls.append('label');
    let checkbox = container.append('input')
        .attr('type', "checkbox")
        .on('change', () => { selection.classed(className, checkbox.property('checked')); });
    container.append('span').text(label);
}

function injectLayers(iframe, callback) {
    let root = d3.select(iframe.node().contentDocument);
    if (root.select("svg").size() == 0) { // Document not ready yet
        iframe.on('load', () => { injectLayers(iframe, callback); });
        return;
    }

    root.select("head").append('link')
        .attr('rel', "stylesheet")
        .attr('href', "../exploded-view.css");
    let container = root.select("#"+iframe.attr('data-show'));
    container.selectAll("svg > g")
        .each(function(_, i) {
            let g = container.select("svg").append('g')
                .attr('class', `layer layer-${i}`);
            g.node().appendChild(d3.select(this).remove().node());
            g.append('rect')
                .attr('class', "glass")
                .attr('width', 550)
                .attr('height', 220);
        });

    let controls = d3.select(iframe.node().parentNode.insertBefore(document.createElement('div'), iframe.node().nextElementSibling));
    addCssToggleCheckbox(container.select("svg"), controls, 'rotated', "Show layers");
    
    if (callback) { callback(container, controls); };
}

injectLayers(d3.select('iframe[src="9/"]'));
injectLayers(d3.select('iframe[src="10/"]'));
injectLayers(d3.select('iframe[src="11/"]'));
injectLayers(d3.select('iframe[src="12/"]'),
             (root, controls) => {
                 let div = controls.append('div').text("Improve:");
                 addCssToggleCheckbox(root, div, 'improve-grid', "grid");
                 addCssToggleCheckbox(root, div, 'improve-track', "track");
                 addCssToggleCheckbox(root, div, 'improve-interpolated', "midpoints");
                 addCssToggleCheckbox(root, div, 'improve-rounded', "line");
                 addCssToggleCheckbox(root, div, 'improve-handles', "handles");
                 addCssToggleCheckbox(root, div, 'improve-scrubbable', "scrubbable");
                 addCssToggleCheckbox(root, div, 'improve-dropshadows', "drop shadows");
             });
injectLayers(d3.select('iframe[src="13/"]'));



/* For each iframe I want to include links to each page and source */
d3.selectAll("iframe").each(function(_, i) {
    let src = this.getAttribute('src');
    let div = document.createElement('div');
    this.parentNode.insertBefore(div, this);
    let selection = d3.select(div)
        .attr('class', "ref");
    selection.append('a').attr('href', src).text(src+"index.html");
    selection.append('span').text(" (");
    selection.append('a').attr('href', "https://github.com/redblobgames/making-of-line-drawing/tree/master/" + src).text("source");
    selection.append('span').text(")");
});


/* For each iframe with a data-show= I want to only show that element */
function showOneElement(iframe) {
    let root = d3.select(iframe.contentDocument);
    if (root.select("svg").size() == 0) { // Document not ready yet
        iframe.addEventListener('load', () => { showOneElement(iframe); });
        return;
    }

    // Ugh, don't quite understand why most of the diagrams work but sometimes I need this
    iframe.setAttribute('scrolling', "no");

    let id = iframe.getAttribute('data-show');
    root.selectAll("body > *:not(script)").each(function() {
        let element = d3.select(this);
        element.style('display', id == element.attr('id') ? "" : "none");
    });
}

d3.selectAll("iframe[data-show]").each(function(_, i) {
    showOneElement(this);
});
