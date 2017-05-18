// From http://www.redblobgames.com/making-of/line-drawing/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

const scale = 22;


function lerp(start, end, t) {
    return start + t * (end-start);
}

function lerpPoint(P, Q, t) {
    return {x: lerp(P.x, Q.x, t),
            y: lerp(P.y, Q.y, t)};
}

function interpolationPoints(P, Q, N) {
    let points = [];
    for (let i = 0; i <= N; i++) {
        let t = i / N;
        points.push(lerpPoint(P, Q, t));
    }
    return points;
}


class Diagram {
    constructor(containerId) {
        this.root = d3.select(`#${containerId}`);
        this.A = {x: 2, y: 2};
        this.B = {x: 20, y: 8};
        this.parent = this.root.select("svg");
        this._updateFunctions = [];
    }

    onUpdate(f) {
        this._updateFunctions.push(f);
        this.update();
    }

    update() {
        this._updateFunctions.forEach((f) => f());
    }
    
    addGrid() {
        let g = this.parent.append('g');
        for (let x = 0; x < 25; x++) {
            for (let y = 0; y < 10; y++) {
                g.append('rect')
                    .attr('transform', `translate(${x*scale}, ${y*scale})`)
                    .attr('width', scale)
                    .attr('height', scale)
                    .attr('fill', "hsl(0,10%,95%)")
                    .attr('stroke', "gray");
            }
        }
        return this;
    }

    addTrack() {
        let g = this.parent.append('g');
        let line = g.append('line')
            .attr('fill', "none")
            .attr('stroke', "gray")
            .attr('stroke-width', 3);
        this.onUpdate(() => {
            line
                .attr('x1', (this.A.x + 0.5) * scale)
                .attr('y1', (this.A.y + 0.5) * scale)
                .attr('x2', (this.B.x + 0.5) * scale)
                .attr('y2', (this.B.y + 0.5) * scale);
        });
        return this;
    }

    addInterpolated(t, N) {
        this.t = t;
        this.N = N;
        this.makeScrubbableNumber('t', 0.0, 1.0, 2);
        this.makeScrubbableNumber('N', 1, 30, 0);
        let g = this.parent.append('g');
        this.onUpdate(() => {
            let points = this.t != null? [lerpPoint(this.A, this.B, this.t)]
                : this.N != null? interpolationPoints(this.A, this.B, this.N)
                : [];
            let circles = g.selectAll("circle").data(points);
            circles.exit().remove();
            circles.enter().append('circle')
                .attr('fill', "hsl(0,30%,50%)")
                .attr('r', 5)
                .merge(circles)
                .attr('transform',
                   (p) => `translate(${(p.x+0.5)*scale}, ${(p.y+0.5)*scale})`);
        });
        return this;
    }

    addInterpolationLabels() {
        // only works if we already have called addInterpolated()
        let g = this.parent.append('g');
        this.onUpdate(() => {
            let points = interpolationPoints(this.A, this.B, this.N);
            var offset = Math.abs(this.B.y - this.A.y)
                       > Math.abs(this.B.x - this.A.x)
                ? {x: 0.8 * scale, y: 0} : {x: 0, y: -0.8 * scale};
            let labels = g.selectAll("text").data(points);
            labels.exit().remove();
            labels.enter().append('text')
                .attr('text-anchor', "middle")
                .text((p, i) => i)
                .merge(labels)
                .attr('transform',
                      (p) => `translate(${p.x*scale},${p.y*scale}) 
                              translate(${offset.x},${offset.y}) 
                              translate(${0.5*scale},${0.75*scale})`);
        });
        return this;
    }
            
    addHandles() {
        let g = this.parent.append('g');
        this.makeDraggableCircle(g, this.A);
        this.makeDraggableCircle(g, this.B);
        return this;
    }

    makeDraggableCircle(parent, P) {
        let diagram = this;
        let circle = parent.append('circle')
            .attr('class', "draggable")
            .attr('r', scale*0.75)
            .attr('fill', "hsl(0,50%,50%)")
            .call(d3.drag().on('drag', onDrag));

        function updatePosition() {
            circle.attr('transform',
                        `translate(${(P.x+0.5)*scale} ${(P.y+0.5)*scale})`);
        }
        
        function onDrag() {
            P.x = Math.floor(d3.event.x / scale);
            P.y = Math.floor(d3.event.y / scale);
            updatePosition();
            diagram.update();
        }

        updatePosition();
    }

    makeScrubbableNumber(name, low, high, precision) {
        let diagram = this;
        let elements = diagram.root.selectAll(`[data-name='${name}']`);
        let positionToValue = d3.scaleLinear()
            .clamp(true)
            .domain([-100, +100])
            .range([low, high]);
        let formatter = d3.format(`.${precision}f`);

        function updateNumbers() {
            elements.text(formatter(diagram[name]));
        }

        updateNumbers();

        elements.call(
            d3.drag()
                .subject({x: positionToValue.invert(diagram[name]), y: 0})
                .on('drag', () => {
                    diagram[name] = parseFloat(formatter(positionToValue(d3.event.x)));
                    updateNumbers();
                    diagram.update();
                }));
    }
}


let diagram_N = new Diagram('interpolate-N')
    .addGrid()
    .addTrack()
    .addInterpolated(null, 5)
    .addHandles()
    .addInterpolationLabels();
