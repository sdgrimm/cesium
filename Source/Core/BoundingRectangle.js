/*global define*/
define([
        './defaultValue',
        './Cartesian2',
        './Cartographic',
        './DeveloperError',
        './EquidistantCylindricalProjection',
        './Extent',
        './Math'
    ], function(
        defaultValue,
        Cartesian2,
        Cartographic,
        DeveloperError,
        EquidistantCylindricalProjection,
        Extent,
        CesiumMath) {
    "use strict";

    /**
     * A bounding rectangle given by a corner, width and height.
     *
     * @alias BoundingRectangle
     * @constructor
     *
     * @param {Number} [x=0.0] The x coordinate of the rectangle.
     * @param {Number} [y=0.0] The y coordinate of the rectangle.
     * @param {Number} [width=0.0] The width of the rectangle.
     * @param {Number} [height=0.0] The height of the rectangle.
     */
    var BoundingRectangle = function(x, y, width, height) {
        /**
         * The x coordinate of the rectangle.
         *
         * @type Number
         */
        this.x = defaultValue(x, 0.0);

        /**
         * The y coordinate of the rectangle.
         *
         * @type Number
         */
        this.y = defaultValue(y, 0.0);

        /**
         * The width of the rectangle.
         *
         * @type Number
         */
        this.width = defaultValue(width, 0.0);

        /**
         * The height of the rectangle.
         *
         * @type Number
         */
        this.height = defaultValue(height, 0.0);
    };

    /**
     * Creates a bounding rectangle that is the union of the left and right bounding rectangles.
     * @memberof BoundingRectangle
     *
     * @param {BoundingRectangle} left A rectangle to enclose in bounding rectangle.
     * @param {BoundingRectangle} right A rectangle to enclose in a bounding rectangle.
     * @param {BoundingRectangle} [result] The object onto which to store the result.
     *
     * @exception {DeveloperError} left is required.
     * @exception {DeveloperError} right is required.
     *
     * @return {BoundingRectangle} A rectangle that encloses both left and right bounding rectangles.
     */
    BoundingRectangle.union = function(left, right, result) {
        if (typeof left === 'undefined') {
            throw new DeveloperError('left is required.');
        }

        if (typeof right === 'undefined') {
            throw new DeveloperError('right is required.');
        }

        if (typeof result === 'undefined') {
            result = new BoundingRectangle();
        }

        var lowerLeft = new Cartesian2(Math.min(left.x, right.x), Math.min(left.y, right.y));
        var upperRight = new Cartesian2(Math.max(left.x + left.width, right.x + right.width), Math.max(left.y + left.height, right.y + right.height));

        result.x = lowerLeft.x;
        result.y = lowerLeft.y;
        result.width = upperRight.x - lowerLeft.x;
        result.height = upperRight.y - lowerLeft.y;
        return result;
    };

    /**
     * Duplicates a BoundingRectangle instance.
     * @memberof BoundingRectangle
     *
     * @param {BoundingRectangle} rect The bounding rectangle to duplicate.
     * @param {BoundingRectangle} [result] The object onto which to store the result.
     * @return {BoundingRectangle} The modified result parameter or a new BoundingRectangle instance if none was provided.
     *
     * @exception {DeveloperError} rect is required.
     */
    BoundingRectangle.clone = function(rect, result) {
        if (typeof rect === 'undefined') {
            throw new DeveloperError('rect is required');
        }

        if (typeof result === 'undefined') {
            return new BoundingRectangle(rect.x, rect.y, rect.width, rect.height);
        }

        result.x = rect.x;
        result.y = rect.y;
        result.width = rect.width;
        result.height = rect.height;
        return result;
    };

    /**
     * Compares the provided BoundingRectangles componentwise and returns
     * <code>true</code> if they are equal, <code>false</code> otherwise.
     * @memberof BoundingRectangle
     *
     * @param {BoundingRectangle} [left] The first BoundingRectangle.
     * @param {BoundingRectangle} [right] The second BoundingRectangle.
     * @return {Boolean} <code>true</code> if left and right are equal, <code>false</code> otherwise.
     */
    BoundingRectangle.equals = function(left, right) {
        return (left === right) ||
               ((typeof left !== 'undefined') &&
                (typeof right !== 'undefined') &&
                (left.x === right.x) &&
                (left.y === right.y) &&
                (left.width === right.width) &&
                (left.height === right.height));
    };

    /**
     * Computes a bounding rectangle enclosing the list of 2D points.
     *
     * @memberof BoundingRectangle
     *
     * @param {Array} positions List of points that the bounding rectangle will enclose.  Each point must have <code>x</code> and <code>y</code> properties.
     *
     * @exception {DeveloperError} positions is required.
     * @exception {DeveloperError} positions must have a length greater than one.
     *
     * @return {BoundingRectangle} A bounding rectangle computed from the positions. The rectangle is oriented with the corner at the bottom left.
     */
    BoundingRectangle.fromPoints = function(positions) {
        if (typeof positions === 'undefined') {
            throw new DeveloperError('positions is required.');
        }

        if (typeof positions.length === 'undefined' || positions.length <= 1) {
            throw new DeveloperError('positions must have a length greater than one.');
        }

        var length = positions.length;

        var minimumX = positions[0].x;
        var minimumY = positions[0].y;

        var maximumX = positions[0].x;
        var maximumY = positions[0].y;

        for ( var i = 1; i < length; i++) {
            var p = positions[i];
            var x = p.x;
            var y = p.y;

            if (x < minimumX) {
                minimumX = x;
            }

            if (x > maximumX) {
                maximumX = x;
            }

            if (y < minimumY) {
                minimumY = y;
            }

            if (y > maximumY) {
                maximumY = y;
            }
        }

        var width = maximumX - minimumX;
        var height = maximumY - minimumY;
        return new BoundingRectangle(minimumX, minimumY, width, height);
    };

    /**
     * Creates a bounding rectangle from an extent.
     *
     * @memberof BoundingRectangle
     *
     * @param {Extent} extent The extent used to create a bounding rectangle.
     * @param {Object} [projection=EquidistantCylindricalProjection] The projection used to project the extent into 2D.
     *
     * @exception {DeveloperError} extent is required.
     *
     * @returns {BoundingRectangle} The bounding rectangle containing the extent.
     */
    BoundingRectangle.fromExtent = function(extent, projection) {
        if (typeof extent === 'undefined') {
            throw new DeveloperError('extent is required.');
        }

        Extent.validate(extent);

        projection = projection || new EquidistantCylindricalProjection();

        var lowerLeft = projection.project(extent.getSouthwest());
        var upperRight = projection.project(extent.getNortheast());

        var diagonal = upperRight.subtract(lowerLeft);
        return new BoundingRectangle(lowerLeft.x, lowerLeft.y, diagonal.x, diagonal.y);
    };

    /**
     * Determines if two rectangles intersect.
     *
     * @memberof BoundingRectangle
     *
     * @param {BoundingRectangle} rect1 A rectangle to check for intersection.
     * @param {BoundingRectangle} rect2 The other rectangle to check for intersection.
     *
     * @return {Boolean} <code>true</code> if the rectangles intersect, <code>false</code> otherwise.
     *
     * @exception {DeveloperError} rect1 is required.
     * @exception {DeveloperError} rect2 is required.
     */
    BoundingRectangle.intersect = function(rect1, rect2) {
        if (typeof rect1 === 'undefined') {
            throw new DeveloperError('rect1 is required.');
        }

        if (typeof rect2 === 'undefined') {
            throw new DeveloperError('rect2 is required.');
        }

        return !(rect1.x > rect2.x + rect2.width ||
                 rect1.x + rect1.width < rect2.x ||
                 rect1.y + rect1.height < rect2.y ||
                 rect1.y > rect2.y + rect2.height);
    };

    /**
     * Creates a bounding rectangle that contains both this bounding rectangle and the argument rectangle.
     * @memberof BoundingRectangle
     *
     * @param {BoundingRectangle} rectangle The rectangle to enclose in this bounding rectangle.
     * @param {BoundingRectangle} [result] The object onto which to store the result.
     *
     * @exception {DeveloperError} rectangle is required.
     *
     * @return {BoundingRectangle} A rectangle that encloses both this rectangle and the argument rectangle.
     */
    BoundingRectangle.prototype.union = function(rectangle, result) {
        if (typeof rectangle === 'undefined') {
            throw new DeveloperError('rectangle is required.');
        }

        return BoundingRectangle.union(this, rectangle, result);
    };

    /**
     * Determines if this rectangle intersects with another.
     *
     * @memberof BoundingRectangle
     *
     * @param {BoundingRectangle} rect A rectangle to check for intersection.
     *
     * @return {Boolean} <code>true</code> if the rectangles intersect, <code>false</code> otherwise.
     *
     * @exception {DeveloperError} rect is required.
     */
    BoundingRectangle.prototype.intersect = function(rect) {
        if (typeof rect === 'undefined') {
            throw new DeveloperError('rect is required.');
        }

        return BoundingRectangle.intersect(this, rect);
    };

    /**
     * Duplicates this BoundingRectangle instance.
     * @memberof BoundingRectangle
     *
     * @param {BoundingRectangle} [result] The object onto which to store the result.
     * @return {BoundingRectangle} The modified result parameter or a new BoundingRectangle instance if none was provided.
     */
    BoundingRectangle.prototype.clone = function(result) {
        return BoundingRectangle.clone(this, result);
    };

    /**
     * Compares this BoundingRectangle against the provided BoundingRectangle componentwise and returns
     * <code>true</code> if they are equal, <code>false</code> otherwise.
     * @memberof BoundingRectangle
     *
     * @param {BoundingRectangle} [right] The right hand side BoundingRectangle.
     * @return {Boolean} <code>true</code> if they are equal, <code>false</code> otherwise.
     */
    BoundingRectangle.prototype.equals = function(right) {
        return BoundingRectangle.equals(this, right);
    };

    return BoundingRectangle;
});
