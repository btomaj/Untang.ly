/**
 *
 *       /  /     /   _             /
 *      /  / /-  /-  _ / /-   _    /
 *     /__/ / / /_/ /_/ / / /_/ . / /_/
 *                          _/      _/
 *
 * -----------------------------------------------------------------------------
 *
 * Untang.ly is a web based diagramming application designed to simplify the
 * user experience (UX) of creating diagrams and bring it closer to its creative
 * and exploratory thought process.
 *
 * The design goal is to create a diagram sketching application that's faster
 * and more efficient for fleshing out ideas than pen and paper but has the
 * flexibility to introduce changes without having to manually redraw the
 * diagram.
 * 
 * ---
 *
 * A major part of the UX innovation is the use of nodes in fixed positions that
 * that can then be converted into meaningful diagramming objects. The fixed
 * positions remove the concern for design from the diagramming process and lets
 * the user focus on the meaning that the diagram is intended to communicate.
 * Untang.ly is designed with the belief that form follows function.
 *
 * "Less and more"  -- Dieter Rams
 *
 * Following is an explanation of the design of the software.
 *
 *
 * NODES
 * -----
 * Nodes are spawned in fixed locations on an imaginary grid (as explained in
 * the next section below) and are the interaction points through which the user
 * builds diagrams.
 *
 * All nodes have one of two states:
 * - Single
 * - Engaged
 * (NB the capitalisation.)
 *
 * Single nodes are the points at which the user can create new diagram objects.
 * Once a node has been converted into a diagram shape it is considered Engaged.
 *
 * New Single nodes are only created in response to the conversion of an
 * existing Single node into an Engaged node and only one for each of above,
 * right, below and left of the node. To avoid overwriting existing nodes each
 * location around the converted node needs to be confirmed empty before a new
 * Single node is created.
 *
 *
 * GRID
 * ----
 * Internally, the position of nodes are recorded with respect to an imaginary
 * unit grid where all nodes are 1 unit away from other nodes.
 *
 *                                    .
 *                         1 unit - {
 *                                .   O   .
 *                                              O = origin
 *                                    .
 *
 * All nodes are located on the grid using (x,y) coordinates where x and y are
 * the number of units from the origin. The origin is the first node spawned on
 * the canvas and is located at (0,0).
 *
 * This grid has been created to give the software awareness of each node's
 * surroundings. Each node stores its own x and y coordinates which the software
 * can then use to locate the surrounding nodes as needed.
 *
 *                               (x,y+1)
 *
 *
 *
 *                   (x-1,y)      (x,y)       (x+1,y)
 *
 *
 *
 *                               (x,y-1)
 *
 * The grid is stored in a 2D array named "grid". For reasons of efficiency, the
 * software will never traverse through the 2D grid; the array is only a storage
 * mechanism that's accessed through specific coordinates (i.e. "grid[x][y]").
 *
 * The grid starts with the origin and expands only in response to the creation
 * of new nodes as the user interracts with the software.
 * 
 * The actual pixel distance between nodes on the page is determined separately.
 *
 *
 * BOUND
 * -----
 * The bound is the distance from the origin going North (up), East (right),
 * South (down) and West (left). It provides the software with an awareness of
 * the size and edges of the grid.
 *
 * The software uses this information to determine the positioning of nodes and
 * the size of the canvas upon which they are drawn.
 *
 *
 * CANVAS
 * ------
 * The canvas refers to the actual space upon which Untang.ly is drawn for the
 * user. To be drawn on the canvas the grid units used by the internal logic
 * needs to be converted into pixels. The following conversions are always
 * subject to change.
 *
 * o in the diagram below represents a node and (object) represents the maximum
 * space the shape of an Engaged node can occupy. All units are in pixels.
 *
 *                 (object)       (space)      (object)
 *                    89            55            89
 *             _______^_______  ____^____  _______^_______
 *            /               \/         \/               \
 *
 *                    o                           o
 *
 *                    \_____________ _____________/
 *                                   v
 *                                  144
 *                                 (gap)
 *      (not to scale)
 *
 * The canvas grows dynamically based on the number of nodes in the diagram. In
 * combination with some CSS this allows the diagram to always stay centered on
 * the page until it grows beyond the size of the browser window.
 *
 *
 * SHAPES
 * ------
 * Upon clicking on a Single node, a small menu is displayed on top of the
 * node's location from which the user can select the desired shape. Once the
 * user has selected a shape it is drawn in the space of the Single node and the
 * node is considered Engaged.
 *
 * Shapes are added to the selection box using the following pattern:
 *
 *                           _______________
 *                          |               |
 *                          |   0   1   2   |
 *                          |               |
 *                          |   3   4   5   |
 *                          |               |
 *                          |   6   7   8   |
 *                          |               |
 *                          |   9  ... etc. |
 *                          |               |
 *
 * Each small shape is allocated space as follows:
 *
 *                    |                             |
 *                    |(padding)   (shape)   (padding)
 *                    |  10.5        34        10.5 |
 *                ___ | __^__  ______^______  __^__ | ___
 *                   \|/     \/             \/     \|/
 *         0  ...     |              1              |     ...  2
 *                ___/|\_____________ _____________/|\___
 *                    |              v              |
 *                    |             55              |
 *                    |          (total)            |
 *                    |                             |
 *
 *              (not to scale)
 *
 * with the same spacing pattern being used for both horizontal and vertical
 * spacing.
 *
 * Large shapes are allocated space as indicated in the canvas section above.
 *
 * 
 * @module Untangly
 *
 * @requires Raphael
 * @requires jQuery
 */
