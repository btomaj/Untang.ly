/*
 * @namespace U
 */
var U = U || {};

/**
 * Adds a shape specified through SVG path data
 * (http://www.w3.org/TR/2003/REC-SVG11-20030114/paths.html#PathData) to
 * the shape category.
 *
 *  interface Shape {
 *      string preview;
 *      string path;
 *  }
 *
 * @class Shape
 * @namespace U
 * 
 * @constructor
 *
 * @param {string} preview The path data for the preview shape relative
 *      to the top left corner of its 34 pixel allocated space. The path
 *      data must start with a capital M indicating that the following
 *      coordinates are positioned absolutely. All values and commands
 *      must be separated with a space.
 * @param {string} path The path data for the flowchart shape relative
 *      to the top left corner of its 89 pixel allocated space. The path
 *      data must start with a capital M indicating that the following
 *      coordinates are positioned absolutely. All values and commands
 *      must be separated with a space.
 */
U.Shape = (function () { // MVC: model
    "use strict";

    // Constructor
    return function Shape(previewPath, shapePath) {

        if (!(this instanceof U.Shape)) {
            return new U.Shape(previewPath, shapePath);
        }

        this.preview = previewPath;
        this.path = shapePath;

    };

}());

/**
 * Creates a new node at the given grid (x, y) coordinates.
 *
 *  interface Node {
 *      integer x;
 *      integer y;
 *      function draw;
 *      Shape shape;
 *  }
 *
 * @class Node
 * @namespace U
 * 
 * @constructor
 *
 * @param {integer} x Grid x coordinate for new Single node.
 * @param {integer} y Grid y coordinate for new Single node.
 */
U.Node = (function () { // MVC: model
    "use strict";

    // Private properties

    // Constructor
    return function Node(x, y) {

        if (!(this instanceof U.Node)) {
            return new U.Node(x, y);
        }

        this.x = x;
        this.y = y;

        /**
         * Assigns a Shape object to the Node object.
         *
         * @method draw
         *
         * @param {Shape} Shape The Shape object to assign to the Node object.
         */
        this.draw = function draw(Shape) {
            this.shape = Shape;
        };
    };
}());

/**
 * @class Canvas
 * @namespace U
 *
 * @constructor
 */
U.Canvas = (function () {
    "use strict";

    // Constructor
    return function Canvas() {

        if (!(this instanceof U.Canvas)) {
            return new U.Canvas();
        }

        this.grid = [];

        this.add = function add(Node) {
            var x = Node.x,
                y = Node.y,
                grid = this.grid;

            if (!grid[x]) {
                grid[x] = [];
            }

            if (!grid[x][y]) {
                grid[x][y] = Node;
            }
        };

        this.remove = function remove(Node) {
            var x = Node.x,
                y = Node.y,
                grid = this.grid;

            grid[x][y] = undefined;
        };

    };

}());

/**
 * @class CanvasController
 * @namespace U
 *
 * @constructor
 *
 * @param {Canvas} Canvas The Canvas object that acts as the model.
 * @param {CanvasView} CanvasView The CanvasView object that acts as the view.
 */
U.CanvasController = (function () {
    "use strict";

    return function CanvasController(Canvas, CanvasView) {
        
        if (!(this instanceof U.CanvasController)) {
            return new U.CanvasController(Canvas, CanvasView);
        }

    };
}());

