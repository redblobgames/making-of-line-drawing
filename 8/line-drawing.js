// From http://www.redblobgames.com/making-of/line-drawing/
// Copyright 2017 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

const scale = 22;


function pointsOnLine(P, Q) {
    let points = [];
    let N = Math.max(Math.abs(P.x-Q.x), Math.abs(P.y-Q.y));
    for (let i = 0; i <= N; i++) {
        let t = i / N;
        let x = Math.round(P.x + (Q.x - P.x) * t);
        let y = Math.round(P.y + (Q.y - P.y) * t);
        points.push({x: x, y: y});
    }
    return points;
}

function lerp(start, end, t) {
    return start + t * (end-start);
}

function lerpPoint(P, Q, t) {
    return {x: lerp(P.x, Q.x, t),
            y: lerp(P.y, Q.y, t)};
}

class Diagram {
    constructor(containerId) {
        this.root = d3.select(`#${containerId}`);
        this.t = 0.3;
        this.A = {x: 2, y: 2};
        this.B = {x: 20, y: 8};
        this.parent = this.root.select("svg");

        this.addGrid();
        this.addTrack();
        // this.addLine();
        this.addInterpolated();
        this.addHandles();
        this.makeScrubbableNumber('t', 0.0, 1.0, 2);
        this.update();
    }

    update() {
        this.updateTrack();
        // this.updateLine();
        this.updateInterpolated();
    }

    addGrid() {
        this.gGrid = this.parent.append('g');
        for (let x = 0; x < 25; x++) {
            for (let y = 0; y < 10; y++) {
                this.gGrid.append('rect')
                    .attr('transform', `translate(${x*scale}, ${y*scale})`)
                    .attr('width', scale)
                    .attr('height', scale)
                    .attr('fill', "white")
                    .attr('stroke', "gray");
            }
        }
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

    addLine() {
        this.gPoints = this.parent.append('g');
    }
    
    updateLine() {
        let rects = this.gPoints.selectAll('rect')
            .data(pointsOnLine(this.A, this.B));
        rects.exit().remove();
        rects.enter().append('rect')
            .attr('width', scale-1)
            .attr('height', scale-1)
            .attr('fill', "hsl(0,40%,70%)")
            .merge(rects)
            .attr('transform', (p) => `translate(${p.x*scale}, ${p.y*scale})`);
        
    }
    
    updateLerpValues() {
        /* This is a hack, for the section that has scrubbable 
           numbers but no actual diagram. It might've been better
           to make scrubbable numbers independent of the Diagram
           class but this was simpler, and often simple code with
           a hack wins over complex code */
        let t = this.t;
        function set(id, fmt, lo, hi) {
            d3.select(id).text(d3.format(fmt)(lerp(lo, hi, t)));
        }
        set("#lerp1", ".2f", 0, 1);
        set("#lerp2", ".0f", 0, 100);
        set("#lerp3", ".1f", 3, 5);
        set("#lerp4", ".1f", 5, 3);
    }
    
    addInterpolated() {
        this.gInterpolated = this.parent.append('circle')
            .attr('fill', "hsl(0,30%,50%)")
            .attr('r', 5);
    }
        
    updateInterpolated() {
        let interpolated = lerpPoint(this.A, this.B, this.t);
        this.gInterpolated
            .attr('cx', (interpolated.x + 0.5) * scale)
            .attr('cy', (interpolated.y + 0.5) * scale);
    }
    
    addHandles() {
        this.gHandles = this.parent.append('g');
        this.makeDraggableCircle(this.A);
        this.makeDraggableCircle(this.B);
    }
    
    makeDraggableCircle(P) {
        let diagram = this;
        let circle = this.gHandles.append('circle')
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

        function updateNumbers() {
            elements.text(() => {
                let format = `.${precision}f`;
                return d3.format(format)(diagram[name]);
            });
        }

        updateNumbers();

        elements.call(d3.drag()
                      .subject(() => ({x: positionToValue.invert(diagram[name]), y: 0}))
                      .on('drag', () => {
                          diagram[name] = positionToValue(d3.event.x);
                          updateNumbers();
                          diagram.update();
                      }));
    }
}


// let diagram1 = new Diagram('demo');
// diagram1 doesn't work because the Diagram object is hard-coded to support interpolate-t

let diagram2 = new Diagram('linear-interpolation');
let diagram3 = new Diagram('interpolate-t');