var U = U || {};


/**
 * Facade to the SVG/VML library.
 *
 * Current library is Raphaël (http://raphaeljs.com/reference.html).
 *  - Available attributes for Elements includes those specified under each
 *      element type as well as those specified under "attr".
 *
 * @class Canvas
 * @namespace U
 *
 * @constructor
 *
 * @param {string} container ID attribute of the HTML element that will be
 *      parent to the SVG/VML canvas.
 * @param {object} [Optional] Key-value pairs to specify the starting width and
 *      height attributes of the SVG element (canvas).
 */
U.Canvas = (function () {

    // Dependancies
    var //Raphael = Raphael || {},


    // Private properties


    // Private methods
        Canvas;

    // End var


    // Constructor
    Canvas = function Canvas(container, attributes) {

        if (!(this instanceof U.Canvas)) {
            return new U.Canvas(container, attributes);
        }

        attributes = attributes || {};
        attributes.width = attributes.width || 0;
        attributes.height = attributes.height || 0;

        this.r = new Raphael(container, attributes.width,
                attributes.height);

        /**
         * Current width of the SVG/VML canvas.
         *
         * @property width
         * @type integer
         */
        this.width = this.r.width;

        /**
         * Current height of the SVG/VML canvas.
         *
         * @property height
         * @type integer
         */
        this.height = this.r.height;

    };


    // Constructor prototype
    /**
     * Creates "Paths" (http://www.w3.org/TR/SVG/paths.html) and "Basic Shapes"
     * (http://www.w3.org/TR/SVG/shapes.html).
     *
     * @method create
     *
     * @param {string} type Valid types are "path", "rect", "circle", and
     *      "ellipse" as defined by the SVG 1.1 Specification.
     * @param {object} attributes Key-value pairs defining starting attributes
     *      for the element. For list of vailable attributes see library
     *      documentation (attribute names used must be those specified in the
     *      W3C SVG 1.1 Specification).
     *
     * @return {object} The object created by Raphael for SVG/VML elements.
     */
    Canvas.prototype.create = function create(type, attributes) {

        var element,
            elementDimensions,
            x, // for "rect"
            y, // for "rect"
            width, // for "rect"
            height, // for "rect"
            rx, // for "rect" and "ellipse"
            ry, // for "ellipse" (Raphael doesn't accept ry for "rect")
            cx, // for "circle" and "ellipse"
            cy, // for "circle" and "ellipse"
            r; // for "circle"

        switch (type) {
        case "path":
            element = this.r.path(attributes.d); // "d" is the required attribute
            delete attributes.d; // remove attribute from list
            element.attr(attributes); // apply remaining attributes
            break;

        case "rect":
            x = attributes.x || 0;
            y = attributes.x || 0;
            width = attributes.width;
            height = attributes.height;
            rx = attributes.rx || undefined;
            element = this.r.rect(x, y, width, height, rx);
            delete attributes.x;
            delete attributes.y;
            delete attributes.width;
            delete attributes.height;
            delete attributes.rx;
            delete attributes.ry;
            element.attr(attributes);
            break;

        case "circle":
            cx = attributes.cx || 0;
            cy = attributes.cy || 0;
            r = attributes.r;
            element = this.r.circle(cx, cy, r);
            delete attributes.cx;
            delete attributes.cy;
            delete attributes.r;
            element.attr(attributes);
            break;

        case "ellipse":
            cx = attributes.cx || 0;
            cy = attributes.cy || 0;
            rx = attributes.rx;
            ry = attributes.ry;
            element = this.r.ellipse(cx, cy, rx, ry);
            delete attributes.cx;
            delete attributes.cy;
            delete attributes.rx;
            delete attributes.ry;
            break;
        }

        // Record the width and height dimensions for the element
        elementDimensions = element.getBBox();
        element.width = elementDimensions.width;
        element.height = elementDimensions.height;

        return element;
    };

    /**
     * Adjusts attributes of any SVG/VML element.
     *
     * @method adjust
     *
     * @param {object} element [Optional] Element for which to adjust
     *      attributes. If omitted, attributes will be applied to SVG/VML top
     *      level element itself.
     * @param {object} attributes The same attributes as specified in the
     *      "create" method are available for adjustment. If the optional
     *      "element" parameter is omitted, the following attributes are
     *      available for the top level SVG/VML element:
     *       - width
     *       - height
     */
    Canvas.prototype.adjust = function adjust(element, attributes) {

        if (element.paper) {
            
            element.attr(attributes);

            // Update width and height dimensions recorded for the element if appropriate
            if (attributes.width || attributes.height || attributes.r ||
                    attributes.rx || attributes.ry) {
                var elementDimensions = element.getBBox();

                element.width = elementDimensions.width;
                element.height = elementDimensions.height;
            }
        } else {
            var width = element.width || this.width,
                height = element.height || this.height;

            this.r.setSize(width, height);

            // Update width and height dimensions of canvas
            this.width = width;
            this.height = height;
        }

    };

    /**
     * Moves the SVG/VML element relative to its current location.
     *
     * @param {object} element Element which is to be moved.
     * @param {integer} x Value by which element will be moved along the x axis.
     * @param {integer} y Value by which element will be moved along the y axis.
     */
    Canvas.prototype.move = function move(element, x, y) {

        element.translate(x, y);

    };

    /**
     * Removes any SVG/VML element except the SVG/VML top level element itself.
     *
     * @method remove
     *
     * @param {object} Element to be removed
     */
    Canvas.prototype.remove = function remove(element) {

        element.remove();

    };

    /**
     * Animates given SVG/VML element.
     *
     * Animations can be chained.
     *
     * Always call "animate()" at the end of an animation sequence to indicate
     * that the sequence is complete and to lock in the animation.
     *
     * @method animate
     *
     * @param {object} element Element to be animated.
     * @param {object} animation Object containing key-value pairs of attributes
     *      and the values to which to animate them in the given time frame.
     * @param {integer} time The timeframe in which animation occurs.
     *
     * @param {object} The canvas object is returned to enable chaining.
     */
    Canvas.prototype.animate = (function () {

        // An adaptation of the Proxy pattern
    
        var queue = [null];

        return function animate(element, animation, time) {
        
            var i = queue.length - 1;

            if (!element && !animation && !time) {
                queue[0]();
                queue = [null]; // reset queue

                return;
            }

            queue[i] = function () {

                element.animate(animation, time, queue[i + 1]);

                // Update width and height dimensions recorded for the element if appropriate
                if (animation.r) {
                    element.width = animation.r * 2;
                    element.height = animation.r * 2;
                } else if (animation.width) {
                    element.width = animation.width;
                } else if (animation.height) {
                    element.height = animation.height;
                } else if (animation.rx) {
                    if (element.type === "ellipse") { // XXX MAY NOT WORK
                        element.width = animation.rx * 2;
                    }
                } else if (animation.ry) {
                    if (element.type === "ellipse") { // XXX MAY NOT WORK
                        element.height = animation.ry * 2;
                    }
                }

            };

            queue[i + 1] = false;

            return this;
        
        };
    
    }());


    // Initialisation proceedures


    // Public API -- constructor
    return Canvas;

}());


