import React, {
    useState,
    useEffect
} from "react";
import PropTypes from "prop-types";

const ParticleAnimation = (props) => {
    const [canvasRef] = useState(React.createRef());
    const circle = 2 * Math.PI;

    const {
        classes,
        sensitivity,
        siblings,
        nodeMargin,
        anchorLength,
        mouseRadius,
        r,
        g,
        b
    } = props;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        resizeWindow();

        let nodes = [];
        let usedNodes = 0;
        let mouse = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };

        if (!ctx) {
            alert("Your browser does not support canvas!");
            return;
        }

        function Node(x, y) {
            this.anchorX = x;
            this.anchorY = y;
            this.x = Math.random() * (x - (x - anchorLength)) + (x - anchorLength);
            this.y = Math.random() * (y - (y - anchorLength)) + (y - anchorLength);
            this.vx = Math.random() * 2 - 1;
            this.vy = Math.random() * 2 - 1;
            this.energy = Math.random() * 100;
            this.radius = Math.random();
            this.siblings = [];
            this.brightness = 0;

            this.drawNode = () => {
                let color = `rgba(${r}, ${g}, ${b}, ${this.brightness})`;

                ctx.beginPath();
                ctx.arc(this.x, this.y, 2 * this.radius + 2 * this.siblings.length / siblings, 0, circle);
                ctx.fillStyle = color;
                ctx.fill();
            };

            this.drawConnections = () => {
                this.siblings.forEach(sibling => {
                    let color = `rgba(${r}, ${g}, ${b}, ${this.brightness})`;

                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(sibling.x, sibling.y);
                    ctx.lineWidth = 1 - calculateDistance(this, sibling) / sensitivity;
                    ctx.strokeStyle = color;
                    ctx.stroke();
                });
            };

            this.moveNode = () => {
                this.energy -= 2;

                if (this.energy < 1) {
                    this.energy = Math.random() * 100;
                    this.vx = calculateSpread(this.x, this.anchorX);
                    this.vy = calculateSpread(this.y, this.anchorY);
                }

                this.x += this.vx * this.energy / 100;
                this.y += this.vy * this.energy / 100;
            };
        }

        function initNodes() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            nodes = [];

            for (let i = nodeMargin; i < canvas.width; i += nodeMargin) {
                for (let j = nodeMargin; j < canvas.height; j += nodeMargin) {
                    nodes.push(new Node(i, j));
                    usedNodes++;
                }
            }
        }

        function calculateDistance(node1, node2) {
            return Math.sqrt(Math.pow(node1.x - node2.x, 2) + (Math.pow(node1.y - node2.y, 2)));
        }

        function calculateSpread(coordinate, anchorCoordinate) {
            if (coordinate - anchorCoordinate < -anchorLength) return Math.random() * 2;
            else if (coordinate - anchorCoordinate > anchorLength) return Math.random() * -2;
            else return Math.random() * 4 - 2;
        }

        function findSiblings() {
            let node1, node2, distance;

            for (let i = 0; i < usedNodes; i++) {
                node1 = nodes[i];
                node1.siblings = [];

                for (let j = 0; j < usedNodes; j++) {
                    node2 = nodes[j];

                    if (node1 !== node2) {
                        distance = calculateDistance(node1, node2);

                        if (distance < sensitivity) {
                            if (node1.siblings.length < siblings) {
                                node1.siblings.push(node2);
                            }
                            else {
                                let nodeSiblingDistance = 0;
                                let maxDistance = 0;
                                let s = 0;

                                for (let k = 0; k < siblings; k++) {
                                    nodeSiblingDistance = calculateDistance(node1, node1.siblings[k]);

                                    if (nodeSiblingDistance > maxDistance) {
                                        maxDistance = nodeSiblingDistance;
                                        s = k;
                                    }
                                }

                                if (distance < maxDistance) {
                                    node1.siblings.splice(s, 1);
                                    node1.siblings.push(node2);
                                }
                            }
                        }
                    }
                }
            }
        }

        function redrawScene() {
            resizeWindow();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            findSiblings();

            let i, node, distance;

            for (i = 0; i < usedNodes; i++) {
                node = nodes[i];
                distance = calculateDistance({
                    x: mouse.x,
                    y: mouse.y
                }, node);

                if (distance < mouseRadius) node.brightness = 1 - distance / mouseRadius;
                else node.brightness = 0;
            }

            for (i = 0; i < usedNodes; i++) {
                node = nodes[i];

                if (node.brightness) {
                    node.drawNode();
                    node.drawConnections();
                }

                node.moveNode();
            }

            requestAnimationFrame(redrawScene);
        }

        function initHandlers() {
            window.addEventListener('resize', resizeWindow, false);
            document.addEventListener('mousemove', mousemoveHandler, false);
        }

        function resizeWindow() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function mousemoveHandler(e) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }

        initHandlers();
        initNodes();
        redrawScene();
    });

    return (
        <div className={classes}>
            <canvas ref={canvasRef} />
        </div>
    );
};

ParticleAnimation.propTypes = {
    classes: PropTypes.string,
    sensitivity: PropTypes.number,
    siblings: PropTypes.number,
    nodeMargin: PropTypes.number,
    anchorLength: PropTypes.number,
    mouseRadius: PropTypes.number,
    r: PropTypes.number,
    g: PropTypes.number,
    b: PropTypes.number
};

ParticleAnimation.defaultProps = {
    classes: '',
    sensitivity: 100,
    siblings: 10,
    nodeMargin: 50,
    anchorLength: 20,
    mouseRadius: 200,
    r: 0,
    g: 0,
    b: 0
};

export default ParticleAnimation;