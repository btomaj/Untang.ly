/*jslint maxlen: 80 */
/**
 * TODO update documentation
 *
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
        this.shape = shapePath;

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

        this.undraw = function undraw() {
            this.shape = undefined;
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

            // TODO throw error if program attempts to overwrite existing node
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

        this.model = Canvas;

        this.draw = function draw(Node, Shape) {
            Node.draw(Shape);

            // Add new Node objects to empty coordinates surrounding Node object with assigned Shape object
            this.model.add(new U.Node(Node.x, Node.y + 1)); // north
            this.model.add(new U.Node(Node.x + 1, Node.y)); // east
            this.model.add(new U.Node(Node.x, Node.y - 1)); // south
            this.model.add(new U.Node(Node.x - 1, Node.y)); // west
        };

        this.undraw = function undraw(Node) {
            Node.undraw();

            // Remove orphaned Node objects that are left behind
            this.remove(this.model.grid[Node.x][Node.y + 1]); // north
            this.remove(this.model.grid[Node.x + 1][Node.y]); // east
            this.remove(this.model.grid[Node.x][Node.y - 1]); // south
            this.remove(this.model.grid[Node.x - 1][Node.y]); // west
        };

        /**
         * Removes a Node object from the Canvas object after checking that it:
         * 1. Does not have an attached Shape object
         * 2. Is not adjacent to a Node object with an attached Shape object
         *
         * TODO throw error if program tries to remove a Node object with an
         *  attached Shape object.
         *
         * @method remove
         *
         * @param {Node} The Node object to remove from the Canvas object
         */
        this.remove = function remove(Node) {
            var northShape = this.model.grid[Node.x] &&
                    this.model.grid[Node.x][Node.y + 1] &&
                    this.model.grid[Node.x][Node.y + 1].shape,
                eastShape = this.model.grid[Node.x + 1] &&
                    this.model.grid[Node.x + 1][Node.y] &&
                    this.model.grid[Node.x + 1][Node.y].shape,
                southShape = this.model.grid[Node.x] &&
                    this.model.grid[Node.x][Node.y - 1] &&
                    this.model.grid[Node.x][Node.y - 1].shape,
                westShape = this.model.grid[Node.x - 1] &&
                    this.model.grid[Node.x - 1][Node.y] &&
                    this.model.grid[Node.x - 1][Node.y].shape;

            if (!Node.shape &&
                    !northShape &&
                    !eastShape &&
                    !southShape &&
                    !westShape) {
                this.model.remove(Node);
            }
        };
    };
}());