/**
 * Creates a category to which shapes can be added.
 *
 * @class Shapes
 * @namespace U
 *
 * @constructor
 *
 * @param {string} groupName
 *
 * @return {object}
 */
U.Shapes = (function () {

    // Dependencies
    var Canvas = U.Canvas,


    // Private properties
        groupId = 0,
        container = $("#shape_previews"),


    // Private methods
        Shapes;

    // End var


    // Constructor
    Shapes = function Shapes(groupName) {

        var s,
            shapeNumber = 0;

        if (!(this instanceof U.Shapes)) {
            return new U.Shapes(groupName);
        }

        groupId += 1; // this has to be done before the following two

        $("<div/>", {
            id: "shapeset_" + groupId 
        }).appendTo(container);

        s = new Canvas("shapeset_" + groupId, {
            width: 165,
            height: 1
        });

        /**
         * Adds flowcharting shape to the shape category.
         *
         * @method add
         *
         * @param {string} preview The path data for the small shape
         *      relative to the top left corner of its 34 pixel
         *      allocated space. The path data must start with a capital
         *      M indicating that the following coordinates are
         *      positioned absolutely. This position will automatically
         *      be amended to place the shape in the correct position.
         *      All values and commands must be separated with a space.
         * @param {string} shape The path data for the big shape
         *      relative to the top left corner of its 89 pixel
         *      allocated space. The path data must start with a capital
         *      M indicating that the following coordinates are
         *      positioned absolutely. This position will automatically
         *      be amended to place the shape in the correct position.
         *      All values and commands must be separated with a space.
         */
        this.add = function add(preview, shape) {

            shapeNumber += 1;

            preview = preview.split(" ");
            // Adds 11 pixel left margin plus 55 pixels for each column to the left
            preview[1] = +preview[1] + (shapeNumber + 2) % 3 * 55 + 11;
            // Adds 11 pixel top margin plus 55 pixels for each row above the current
            // (x + 2) - (x + 2) % 3
            // --------------------- = rowNumber; rowNumber - 1 = multipler
            //           3   where x is shapeNumber
            preview[2] = +preview[2] + ((shapeNumber + 2 -
                    (shapeNumber + 2) % 3) / 3 - 1) * 55 + 11;
            preview.join(" ");

            preview = s.create("path", {
                d: preview,
                stroke: "black",
                "stroke-width": 1,
                fill: "white",
                cursor: "pointer"
            });

            preview.click(function () {

                Shapes.eventHandler(shape);

            });

            s.adjust({
                width: s.width,
                height: (shapeNumber + 2 - (shapeNumber + 2) % 3) /  3 * 55
            });

        };

    };


    // Constructor static methods
    Shapes.eventHandler = function () {};


    // Initialisation proceedures


    // Public API
    return Shapes;

}());