U.flowchart = (function () { // MVC: model
    "use strict";

    // Private properties
        /**
         * Stores the objects generated for nodes in the "createNode" method in
         * terms of their grid (x,y) coordinates such that they can be accessed
         * through "grid[x][y]".
         *
         * @property grid
         * @type array
         */
    var grid = [],

        /**
         * Holds a reference to the objects generated in the "createNode" and
         * methods for each node.
         *
         * @property node
         * @type array
         */
        node = [],

        /**
         * Holds the values of the bounds of the canvas recorded as units from
         * the origin, eg. if bound.west is east of the origin it is recorded
         * as a negative value.
         *
         * @property bound
         * @type object
         */
        bound = {
            north: 0,
            east: 0,
            south: 0,
            west: 0
        },


    // Private methods
        /**
         * Adjusts the value of the given bound by the value indicated.
         *
         * When both parameters are omitted all four bounds will be determined
         * by the active nodes; if no active nodes exist the bounds will be set
         * to Infinity and all operations relying on bounds will break. Calling
         * adjustBound without parameters is also inefficient. "adjustBound();"
         * must only be used when bounds cannot be determined in any other way
         * and only when at least one node exists.
         *
         * Event "model:UpdatedBounds" is fired after successful execution.
         * Event object for "model:UpdatedBounds" implements Bound.
         *  interface Bound {
         *      integer north;
         *      integer east;
         *      integer south;
         *      integer west;
         *  }
         *
         * @method adjustBound
         *
         * @param {string} direction [Optional] Valid values are "north",
         *      "east", "south" and "west".
         * @param {integer} value [Optional] The value by which the bound should
         *      be adjusted. Valid range is Infinity > value > -Infinity.
         */
        adjustBound = function adjustBound(direction, value) {

            var x = [],
                y = [],
                i;

            direction = direction.toLowerCase();

            switch (direction) {
            case "north":
                bound.north += value;
                break;

            case "east":
                bound.east += value;
                break;

            case "south":
                bound.south += value;
                break;

            case "west":
                bound.west += value;
                break;

            default:
                for (i = node.length; i--;) {
                    x.push(node[i].x);
                    y.push(node[i].y);
                }
                adjustBound("north", Math.max.apply(Math, y) - bound.north);
                adjustBound("east", Math.max.apply(Math, x) - bound.east);
                adjustBound("south", -Math.min.apply(Math, y) - bound.south);
                adjustBound("west", -Math.min.apply(Math, x) - bound.west);
                break;
            }

        },

        /**
         * Creates a new Single node at the given grid (x, y) coordinates.
         *
         * The node's object stored in the grid and node arrays implements
         * SingleNode.
         *
         *  interface SingleNode {
         *      integer x;
         *      integer y;
         *      integer i; // index in node array
         *  }
         *
         * @method createNode
         *
         * @param {integer} x Grid x coordinate for new Single node.
         * @param {integer} y Grid y coordinate for new Single node.
         */
        createNode = function createNode(x, y) {

            if (!grid[x]) {
                grid[x] = [];
            }

            if (!grid[x][y]) {
                var singleNode = {
                        x: x,
                        y: y,
                        i: node.length
                    };
                node.push(singleNode);
                grid[x][y] = singleNode;
            }

        },

        /**
         * Attaches the supplied shape to the specifed node and in so doing
         * marks the node as Engaged. This process also creates Single nodes
         * adjacent to the Engaged node, North, East, South and West, to keep
         * the application functioning.
         *
         * The node's object stored in the grid and node arrays is updated and
         * implements EngagedNode.
         *
         * Event "model:EngagedNode" fired after successful execution.
         * Event object for "model:SingleNode" implements EngagedNode
         *
         *  interface EngagedNode {
         *      integer x;
         *      integer y;
         *      integer i; // index in node array
         *      string pathData;
         *  }
         *
         * @method engageNode
         *
         * @param {integer} x Grid x coordinate of node to make Engaged.
         * @param {integer} y Grid y coordinate of node to make Engaged.
         * @param {string} pathData SVG path data describing the shape of the
         *      Engaged node (see documentation for U.Shapes).
         */
        engageNode = function engageNode(x, y, pathData) {

            grid[x][y].pathData = pathData;

            if (y + 1 > bound.north) {
                adjustBound("north", 1);
            } 
            createNode(x, y + 1);

            if (x + 1 > bound.east) {
                adjustBound("east", 1);
            }
            createNode(x + 1, y);

            if (y - 1 < -bound.south) {
                adjustBound("south", 1);
            }
            createNode(x, y - 1);

            if (x - 1 < -bound.west) {
                adjustBound("west", 1);
            }
            createNode(x - 1, y);
        },

        /**
         * Removes the specified Engaged node and any freestanding Single nodes
         * left behind as a result.
         *
         * Must only be called on Engaged nodes.
         *
         * Event "model:RemovedNode" fired before successful execution.
         * Event object for "model:RemovedNode" implements EngagedNode (see
         * documentation for engageNode method).
         *
         * @method removeNode
         *
         * @param {integer} x Grid x coordinate of Engaged node to remove.
         * @param {integer} y Grid y coordinate of Engaged node to remove.
         */
        removeNode = function removeNode(x, y) {

            if (grid[x][y].shapePath) {
                var dead = [],
                    adjacentSingleNodes = 0,
                    NorthWest = !!(grid[x - 1][y + 1] &&
                            grid[x - 1][y + 1].shapePath),
                    NorthEast = !!(grid[x + 1][y + 1] &&
                            grid[x + 1][y + 1].shapePath),
                    SouthEast = !!(grid[x + 1][y - 1] &&
                            grid[x + 1][y - 1].shapePath),
                    SouthWest = !!(grid[x - 1][y - 1] &&
                            grid[x - 1][y - 1].shapePath),
                    l = node.length,
                    i;

                //                      NN              N = North

                //                 NW   N   NE          E = East

                //             WW   W   x   E   EE      S = South

                //                 SW   S   SE          W = West

                //                     SS               x = removed node
                if (!grid[x][y + 1].shapePath) { // North
                    adjacentSingleNodes += 1;

                    if (grid[x][y + 2] && grid[x][y + 2].shapePath) { // North North
                    } else if (NorthWest) {
                    } else if (NorthEast) {
                    } else {
                        dead.push(grid[x][y + 1]);
                    }
                }
                if (!grid[x + 1][y].shapePath) { // East
                    adjacentSingleNodes += 1;

                    if (grid[x + 2] && grid[x + 2][y] &&
                            grid[x + 2][y].shapePath) { // East East
                    } else if (NorthEast) {
                    } else if (SouthEast) {
                    } else {
                        dead.push(grid[x + 1][y]);
                    }
                }
                if (!grid[x][y - 1].shapePath) { // South
                    adjacentSingleNodes += 1;

                    if (grid[x][y - 2] && grid[x][y - 2].shapePath) { // South South
                    } else if (SouthEast) {
                    } else if (SouthWest) {
                    } else {
                        dead.push(grid[x][y - 1]);
                    }
                }
                if (!grid[x - 1][y].shapePath) { // West
                    adjacentSingleNodes += 1;

                    if (grid[x - 2] && grid[x - 2][y] &&
                            grid[x - 2][y].shapePath) { // West West
                    } else if (SouthWest) {
                    } else if (NorthWest) {
                    } else {
                        dead.push(grid[x - 1][y]);
                    }
                }

                dead.push(grid[x][y]);

                for (i = dead.length; i--;) {
                    grid[dead[i].x][dead[i].y] = undefined;

                    l -= 1;
                    node[l].i = dead[i].i;
                    node[dead[i].i] = node[l];
                    node.pop();
                }

                if (adjacentSingleNodes < 4 || // removed node was adjacent to Engaged node
                        l === 0) { // no nodes remain and program has stopped
                    createNode(x, y);
                }

                adjustBound();
            }

        };

    // End var


    // Initialisation proceedures

}());

U.flowchartController = (function () { // MVC: controller

    // Private methods
    var addSingleBehaviour = function addSingleBehaviour(node) {

            $(node.shape).click(function () {

                /*observer.trigger("controller:SingleNode", {
                    active: 1,
                    x: node.x,
                    y: node.y
                });*/

            });

        },

        addEngagedBehaviour = function addEngagedBehaviour(node) {

            $(node.shape).click(function () {

                /*observer.trigger("controller:EngagedNode", {
                    active: 1,
                    x: node.x,
                    y: node.y
                });*/

            });

        };

    // End var


    // Initialisation proceedures

    // XXX SAFER IF DONE THROUGH MODEL
    /*observer.trigger("model:UpdatedBounds", { // initialise canvas start size for MVC: view
        north: 0,
        east: 0,
        south: 0,
        west: 0
    });*/

}());
