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
        this.t = null;
        this.N = 5;
        this.A = {x: 2, y: 2};
        this.B = {x: 20, y: 8};
        this.parent = this.root.select("svg");

        this.addGrid();
        this.addTrack();
        this.addInterpolated();
        this.addHandles();
        this.makeScrubbableNumber('N', 1, 30, 0);
        this.update();
    }

    update() {
        this.updateTrack();
        this.updateInterpolated();
    }

    addTrack() {
        this.gTrack = this.parent.append('line')
            .attr('fill', "none")
            .attr('stroke', "gray")
            .attr('stroke-width', 3);
    }
        
    updateTrack() {
        this.gTrack
            .attr('x1', (this.A.x + 0.5) * scale)
            .attr('y1', (this.A.y + 0.5) * scale)
            .attr('x2', (this.B.x + 0.5) * scale)
            .attr('y2', (this.B.y + 0.5) * scale);
    }

    addInterpolated() {
        this.gInterpolated = this.parent.append('g');
    }
    
    updateInterpolated() {
        let points = this.t != null? [lerpPoint(this.A, this.B, this.t)]
            : this.N != null? interpolationPoints(this.A, this.B, this.N)
            : [];
        let circles = this.gInterpolated.selectAll("circle").data(points);
        circles.exit().remove();
        circles.enter().append('circle')
            .attr('fill', "hsl(0,30%,50%)")
            .attr('r', 5)
            .merge(circles)
            .attr('transform',
                  (p) => `translate(${(p.x+0.5)*scale}, ${(p.y+0.5)*scale})`);
    }
    
    addGrid() {
        this.gGrid = this.parent.append('g');
        for (let x = 0; x < 25; x++) {
            for (let y = 0; y < 10; y++) {
                this.gGrid.append('rect')
                    .attr('transform', `translate(${x*scale}, ${y*scale})`)
                    .attr('width', scale)
                    .attr('height', scale)
                    .attr('fill', "none")
                    .attr('stroke', "gray");
            }
        }
    }

    addHandles() {
        this.gHandles = this.parent.append('g');
        this.makeDraggableCircle(this.A);
        this.makeDraggableCircle(this.B);
    }
    
    makeDraggableCircle(P) {
        let diagram = this;
        let circle = this.gHandles.append('circle')
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

        elements.call(d3.drag()
                      .subject({x: positionToValue.invert(diagram[name]), y: 0})
                      .on('drag', () => {
                          diagram[name] = parseFloat(formatter(positionToValue(d3.event.x)));
                          updateNumbers();
                          diagram.update();
                      }));
    }
}


let diagram = new Diagram('interpolate-N');