/**
 * Handles the functionality of the UI elements above the canvas.
 *
 * @class ui
 * @namespace U
 *
 * @static
 */
U.ui = (function () {

    // Dependencies
    var


    // Private properties
        /**
         * Holds all the receiver objects for the registered UI elements.
         *
         * @property element
         * @type object
         */
        element = {},

        /**
         * Holds an entry for each active UI element. Each entry is the master
         * of the subsequent entry and the slave of the preceding entry, forming
         * a master-slave relationship integral to the functionality of the UI.
         *
         * @property active
         * @type array
         */
        active = [],

        /**
         * Holds a reference to the HTML element used to supress the default
         * click behaviour of resetting the UI.
         *
         * @property html
         * @type array
         *
         * @private
         */
        html = $("html"),


    // Private methods
        /**
         * Registers a new UI element and its receiver that will be used to
         * control the UI element. The receiver implements the following
         * interface:
         *  property DOM;
         *  function show(options);
         *  function hide();
         *
         * @method add
         *
         * @param {string} name The name of the UI element. Will be used
         *      internally and by clients to control the UI element.
         * @param {object} receiver The receiver for the UI element that is
         *      registered.
         */
        add = function add(name, receiver) {

            element[name] = receiver;

            receiver.DOM.click(function (e) {

                e.stopPropagation();

            });

        },

        /**
         * Instructs the receiver to hide the indicated UI element and any slave
         * UI elements. If no parameter is passed all UI elements are hidden and
         * the UI is reset.
         *
         * @param {string} name [Optional] The name of the UI element (as
         *      registered with the "add" method) to hide.
         */
        hide = function hide(name) {

            var i,
                position;

            if (name) {
                // Find the UI element's position in the "active" array
                for (i = active.length; i--;) {
                    if (active[i] === name) {
                        position = i;
                        i = 0; // end loop
                    }
                }

                for (i = active.length - 1; position <= i; i -= 1) {
                    name = active.pop();
                    element[name].hide();
                }
            } else if (active.length) { // no UI elements exist when active.length = 0
                for (i = active.length; i--;) {
                    name = active.pop();
                    element[name].hide();
                }
            }

        },

        /**
         * Instructs the receiver to show the indicated UI element.
         *
         * For internal use only:
         * A property "master" can be included in the "options" parameter object
         * which will show the UI element as a slave of the given master. The
         * property has to be a string identifying a UI element using the name
         * provided when the UI element was registered through the "add" method.
         * Slave UI elements are automatically hidden when their masters are
         * hidden or a new slave is registered to the master (each master can
         * have at most ONE slave).
         *
         * @param {string} name The name of the UI element as registered with
         *      the "add" method.
         * @param {object} options [Optional] Any additional values needed to
         *      show the UI element correctly.
         */
        show = function show(name, options) {

            var master = options.master,
                i,
                sibling;

            if (master) {
                delete options.master;

                for (i = active.length; i--;) {
                    if (active[i] === master) {
                        sibling = i + 1;
                        i = 0; // end loop
                    }
                }
            }

            hide(active[sibling]); // will equate to hide() and reset UI if no master is defined

            element[name].show(options);

            active.push(name);

            // Supress click event attached to document (see Initialisation Proceedures)
            html.click(function (e) {

                e.stopPropagation();

                html.unbind();

            });

        };

    // End var


    // Initialisation proceedures
    // Step back one UI layer when <esc> is pressed
    $(document).keyup(function (e) {

        if (active.length && e.keyCode === 27) { // <esc>
            hide(active[active.length - 1]);
        }

    });

    // Reset UI when the user "clicks off", stop propagation to prevent
    $(document).click(function () {

        hide();

    });

    add("shapes", {
        DOM: $("#shape_previews"),
        show: function show(options) {

            var node = options.node,
                nodeLocation = $(node.shape.node).offset();

            this.DOM.css("left", nodeLocation.left + node.shape.width / 2 -
                    this.DOM.width() / 2 + "px");
            this.DOM.css("top", nodeLocation.top + node.shape.height / 2 -
                    this.DOM.height() / 2 + "px");

            this.DOM.css("display", "block");

        },
        hide: function hide() {

            this.DOM.css("display", "none");

        },
        init: function init() {

            this.DOM.click(function (e) {

                if (e.target.nodeName === "path") {
                    hide("shapes");
                }

            });

            return this;

        }
    }.init());


    // Public API
    return {
        show: show
    };

}());


