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
 * the next section below) and are the means through which the user builds
 * diagrams.
 *
 * All nodes have one of two states:
 * - Single
 * - Engaged
 * (NB the capitalisation.)
 *
 * Single nodes are the points at which the user can create new diagram objects.
 * Once a node has been converted into a diagram shape it is considered Engaged.
 *
 * Upon clicking on a Single node, a small menu is displayed on top of the nodes
 * location from which the user can select the desired shape. Once selected, the
 * node becomes Engaged and holds the shape selected.
 *
 *
 * GRID
 * ----
 * Internally, the position of nodes is recorded with respect to an imaginary
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
 * surrounding. Each node stores its own x and y coordinates which the software
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
 * The grid starts with the origin ONLY and expands only in response to the
 * creation of new nodes as the user interracts with the software.
 * 
 * The actual distance between nodes on the page is determined separately.
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
 * Each Single node that is created has the possibility of expanding the bounds
 * of the grid. New nodes are only created in response to an existing node being
 * converted from Single to Engaged. From the basic view where the origin is
 * converted into an Engaged node it is simple to see that each new Single node
 * can only expand the bounds of the grid in one direction.
 *
 *                         <-           ->
 *                                          ^
 *                                .         |
 *
 *
 *                          .     O     .
 *
 * 
 *                                .         |
 *                                          v
 *
 * With this knowledge, the most efficient method of testing if the bound of the
 * grid has expanded is to attach a callback to each new Single node testing
 * only the direction in which it could possibly expand the bounds of the grid.
 *
 * The correct callback to attach can easily be deduced through the use of the
 * following template:
 *
 *                              (x,y+1)
 *
 *
 *
 *                  (x-1,y)      (x,y)       (x+1,y)
 *
 *
 *
 *                              (x,y-1)
 *   
 * where (x,y) is the location of the Single node being converted into an
 * Engaged node.
 *
 * To avoid overwriting existing nodes (this only really matters for Engaged
 * nodes) each location around (x,y) needs to be confirmed empty before a
 * Single node is generated.
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
 *             (object)   (space)    (object)
 *               100        100        100
 *            ____^____  ____^____  ____^____
 *           /         \/         \/         \
 *
 *                o                     o
 *
 *     \____ ____/\____ ____/\____ ____/\____ ____/
 *          v          v          v          v
 *         100        100        100        100
 *      (margin)   (margin)   (margin)   (margin)
 *                \_________ __________/
 *                          v
 *                         200
 *                        (gap)
 *      (not to scale)
 *
 * The canvas grows dynamically based on the number of nodes in the diagram. In
 * combination with some CSS this allows the diagram to always stay centered on
 * the page.
 *
 * @module Untangly
 * @static
 */
