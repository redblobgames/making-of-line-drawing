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


class Diagram {
    constructor(containerId) {
        this.A = {x: 2, y: 2};
        this.B = {x: 20, y: 8};
        this.parent = d3.select(`#${containerId} svg`);
        this.gGrid = this.parent.append('g');
        this.gPoints = this.parent.append('g');
        this.gHandles = this.parent.append('g');

        this.drawGrid();
        this.makeDraggableCircle(this.A);
        this.makeDraggableCircle(this.B);
        this.update();
    }

    update() {
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

    drawGrid() {
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
    
}


let diagram = new Diagram('demo');
