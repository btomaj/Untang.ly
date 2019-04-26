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

            assert(square.path === "largeSquare", "Shape does not store shape");
        },
        "test U.Shape works correctly when invoked without \"new\"": function () {
            "use strict";

            var square = U.Shape("smallSquare", "largeSquare");

            assert(square.path === "largeSquare" && square.preview === "smallSquare", "Shape breaks when invoked without \"new\"");
        }
    },

    NodeTestSuite = {
        "test U.Node stores coordinates": function () {
            "use strict";

            var node = new U.Node(1, 2);

            assert(node.x === 1 && node.y === 2, "U.Node does not store coordinates");
        },
        "test Node.draw records Shape object": function () {
            "use strict";

            var node = new U.Node(0, 0),
                shape = new U.Shape("preview", "path");

            node.draw(shape);
            assert(node.shape === shape, "Node.draw failed to record Shape object");
        }
    },

    CanvasTestSuite = {
        setUp: function () {
            "use strict";

            this.canvas = new U.Canvas();

            this.node = {
                x: 0,
                y: 0
            };
        },
        "test U.Canvas.add stores Node object in grid": function () {
            "use strict";

            this.canvas.add(this.node);

            assert(this.canvas.grid[this.node.x][this.node.y] === this.node, "U.Canvas.add does not store Node object in grid");
        },
        "test U.Canvas.remove removes Node object from grid": function () {
            "use strict";

            this.canvas.grid = [];
            this.canvas.grid[this.node.x] = [];
            this.canvas.grid[this.node.x][this.node.y] = this.node;

            this.canvas.remove(this.node);
            assert(this.canvas.grid[this.node.x][this.node.y] === undefined, "U.Canvas.remove does not remove Node object from grid");
        },
        tearDown: function () {
            "use strict";

            delete this.node;

            delete this.canvas;
        }
    },

    CanvasControllerTestSuite = {
        "test U.CanvasController": function () {
            "use strict";

            var canvasController = new U.CanvasController();
        }
    };

new vm.Script(fs.readFileSync(__dirname + "/../untangly.js")).runInThisContext();

nodeUnit.test(ShapeTestSuite);
nodeUnit.test(NodeTestSuite);
nodeUnit.test(CanvasTestSuite);
nodeUnit.test(CanvasControllerTestSuite);
