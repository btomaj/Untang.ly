/*global U */
var nodeUnit = require("nodeUnit"),
    assert = require("assert"),
    fs = require("fs"),
    vm = require("vm"),

    ShapeTestSuite = {
        "test U.Shape stores preview": function () {
            "use strict";

            var square = new U.Shape("smallSquare", "largeSquare");

            assert(square.preview === "smallSquare", "Shape does not store preview");
        },
        "test U.Shape stores shape": function () {
            "use strict";

            var square = new U.Shape("smallSquare", "largeSquare");

            assert(square.shape === "largeSquare", "Shape does not store shape");
        },
        "test U.Shape works correctly when invoked without \"new\"": function () {
            "use strict";

            var square = U.Shape("smallSquare", "largeSquare");

            assert(square.shape !== undefined && square.preview !== undefined, "Shape breaks when invoked without \"new\"");
        }
    },

    NodeTestSuite = {
        setUp: function () {
            "use strict";

            this.node = new U.Node(1, 2);
            this.shape = new U.Shape("preview", "path");

        },
        "test Node.draw() assigns Shape object to Node object": function () {
            "use strict";

            this.node.draw(this.shape);

            assert(this.node.shape === this.shape, "Node.draw failed to record Shape object");
        },
        "test Node.undraw() removes Shape object from Node object": function () {
            "use strict";

            this.node.draw(this.shape);
            this.node.undraw();

            assert(this.node.shape === undefined, "Node.undraw() failed to remove Shape object");
        }
    },

    CanvasTestSuite = {
        setUp: function () {
            "use strict";

            this.canvas = new U.Canvas();
            this.node = new U.Node(0, 0);
        },
        "test U.Canvas.add stores Node object in grid": function () {
            "use strict";

            this.canvas.add(this.node);

            assert(this.canvas.grid[this.node.x][this.node.y] === this.node, "U.Canvas.add does not store Node object in grid");
        },
        "test U.Canvas.remove removes Node object from grid": function () {
            "use strict";

            this.canvas.add(this.node);
            this.canvas.remove(this.node);
            assert(this.canvas.grid[this.node.x][this.node.y] === undefined, "U.Canvas.remove does not remove Node object from grid");
        },
        "test U.Canvas.add does not overwrite existing Node": function () {
            "use strict";

            var node_original = new U.Node(0, 0),
                node_new = new U.Node(0, 0),
                shape = new U.Shape("preview", "path");

            this.canvas.add(node_original);
            node_original.draw(shape);
            this.canvas.add(node_new);

            assert(this.canvas.grid[0][0].shape === shape, "Node was overwritten");
        },
        tearDown: function () {
            "use strict";

            delete this.node;
            delete this.canvas;
        }
    },

    CanvasControllerTestSuite = {
        setUp: function () {
            "use strict";

            this.canvas = new U.Canvas();
            this.node = new U.Node(0, 0);
            this.shape = new U.Shape("preview", "path");
            this.canvasController = new U.CanvasController(this.canvas);

        },
        "test U.CanvasController returns model": function () {
            "use strict";

            assert(this.canvasController.model === this.canvas, "U.CanvasController does not return model");
        },
        "test U.CanvasController.draw() assigns Shape object to Node object": function () {
            "use strict";

            this.canvas.add(this.node);
            this.canvasController.draw(this.node, this.shape);

            assert(this.canvas.grid[this.node.x][this.node.y].shape === this.shape, "Shape object was not assigned to Node object");
        },
        "test U.CanvasController.draw() adds new Node objects around the drawn Node object": function () {
            "use strict";

            this.canvas.add(this.node);
            this.canvasController.draw(this.node, this.shape);

            assert(this.canvas.grid[this.node.x][this.node.y + 1] !== undefined, "No Node found north of drawn Node");
            assert(this.canvas.grid[this.node.x + 1][this.node.y] !== undefined, "No Node found east of drawn Node");
            assert(this.canvas.grid[this.node.x][this.node.y - 1] !== undefined, "No Node found south of drawn Node");
            assert(this.canvas.grid[this.node.x + 1][this.node.y] !== undefined, "No Node found west of drawn Node");
        },
        "test U.CanvasController.undraw() removes Shape object from Node object": function () {
            "use strict";

            this.canvas.add(this.node);
            this.canvasController.draw(this.node, this.shape);
            this.canvasController.undraw(this.node);

            assert(this.canvas.grid[this.node.x][this.node.y].shape === undefined, "Shape object was not removed from Node object");
        },
        "test U.CanvasController.undraw() removes Node objects around undrawn Node object": function () {
            "use strict";

            this.canvas.add(this.node);
            this.canvasController.draw(this.node, this.shape);
            this.canvasController.undraw(this.node);

            assert(this.canvas.grid[this.node.x][this.node.y + 1] === undefined, "Node north of removed Node was not removed");
            assert(this.canvas.grid[this.node.x + 1][this.node.y] === undefined, "Node east of removed Node was not removed");
            assert(this.canvas.grid[this.node.x][this.node.y - 1] === undefined, "Node south of removed Node was not removed");
            assert(this.canvas.grid[this.node.x + 1][this.node.y] === undefined, "Node west of removed Node was not removed");
        },
        "test U.CanvasController.remove() removes Node object from Canvas object": function () {
            "use strict";

            this.canvas.add(this.node);
            this.canvasController.remove(this.node);

            assert(this.canvas.grid[this.node.x][this.node.y] === undefined, "Node object was not removed from Canvas object");
        },
        "test U.CanvasController.remove() does not remove Node object with assigned Shape object": function () {
            "use strict";

            this.canvas.add(this.node);
            this.canvasController.draw(this.node, this.shape);
            this.canvasController.remove(this.node);

            assert(this.canvas.grid[this.node.x][this.node.y] === this.node, "Node object with assigned Shape object was removed from Canvas object");
        },
        "test U.CanvasController.remove() does not remove Node object adjacent to northern Node object with attached Shape object": function () {
            "use strict";

            var north = new U.Node(this.node.x, this.node.y + 1);

            this.canvas.add(this.node);
            this.canvas.add(north);
            this.canvasController.draw(north, this.shape);
            this.canvasController.remove(this.node);

            assert(this.canvas.grid[this.node.x][this.node.y] === this.node, "Node object adjacent to northern Node object with assigned Shape object was removed");
        },
        "test U.CanvasController.remove() does not remove Node object adjacent to eastern Node object with attached Shape object": function () {
            "use strict";

            var east = new U.Node(this.node.x + 1, this.node.y);

            this.canvas.add(this.node);
            this.canvas.add(east);
            this.canvasController.draw(east, this.shape);
            this.canvasController.remove(this.node);

            assert(this.canvas.grid[this.node.x][this.node.y] === this.node, "Node object adjacent to eastern Node object with assigned Shape object was removed");
        },
        "test U.CanvasController.remove() does not remove Node object adjacent to southern Node object with attached Shape object": function () {
            "use strict";

            var south = new U.Node(this.node.x, this.node.y - 1);

            this.canvas.add(this.node);
            this.canvas.add(south);
            this.canvasController.draw(south, this.shape);
            this.canvasController.remove(this.node);

            assert(this.canvas.grid[this.node.x][this.node.y] === this.node, "Node object adjacent to southern Node object with assigned Shape object was removed");
        },
        "test U.CanvasController.remove() does not remove Node object adjacent to western Node object with attached Shape object": function () {
            "use strict";

            var west = new U.Node(this.node.x - 1, this.node.y);

            this.canvas.add(this.node);
            this.canvas.add(west);
            this.canvasController.draw(west, this.shape);
            this.canvasController.remove(this.node);

            assert(this.canvas.grid[this.node.x][this.node.y] === this.node, "Node object adjacent to western Node object with assigned Shape object was removed");
        },
        //TODO "test U.CanvasController.remove() does not remove the last remaining Node object": function () {},
        tearDown: function () {
            "use strict";

            delete this.canvas;
            delete this.node;
            delete this.shape;
            delete this.canvasController;
        }
    };

new vm.Script(fs.readFileSync(__dirname + "/../untangly.js")).runInThisContext();

nodeUnit.test(ShapeTestSuite);
nodeUnit.test(NodeTestSuite);
nodeUnit.test(CanvasTestSuite);
nodeUnit.test(CanvasControllerTestSuite);
