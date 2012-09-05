/*global define*/
define([
        '../Core/defaultValue',
        '../Core/TimeInterval',
        './CzmlNumber',
        './CzmlString',
        './DynamicProperty'
    ], function(
        defaultValue,
        TimeInterval,
        CzmlNumber,
        CzmlString,
        DynamicProperty
        ) {
    "use strict";


    var DynamicExternalDocument = function() {
        this.polling = undefined;
        this.show = undefined;
    };


    DynamicExternalDocument.processCzmlPacket = function(dynamicObject, packet) {
        var externalData = packet.external;
        if (typeof externalData === 'undefined') {
            return false;
        }

        var externalUpdated = false;
        var external = dynamicObject.external;
        externalUpdated = typeof external === 'undefined';
        if (externalUpdated) {
            dynamicObject.external = external = new DynamicExternalDocument();
        }

        var interval = externalData.interval;
        if (typeof interval !== 'undefined') {
            interval = TimeInterval.fromIso8601(interval);
        }

        if(typeof externalData.scope !== 'undefined'){
            if(typeof external.scope === 'undefined'){
                external.scope = externalData.scope;
                externalUpdated = true;
            }
        }

        if (typeof externalData.polling !== 'undefined') {
            var polling = external.polling;
            if (typeof polling === 'undefined') {
                external.polling = polling = new DynamicProperty(CzmlString);
                externalUpdated = true;
            }
            polling.processCzmlIntervals(externalData.polling, interval);

            if(typeof externalData.refreshInterval !== 'undefined'){
                var refreshInterval = external.refreshInterval;
                if(typeof refreshInterval === 'undefined'){
                    external.refreshInterval = refreshInterval = new DynamicProperty(CzmlNumber);
                    refreshInterval.processCzmlIntervals(externalData.refreshInterval, interval);
                    externalUpdated = true;
                }
            }
        }
        else if(typeof externalData.eventsource !== 'undefined'){
            var eventsource = external.eventsource;
            if(typeof eventsource === 'undefined'){
                external.eventsource = eventsource = new DynamicProperty(CzmlString);
                externalUpdated = true;
            }
            eventsource.processCzmlIntervals(externalData.eventsource, interval);
            if(typeof externalData.eventname !== 'undefined'){
                var eventname = external.eventname;
                if(typeof eventname === 'undefined'){
                    external.eventname = eventname = new DynamicProperty(CzmlString);
                    eventname.processCzmlIntervals(externalData.eventname, interval);
                    externalUpdated = true;
                }
            }
        }

        return externalUpdated;
    };

    /**
     * Given two DynamicObjects, takes the external properties from the second
     * and assigns them to the first, assuming such a property did not already exist.
     * This method is not normally called directly, but is part of the array of CZML processing
     * functions that is passed into the CompositeDynamicObjectCollection constructor.
     *
     * @param {DynamicObject} targetObject The DynamicObject which will have properties merged onto it.
     * @param {DynamicObject} objectToMerge The DynamicObject containing properties to be merged.
     *
     * @see CzmlDefaults
     */
    DynamicExternalDocument.mergeProperties = function(targetObject, objectToMerge) {
        var externalToMerge = objectToMerge.external;
        if (typeof externalToMerge !== 'undefined') {

            var targetExternal = targetObject.external;
            if (typeof targetExternal === 'undefined') {
                targetObject.external = targetExternal = new DynamicExternalDocument();
            }

            targetExternal.polling = defaultValue(targetExternal.polling, externalToMerge.polling);
        }
    };

    /**
     * Given a DynamicObject, undefines the external associated with it.
     * This method is not normally called directly, but is part of the array of CZML processing
     * functions that is passed into the CompositeDynamicObjectCollection constructor.
     *
     * @param {DynamicObject} dynamicObject The DynamicObject to remove the external property from.
     *
     * @see CzmlDefaults
     */
    DynamicExternalDocument.undefineProperties = function(dynamicObject) {
        dynamicObject.external = undefined;
    };

    return DynamicExternalDocument;
});