(function () {
    /**
     * "grid" is a 2 dimensional array used to access nodes through their (x,y)
     * coordinates in the internally used unit grid. Nodes are accessed using
     * "grid[x][y]".
     *
     * Each entry holds the Raphael created object for that node with an added
     * key: value pair called "untangly_node" that holds the integer value of
     * the element that represents the node in the "node" array.
     *
     * @property grid
     * @type array
     *
     * @private
     */
    var grid = [],
    /**
     * "node" is an array that contains an entry for every node. Each entry
     * has a set of (x,y) coordinates referring to a node's (x,y) coordinates in
     * the "grid" array.
     *
     * "node" exists to make it faster to loop through all nodes.
     *
     * @property node
     * @type array
     *
     * @private
     */
        node = [], // stores nodes sequentially (used when repositioning)
        bound = { // records the bounds of the unit grid in terms of units
            north: 0, // always positive integer
            east: 0, // always positive integer
            south: 0, // always negative integer
            west: 0 // always negative integer
        },
        pixel = { // grid-unit to pixel conversions and other pixel values
            gapX: 100, // distance between node points
            gapY: 100, // distance between node points
            paddingX: 100, // left/right padding (x2 for starting width)
            paddingY: 100 // top/bottom padding (x2 for starting height)
        },
        c = Raphael("untangly", pixel.paddingX * 2, pixel.paddingY * 2); // c is for canvas

    /**
     * Callback functions used to expand bounds.
     *
     * If the node position given expands the bound, the bound value is updated
     * and the size of the canvas is expanded. 
     *
     * When expanding North and West the nodes are also repositioned since the
     * canvas can only be expanded in a positive direction.
     *
     * @method expandNorth
     * @method expandEast
     * @method expandSouth
     * @method expandWest
     *
     * @param {integer} x The x coordinate of the node tested
     * @param {integer} y The y coordinate of the node tested
     */
    bound.expandNorth = function expandNorth(x, y) {
        if (y > bound.north) {
            bound.north = y;
            c.setSize(c.width, (c.height + pixel.gapY)); // increase canvas size
            for (var i = node.length; i--;) { // reposition nodes
                grid[node[i].x][node[i].y].translate(0, pixel.gapY);
            }
        }
    };
    bound.expandEast = function expandEast(x, y) {
        if (x > bound.east) {
            bound.east = x;
            c.setSize((c.width + pixel.gapX), c.height); // increase canvas size
        }
    };
    bound.expandSouth = function expandSouth(x, y) {
        if (y < bound.south) {
            bound.south = y;
            c.setSize(c.width, (c.height + pixel.gapY)); // increase canvas size
        }
    };
    bound.expandWest = function expandWest(x, y) {
        if (x < bound.west) {
            bound.west = x;
            c.setSize((c.width + pixel.gapX), c.height); // increase canvas size
            for (var i = node.length; i--;) { // reposition nodes
                grid[node[i].x][node[i].y].translate(pixel.gapX, 0);
            }
        }
    };

    /**
     * Deletes a given node.
     *
     * To maintain the efficiency of traversing through the "node" array, it is
     * updated so that the last entry takes the position of the deleted node,
     * therefore leaving no gaps.
     *
     * @method deleteNode
     *
     * @param {integer} x The x coordinate of the node being deleted
     * @param {integer} y The y coordinate of the node being deleted
     */
    function deleteNode(x, y) {
        var deleteNodeID = grid[x][y].untangly_node, // deleted node's "node" array position
            replaceNodeID = (node.length - 1), // replacement node's "node" array position
            replaceNodeX = node[replaceNodeID].x, // replacement node's grid x value
            replaceNodeY = node[replaceNodeID].y; // replacement node's grid y value

        // Replace the deleted node with the last element in the "node" array
        node[deleteNodeID] = node[replaceNodeID];

        // Update the moved node's "untangly_node" to reflect it's new position in the "node" array
        grid[replaceNodeX][replaceNodeY].untangly_node = deleteNodeID;

        // Remove the last node in the array
        node[replaceNodeID] = undefined;

        // Remove the node from the canvas
        grid[x][y].remove();

        // Remove the node from the grid array
        grid[x][y] = undefined;

        // TODO Remove superflous Single nodes left behind
    }

    /**
     * Creates a single node.
     *
     * @method createSingleNode
     *
     * @param {integer} x The x coordinate for the node to be created
     * @param {integer} y The y coordinate for the node to be created
     * @param {function} expandBoundCallback The callback to be used to test if
     *      the bound has expanded
     */
    function createSingleNode(x, y, expandBoundCallback) {
        var canvas = { // holds values for local conversion calculations
            x: 0,
            y: 0
        };

        // Create grid[x] if it doesn't exist to prevent errors
        if (grid[x] === undefined) {
            grid[x] = [];
        }

        // Ensure (x,y) doesn't hold a node already
        if (grid[x][y] === undefined) {

            // Expand bounds and resize canvas through the appropriate callback
            expandBoundCallback(x, y);

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

            // Attach the event that calls createEngagedNode() when clicked
            grid[x][y].click(function () {
                createEngagedNode(x, y);
            });
        }
    }

    /**
     *
     * @param {integer} x The x coordinate of the node being converted
     * @param {integer} y The y coordinate of the node being converted
     */
    function createEngagedNode(x, y) {
        // Convert node into object...
        // grid[x][y].attrs.cx
        // grid[x][y].attrs.cy

        // Create Single nodes North, East, South and West of Engaged node
        createSingleNode(x, (y + 1), bound.expandNorth); // North
        createSingleNode((x + 1), y, bound.expandEast); // East
        createSingleNode(x, (y - 1), bound.expandSouth); // South
        createSingleNode((x - 1), y, bound.expandWest); // West
    }

    // Initialise the origin node
    setTimeout((function () {
        createSingleNode(0, 0, bound.expandNorth); // superflous callback to avoid error
    }), 300);
}());