/**
 * @class Untangly
 *
 * @static
 */
(function () {
    
    // Dependencies
    var Canvas = U.Canvas,
        Shapes = U.Shapes,
        ui = U.ui,


    // Private properties
        /**
         * Creates the SVG/VML canvas upon which the flowchart is drawn.
         *
         * @property c
         * @type object
         */
        c = new Canvas("untangly"), // dimensions declared in initialisation proceedures

        /**
         * Stores nodes in terms of their internal grid (x,y) coordinates such
         * that they can be accessed through "grid[x][y]".
         *
         * Each entry stores:
         *  - shape: the node's Raphael generated object
         *  - id: the index value of the node in the "node" array
         *  - x: the node's grid x coordinate
         *  - y: the node's grid y coordinate
         *
         * @property grid
         * @type array
         */
        grid = [],

        /**
         * Contains a reference to the object held by grid[x][y] for each node
         * created (see documentation for "grid" property for object structure).
         *
         * @property node
         * @type array
         */
        node = [],

        /**
         * Holds the values of the bounds of the canvas in grid units.
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

        /**
         * Holds pixel values used when drawing the grid on the canvas.
         *
         *             (object)       (space)      (object)
         *                89            55            89
         *         _______^_______  ____^____  _______^_______
         *        /               \/         \/               \
         *                o                           o
         *
         *                \_____________ _____________/
         *                               v
         *                              144 (= (object) + (space))
         *      (not to scale)         (gap)
         *      
         * @property pixel
         * @type object
         */
        pixel = {
            object: 89,
            space: 55
        },

        /**
         * Used in conjunction with "Shapes" as a store for the groups created
         * through the constructor.
         *
         * @property flowchartShapes
         * @type object
         */
        flowchartShapes = {},


    // Private methods
        /**
         * Returns canvas location for the given grid (x,y) coordinates.
         *
         * @method locateNode
         *
         * @param {integer} x
         * @param {integer} y
         *
         * @return {array} 0 = x, 1 = y. Arrays are faster than objects.
         */
        locateNode = function locateNode(x, y) {

            var object = pixel.object,
                space = pixel.space;

            x = space + object / 2 + // left padding
                    (Math.abs(bound.west) + x) * (object + space);       
            y = space + object / 2 + // top padding
                    (bound.north - y) * (object + space);

            return [x, y];

        },

        /**
         *
         * @method resizeCanvas
         */
        resizeCanvas = function resizeCanvas() {

            var object = pixel.object,
                space = pixel.space;

            c.adjust({
                width: (Math.abs(bound.west) + bound.east) *
                        (object + space) + object + space * 2, // account for space needed by origin node
                height: (bound.north + Math.abs(bound.south)) *
                        (object + space) + object + space * 2 + 89 // account for space needed by origin node XXX +89 for admin panel (fix when controlled by "ui")
            });

        },

        /**
         * @method adjustBound
         *
         * @param {string} direction Valid values are "north", "east",
         *      "south" and "west".
         * @param {integer} value The value by which the bound should be
         *      adjusted. Valid range is -0+.
         */
        adjustBound = function adjustBound(direction, value) {

            var position,
                i,
                object,
                space;

            switch (direction) {
            case "north":
                bound.north += value;
                resizeCanvas();
                object = pixel.object;
                space = pixel.space;
                for (i = node.length; i--;) {
                    c.move(node[i].shape, 0, space + object);
                }
                break;

            case "east":
                bound.east += value;
                resizeCanvas();
                break;

            case "south":
                bound.south -= value;
                resizeCanvas();
                break;

            case "west":
                bound.west -= value;
                resizeCanvas();
                object = pixel.object;
                space = pixel.space;
                for (i = node.length; i--;) {
                    c.move(node[i].shape, space + object, 0);
                }
                break;
            }

        },

        /**
         * @method createSingleNode
         * @for Untangly
         *
         * @param {integer} x
         * @param {integer} y
         */
        createSingleNode = function (x, y) {

            if (grid[x] === undefined) {
                grid[x] = []; // referencing grid[x][y] throws error if grid[x] is undefined
            }

            if (grid[x][y] === undefined) {
                var pixel = [],
                    newNode = {};

                // If node is beyond current bound, expand bound and resize canvas
                if (y > 0 && y > bound.north) {
                    adjustBound("north", 1);
                } else if (x > 0 && x > bound.east) {
                    adjustBound("east", 1);
                } else if (y < 0 && y < bound.south) {
                    adjustBound("south", 1);
                } else if (x < 0 && x < bound.west) {
                    adjustBound("west", 1);
                }

                pixel = locateNode(x, y); // needs to be done after bounds are adjusted

                newNode = {
                    x: x,
                    y: y,
                    type: "single"
                };

                newNode.shape = c.create("circle", {
                    cx: pixel[0],
                    cy: pixel[1],
                    r: 0,
                    fill: "black",
                    stroke: "none",
                    cursor: "pointer"
                });

                // Make Single node "pop" onto screen
                c.animate(newNode.shape, {r: 10.5}, 110).
                        animate(newNode.shape, {r: 6.5}, 140).animate();

                newNode.shape.click(function () {

                    ui.show("shapes", {
                        node: newNode 
                    });

                    Shapes.eventHandler = function (pathData) {

                        createEngagedNode(x, y, pathData);

                    };

                });

                node.push(newNode);

                newNode.id = (node.length - 1);

                grid[x][y] = newNode;
            }

        },

        /**
         * @method createEngagedNode
         *
         * @param {integer} x
         * @param {integer} y
         * @param {string} pathData
         */
        createEngagedNode = function (x, y, pathData) {

            var selectedNode = grid[x][y],
                pixel = locateNode(x, y);

            pixel[0] -= 44.5; // x
            pixel[1] -= 44.5; // y

            pathData = pathData.split(" ");

            pathData[1] = +pathData[1] + pixel[0];

            pathData[2] = +pathData[2] + pixel[1];

            pathData.join(" ");

            selectedNode.shape.remove();

            selectedNode.shape = c.create("path", {
                d: pathData,
                stroke: "black",
                "stroke-width": 2,
                fill: "white"
            });

            selectedNode.shape.click(function () {

                ui.show("shapes", {
                    node: selectedNode
                });

                Shapes.eventHandler = function (pathData) {

                    createEngagedNode(x, y, pathData);

                };

            });

            selectedNode.type = "engaged";

            createSingleNode(x, (y + 1)); // North
            createSingleNode((x + 1), y); // East
            createSingleNode(x, (y - 1)); // South
            createSingleNode((x - 1), y); // West

        };

    // End var


    // Initialisation procedures
    resizeCanvas();

    setTimeout((function () {
        createSingleNode(0, 0); // start program
    }), 300);

    flowchartShapes.basic = new Shapes("Basic");
    // Generic processing step: rectangle
    flowchartShapes.basic.add(
        "M 0 6.5 h 34 v 21 h -34 Z",
        "M 0 17 h 89 v 55 h -89 Z"
    );
    // Input/Output: parallelogram
    flowchartShapes.basic.add(
        "M 2.5 6.5 h 34 l -5 21 h -34 Z",
        "M 6.5 17 h 89 l -13 55 h -89 Z"
    );
    // Prepare conditional: hexagon
    flowchartShapes.basic.add(
        "M 2.5 6.5 h 29 l 5 10.5 l -5 10.5 h -29 l -5 -10.5 Z",
        "M 6.5 17 h 76 l 13 27.5 l -13 27.5 h -76 l -13 -27.5 Z"
    );
    // Conditional: rhombus
    flowchartShapes.basic.add(
        "M 0 17 l 17 -17 l 17 17 l -17 17 Z",
        "M 0 44.5 l 44.5 -44.5 l 44.5 44.5 l -44.5 44.5 Z"
    );
    // Start/End: circle
    // To find the distance l of the control point from the start/end point:
    //  l = r x 4(root(2) - 1) / 3
    // where r is the radius.
    // When r = 32 / 2 = 17, l = 9.3888 ~= 9.4
    // When r = 89 / 2 = 44.5, l = 24.57667 ~= 24.6
    // Note: One point will be (r / 2) - l to relatively position control points correctly
    flowchartShapes.basic.add(
        "M 0 17 c 0 -9.4 9.6 -17 17 -17 c 9.4 0 17 9.6 17 17 c 0 9.4 -9.6 17 -17 17 c -9.4 0 -17 -9.6 -17 -17",
        "M 0 44.5 c 0 -24.6 19.9 -44.5 44.5 -44.5 c 24.6 0 44.5 19.9 44.5 44.5 c 0 24.6 -19.9 44.5 -44.5 44.5 c -24.6 0 -44.5 -19.9 -44.5 -44.5"
    );
    // Manual input: quadrilateral with top sloping up from left to right
    flowchartShapes.basic.add(
        "M 0 11.5 l 34 -5 v 21 h -34 Z",
        "M 0 30 l 89 -13 v 55 h -89 Z"
    );
    // Manual operation: Trapezoid with longer side top
    flowchartShapes.basic.add(
        "M -2.5 6.5 h 39 l -5 21 h -29 Z",
        "M -6.5 17 h 102 l -13 55 h -76 Z"
    );
    // Data file: cylinder
    flowchartShapes.basic.add(
        "M 6.5 0 v 34 q 10.5 5 21 0 v -34 q -10.5 -5 -21 0 q 10.5 4 21 0",
        "M 17 0 v 89 q 27.5 13 55 0 v -89 q -27.5 -13 -56 1 m 1 -1 q 27.5 13 55 0"
    );
    // Document: rectangle with wavy base
    flowchartShapes.basic.add(
        "M 0 6.5 h 34 v 19 c -17 0 -17 8 -34 2 Z",
        "M 0 17 h 89 v 52 c -44.5 0 -44.5 13 -89 3 Z"
    );
    // TODO WHEN ADDING NEW GROUP TEST FOR BUG IN THE WAY CANVAS IS HANDLEDBY Shapes

}());
