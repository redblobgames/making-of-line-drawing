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

    addInterpolated(t) {
        this.t = t;
        this.makeScrubbableNumber('t', 0.0, 1.0, 2);
        let g = this.parent.append('g');
        let circle = g.append('circle')
            .attr('fill', "hsl(0,30%,50%)")
            .attr('r', 5);
        this.onUpdate(() => {
            let interpolated = lerpPoint(this.A, this.B, this.t);
            circle
                .attr('cx', (interpolated.x + 0.5) * scale)
                .attr('cy', (interpolated.y + 0.5) * scale);
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

        function updateNumbers() {
            elements.text(() => {
                let format = `.${precision}f`;
                return d3.format(format)(diagram[name]);
            });
        }

        updateNumbers();

        elements.call(d3.drag()
                      .subject({x: positionToValue.invert(diagram[name]), y: 0})
                      .on('drag', () => {
                          diagram[name] = positionToValue(d3.event.x);
                          updateNumbers();
                          diagram.update();
                      }));
    }
}


let diagram_t = new Diagram('layers')
    .addGrid()
    .addTrack()
    .addInterpolated(0.5)
    .addHandles();
