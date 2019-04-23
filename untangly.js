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
 */
(function () {
    /**
     * A 2 dimensional array used to store nodes in terms of their internal grid
     * (x,y) coordinates. Nodes can be accessed using "grid[x][y]".
     *
     * In addition to the Raphael generated object, a key:value pair
     * "untangly_node" is added that records this node's node array entry
     * number.
     *
     * @property grid
     * @type array
     *
     * @private
     */
    var grid = [],
    /**
     * Contains an entry for every node with the node's grid (x,y) coordinates.
     *
     * This property is used to increase efficiency of looping through all the
     * existing nodes.
     *
     * @property node
     * @type array
     *
     * @private
     */
        node = [],
        shapes = {}, // holds the different shape sets from which the user can select
        bound = { // records the bounds of the unit grid in terms of units
            north: 0, // always positive integer
            east: 0, // always positive integer
            south: 0, // always negative integer
            west: 0 // always negative integer
        },
        pixel = { // grid-unit to pixel conversions and other pixel values
            gapX: 144, // distance between node points
            gapY: 144, // distance between node points
            paddingX: 99.5, // left/right padding (x2 for starting width)
            paddingY: 99.5 // top/bottom padding (x2 for starting height)
            // The "shapes" box is fully defined within the "shape" class definition
        },
        c = Raphael("untangly", pixel.paddingX * 2, pixel.paddingY * 2 + 89), // c is for canvas (89 added to Y axis to account for space occupied by admin panel)
        U = {}; // namespace, U is for Untangly

    /**
     * Manages flowcharting shapes available to user.
     *
     * Each instance of the class creates a separate set in which shapes can be
     * added. Each set appears as a separate group to the user with "setName" as
     * its title.
     *
     * Each preview shape fires ShapeSet.callback (defined below) when clicked,
     * passing that shape's path data for the large size shape as a parameter.
     * ShapeSet.callback is intended to be redefined as needed to intercept and
     * handle the preview shape's large shape path data when they are selected
     * by the user.
     * 
     * @class ShapeSet
     *
     * @param {string} setName The name of the set of shapes represented by the
     *      instance of the class.
     *
     * @constructor
     */
    U.ShapeSet = function (setName) {
        // Enforce instantiation
        if (!(this instanceof U.ShapeSet)) {
            return new U.ShapeSet(setName);
        }

        // Increment set ID to keep value unique
        U.ShapeSet.setID += 1;

        // Create a new div element to hold shape set's canvas (JQuery)
        $("<div/>", {
            id: "shapeset_" + U.ShapeSet.setID
        }).appendTo("#shape_previews");

        // TODO Add setName to div and make it so you can fold the divs.

        // Create canvas for this shape set
        this.c = Raphael("shapeset_" + U.ShapeSet.setID, 165, 1);

        // Add counter for set to keep track of number of shapes created
        this.shapeNumber = 0;

        /**
         * Adds flowcharting shape to the shape set.
         *
         * @method add
         *
         * @param {string} preview The path data for the small shape relative
         *      to the top left corner of its 34 pixel allocated space. The
         *      path data must start with a capital M indicating that the
         *      following coordinates are positioned absolutely. This
         *      position will automatically be amended to place the shape in
         *      the correct position. All values and commands must be
         *      separated with a space.
         * @param {string} shape The path data for the big shape relative to
         *      the top left corner of its 89 pixel allocated space. The
         *      path data must start with a capital M indicating that the
         *      following coordinates are positioned absolutely. This
         *      position will automatically be amended to place the shape in
         *      the correct position. All values and commands must be
         *      separated with a space.
         */
        this.add = function (preview, shape) {
            // Increment shape counter
            this.shapeNumber += 1;

            // Split the values and commands of the preview shape's path data so the starting position can be manipulated
            preview = preview.split(" ");

            // Add 11 pixel left margin plus 55 pixels for each column to the left
            preview[1] = parseInt(preview[1], 10) + (this.shapeNumber + 2) % 3 *
                    55 + 11;

            // Add 11 pixel top margin plus 55 pixels for each row above the current
            // (x + 2) - (x + 2) % 3
            // --------------------- = rowNumber; rowNumber - 1 = multipler
            //           3   where x is shapeNumber
            preview[2] = parseInt(preview[2], 10) + ((this.shapeNumber + 2 -
                    (this.shapeNumber + 2) % 3) / 3 - 1) * 55 + 11;

            // Join the path data back up
            preview.join(" ");

            // Add the shape preview to the selection grid and style it
            preview = this.c.path(preview);
            preview.attr("stroke", "black");
            preview.attr("stroke-width", "1px");
            preview.attr("fill", "white");

            // Add event to pass shape path data to the callback function when the preview is selected
            preview.click(function () {
                U.ShapeSet.callback(shape);
            });

            // Resize the canvas to fit all the nodes
            this.c.setSize(this.c.width, ((this.shapeNumber + 2 -
                    (this.shapeNumber + 2) % 3) / 3) * 55);
        };
    };
    U.ShapeSet.container = document.getElementById("shape_previews"); // element holding all the previews
    U.ShapeSet.setID = 0; // used to give each set a unique id by incrementing for each instance
    U.ShapeSet.callback = function () {}; // intercepts shape path data when previews are selected

    /**
     * @class singleNode
     *
     * @static
     */
    U.singleNode = {
        /**
         * Creates a new Single node.
         *
         * @method create
         *
         * @param {integer} x Grid x coordinate of the position in which to
         *      create the Single node.
         * @param {integer} y Grid y coordinate of the position in which to
         *      create the single node.
         */
        create: function (x, y) {
            var canvas = { // holds values of positioning calculations
                    x: 0,
                    y: 0
                };

            // Create grid[x] if it doesn't exist to prevent errors
            if (grid[x] === undefined) {
                grid[x] = [];
            }

            // Ensure (x,y) doesn't hold a node already
            if (grid[x][y] === undefined) {

                // Resize canvas and update bound value if this node expands a bound
                if (y > 0 && y > bound.north) { // test North
                    // Update bound
                    bound.north = y;

                    // Resize canvas
                    c.setSize(c.width, (c.height + pixel.gapY));

                    // Shift existing nodes down
                    for (var i = node.length; i--;) {
                        grid[node[i].x][node[i].y].translate(0, pixel.gapY);
                    }
                } else if (x > 0 && x > bound.east) { // test East
                    // Update bound
                    bound.east = x;

                    // Resize canvas
                    c.setSize((c.width + pixel.gapX), c.height);
                } else if (y < 0 && y < bound.south) { // test South
                    // Update bound
                    bound.south = y;

                    // Resize canvas
                    c.setSize(c.width, (c.height + pixel.gapY));
                } else if (x < 0 && x < bound.west) { // test West
                    // Update bound
                    bound.west = x;

                    // Resize canvas
                    c.setSize((c.width + pixel.gapX), c.height);

                    // Shift existing nodes right
                    for (var i = node.length; i--;) {
                        grid[node[i].x][node[i].y].translate(pixel.gapX, 0);
                    }
                }

                // Convert grid x and y locations to pixel locations
                canvas.x = pixel.paddingX + ((Math.abs(bound.west) + x) *
                        pixel.gapX);
                canvas.y = pixel.paddingY + ((bound.north - y) * pixel.gapY);

                // Initialise the Single node
                grid[x][y] = c.circle(canvas.x, canvas.y, 0);

                // Add a references to this node in the node array
                node.push({
                    x: x,
                    y: y
                });

                // Save the "node" array value for the element that represents this node
                grid[x][y].untangly_node = (node.length - 1);

                // Style the Single node as a black circle & undo Raphael defaults
                grid[x][y].attr("fill", "black");
                grid[x][y].attr("stroke", "none");

                // Animate Single node to make it "pop" onto canvas (this awekward solution was necessary beecause Raphael is buggy)
                grid[x][y].animate(
                    {r: 8}, 90, // first part of animation
                    function () { // use callback to create second part of animation
                        grid[x][y].animate(
                            {r: 5}, 110 // second part of animation
                        );
                    }
                );

                // Attach the event that converts it to an Engaged node when clicked
                grid[x][y].click(function () {
                    U.singleNode.convert(x, y);
                });
            }
        },
        /**
         * Starts the process of converting a Single node into an Engaged node.
         *
         * @method convert
         */
        convert: function (x, y) {
            var mouse = { // location of mouse when the Single node is clicked
                    e: window.event, // captures event
                    x: 0,
                    y: 0
                };

            // Set up the shape class to pass on control to the engagedNode class
            U.ShapeSet.callback = function (shapePathData) {
                U.engagedNode.create(x, y, shapePathData);
            };


            // Detect mouse location (cross browser)
            if (mouse.e.pageX || mouse.e.pageY) {
                mouse.x = mouse.e.pageX;
                mouse.y = mouse.e.pageY;
            } else if (mouse.e.clientX || mouse.e.clientY) {
                mouse.x = mouse.e.clientX + document.body.scrollLeft +
                        document.documentElement.scrollLeft;
                mouse.y = mouse.e.clientY + document.body.scrollTop +
                        document.documentElement.scrollTop;
            }

            // Position shape HTML container above mouse location
            U.ShapeSet.container.style.top = (mouse.y - 90) + "px"; // half of the height of the container element is 90 pixels
            U.ShapeSet.container.style.left = (mouse.x - 90) + "px"; // half of the width of the container element is 90 pixels

            // Display the shape HTML container
            U.ShapeSet.container.style.display = "block";

            // The rest is handled by the events attached to the small shapes...
        }
    };

    /**
     * @class engagedNode
     *
     * @static
     */
    U.engagedNode = {
        /**
         * Creates a new Engaged node.
         *
         * Called in response to event attached to Single nodes.
         *
         * @method create
         *
         * @param {integer} x The x coordinate of grid position where Engaged
         *      node is to be created.
         * @param {integer} y The y coordinate of grid position where Engaged
         *      node is to be created.
         * @param {string} pathData The SVG path data that defines the shape of
         *      the Engaged node.
         */
        create: function (x, y, pathData) {
            var canvas = { // holds values of positioning calculations
                    x: pixel.paddingX +
                            ((Math.abs(bound.west) + x) * pixel.gapX) - 44.5,
                    y: pixel.paddingY + ((bound.north - y) * pixel.gapY) - 44.5
                },
                untangly_node = grid[x][y].untangly_node; // save node's untangly_node value

            // Remove existing node
            grid[x][y].remove();

            // Split the values and commands of the big shape's path data so the starting position can be manipulated
            pathData = pathData.split(" ");

            // Add the x value of the canvas location to starting position of shape
            pathData[1] = parseInt(pathData[1], 10) + canvas.x;

            // Add the y value of the canvas location to starting position of shape
            pathData[2] = parseInt(pathData[2], 10) + canvas.y;

            // Join the path data back up
            pathData.join(" ");

            // Add the shape to the canvas and style it
            grid[x][y] = c.path(pathData);
            grid[x][y].attr("stroke", "black");
            grid[x][y].attr("stroke-width", "2px");
            grid[x][y].attr("fill", "white");

            // Reattach the node's "untangly_node" value
            grid[x][y].untangly_node = untangly_node;

            // TODO Add events

            // Hide the shape selection box
            U.ShapeSet.container.style.display = "none";

            // Create Single nodes North, East, South and West of Engaged node
            U.singleNode.create(x, (y + 1)); // North
            U.singleNode.create((x + 1), y); // East
            U.singleNode.create(x, (y - 1)); // South
            U.singleNode.create((x - 1), y); // West
        },
        /**
         * Updates UI so the user can modify the selected Engaged node.
         *
         * @method select
         *
         * @param {integer} x Grid x coordinate of the selected Engaged node.
         * @param {integer} y Grid y coordinate of the selected Engaged node.
         */
        select: function (x, y) {
        },
        /**
         * Starts the process of converting the shape of the Engaged node.
         *
         * @method reshape 
         *
         * @param {integer} x Grid x coordinate of the Engaged node to be
         *      reshaped.
         * @param {integer} y Grid y coordinate of the Engaged node to be
         *      reshaped.
         */
        reshape: function (x, y) {
        },
        remove: function (x, y) {
        }
    };

    // Initialise the origin node - starts programme
    setTimeout((function () {
        U.singleNode.create(0, 0);
    }), 300);


    /**
     * Add flowcharting shapes.
     * This task is performed at the end to avoid cluttering code above.
     */

    // Create new shape set: Basic
    shapes.basic = new U.ShapeSet("Basic");

    // Generic processing step: rectangle
    shapes.basic.add(
        "M 0 6.5 h 34 v 21 h -34 Z",
        "M 0 17 h 89 v 55 h -89 Z"
    );

    // Input/Output: parallelogram
    shapes.basic.add(
        "M 2.5 6.5 h 34 l -5 21 h -34 Z",
        "M 6.5 17 h 89 l -13 55 h -89 Z"
    );

    // Prepare conditional: hexagon
    shapes.basic.add(
        "M 2.5 6.5 h 29 l 5 10.5 l -5 10.5 h -29 l -5 -10.5 Z",
        "M 6.5 17 h 76 l 13 27.5 l -13 27.5 h -76 l -13 -27.5 Z"
    );

    // Conditional: rhombus
    shapes.basic.add(
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
    shapes.basic.add(
        "M 0 17 c 0 -9.4 9.6 -17 17 -17 c 9.4 0 17 9.6 17 17 c 0 9.4 -9.6 17 -17 17 c -9.4 0 -17 -9.6 -17 -17",
        "M 0 44.5 c 0 -24.6 19.9 -44.5 44.5 -44.5 c 24.6 0 44.5 19.9 44.5 44.5 c 0 24.6 -19.9 44.5 -44.5 44.5 c -24.6 0 -44.5 -19.9 -44.5 -44.5"
    );

    // Manual input: quadrilateral with top sloping up from left to right
    shapes.basic.add(
        "M 0 11.5 l 34 -5 v 21 h -34 Z",
        "M 0 30 l 89 -13 v 55 h -89 Z"
    );

    // Manual operation: Trapezoid with longer side top
    shapes.basic.add(
        "M -2.5 6.5 h 39 l -5 21 h -29 Z",
        "M -6.5 17 h 102 l -13 55 h -76 Z"
    );

    // Data file: cylinder
    shapes.basic.add(
        "M 6.5 2 v 30 q 10.5 4 21 0 v -30 q -10.5 -4 -21 0 q 10.5 4 21 0",
        "M 17 6.5 v 76 q 27.5 13 55 0 v -76 q -27.5 -13 -56 1 m 1 -1 q 27.5 13 55 0"
    );

    // Document: rectangle with wavy base
    shapes.basic.add(
        "M 0 6.5 h 34 v 19 c -17 0 -17 8 -34 2 Z",
        "M 0 17 h 89 v 52 c -44.5 0 -44.5 13 -89 3 Z"
    );
}());
