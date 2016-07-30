
/**
 * Created by PhucTran on 12/19/2015.
 */

"use strict";

var objectCollection = null;
var index = -1;
var validField = {
    accessModifier : "accessModifier",
    name: "name",
    dataType: "dataType",
    propertyNames: "propertyNames"
};
var pLanguageSetting = null;

function createObject(jsonSting,language,setting) {
    var jsonString1 = '{"glossary":{"title":"example glossary","GlossDiv":{"title":false,"GlossList":{"GlossEntry":{"ID":"SGML","SortAs":"SGML","GlossTerm":"Standard Generalized Markup Language","Acronym":"SGML","Abbrev":"ISO 8879:1986","GlossDef":{"para":"A meta-markup language, used to create markup languages such as DocBook.","GlossSeeAlso":["GML","XML"]},"GlossSee":"markup"}}}},"test":"funny"}';
    var jsonString2 = '[{"title":"title 1"}, {"title":"title 2"}]';
    var jsonString3 = '{"myarray":[{"value":0,"label":0},{"value":1,"label":1},{"value":2,"label":2},{"value":3,"label":3},{"value":4,"label":4},{"value":5,"label":5},{"value":6,"label":6},{"value":7,"label":7},{"value":8,"label":8},{"value":9,"label":9}]}';
    var jsonString4 = '{"myarray":[{"value":0,"label":0},{"value":1,"label":1},{"value":2,"label":2},{"value":3,"label":3},{"value":4,"label":4},{"value":5,"label":5},{"value":6,"label":6},{"value":7,"label":7},{"value":8,"label":8},{"value":9,"label":9}],"myarray1":[{"value":0,"label":0},{"value":1,"label":1},{"value":2,"label":2},{"value":3,"label":3},{"value":4,"label":4},{"value":5,"label":5},{"value":6,"label":6},{"value":7,"label":7},{"value":8,"label":8},{"value":9,"label":9}]}';
    var jsonString5 = '{"myarray":[{"value":0,"label":0},{"value":1,"label":1},{"value":2,"label":2,"myarray":{"value":2,"label":2}},{"value":3,"label":3},{"value":4,"label":4},{"value":5,"label":5},{"value":6,"label":6},{"value":7,"label":7},{"value":8,"label":8},{"value":9,"label":9}],"myarray1":[{"value":0,"label":0},{"value":1,"label":1},{"value":2,"label":2},{"value":3,"label":3},{"value":4,"label":4},{"value":5,"label":5},{"value":6,"label":6},{"value":7,"label":7},{"value":8,"label":8},{"value":9,"label":9}]}';
    var jsonString6 = '{"myarray":[{"value":0,"label":0},{"value":1,"label":1},{"value":2,"label":2},{"value":3,"label":3},{"value":4,"label":4},{"value":5,"label":5},{"value":6,"label":6},{"value":7,"label":7},{"value":8,"label":8},{"value":9,"label":9}],"myarray1":[{"value":0,"label":0},{"value":1,"label":1},{"value":2,"label":2},{"value":3,"label":3},{"value":4,"label":4},{"value":5,"label":5},{"value":6,"label":6},{"value1":7,"label":7},{"value":8,"label":8},{"value":9,"label":9}]}';
    var jsonString7 = '[{"a":"B","c":"D"},{"B":"D"}]';
    var jsonString8 = '[{"a":"B","c":"D"},{"a":"B","c":"D"}]';
    var jsonString9 = '{"accounting":[{"firstName":"John","lastName":"Doe","age":23},{"firstName":"Mary","lastName":"Smith","age":32}],"sales":[{"firstName":"Sally","lastName":"Green","age":27},{"firstName":"Jim","lastName":"Galley","age":41}]}';
    var jsonString10 = '{"myarray":[{"value":0,"label":0},{"value":2,"label":2,"myarray":{"value":2,"label":2}}]}';
    var jsonString11 = '{"problems":[{"Diabetes":[{"medications":[{"medicationsClasses":[{"className":[{"associatedDrug":[{"name":"asprin","dose":"","strength":"500 mg"}],"associatedDrug#2":[{"name":"somethingElse","dose":"","strength":"500 mg"}]}],"className2":[{"associatedDrug":[{"name":"asprin","dose":"","strength":"500 mg"}],"associatedDrug#2":[{"name":"somethingElse","dose":"","strength":"500 mg"}]}]}]}],"labs":[{"missing_field":"missing_value"}]}],"Asthma":[{}]}]}';
    var jsonString12 = '{"problems":[{"Diabetes":[{"medications":[{"medicationsClasses":[{"className":[{"associatedDrug":[{"name":"asprin","dose":"","strength":"500 mg"}],"associatedDrug#2":[{"name":"somethingElse","dose":"","strength":"500 mg"}]}],"className2":[{"associatedDrug":[{"name":"asprin","dose":"","strength":"500 mg"}],"associatedDrug#3":[{"name":"somethingElse","dose":"","strength":"500 mg"}]}]}]}],"labs":[{"missing_field":"missing_value"}]}],"Asthma":[{}]}]}';
    var jsonString13 = '{"problems":[{"Diabetes":[{"medications":[{"medicationsClasses":[{"className":[{"associatedDrug":[{"name":"asprin","dose":"","strength":"500 mg"}],"associatedDrug#2":[{"name":"somethingElse","dose":"","strength":"500 mg"}]}],"className2":[{"associatedDrug4":[{"name":"asprin","dose":"","strength":"500 mg"}],"associatedDrug#3":[{"name":"somethingElse","dose":"","strength":"500 mg"}]}]}]}],"labs":[{"missing_field":"missing_value"}]}],"Asthma":[{}]}]}';
    var jsonString14 = '{"problems": {"a" : "abc","problems" : {"d" : "e"}}}';
    objectCollection = [];
    index = -1;
    if(!setting)
    {
        pLanguageSetting = outputLanguageSetting[language];
    }
    else{
        pLanguageSetting = setting;
    }
    var status = true;
    var message = "";
    if(!dataStructure.json.isValid(jsonSting)) {
        status = false;
        message = "Invalid json string";
    }
    if(!pLanguageSetting) {
        status = false;
        message = "Invalid programming language";
    }
    if(status){
        parse({rootObject: dataStructure.json.toObject(jsonSting)});
        message = pattern.execute();
    }
    return {
        status : status,
        message : message
    }
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var pattern = {
    "execute": function () {
        var objects = objectCollectionHelper.getObjectCollection();
        var outputs = "";
        for (var j = 0; j < objects.length; j++) {
            var object = objects[j];
            if (object.isHide)continue;
            var output = pLanguageSetting.structure.body;

            var properties = object.properties;
            var stringPropertyName = "";
            for (var z = 0; z < properties.length; z++) {
                var nextPropertySign = "";
                if (z < (properties.length - 1)) {
                    nextPropertySign = pLanguageSetting.structure.propertySign;
                }
                output = output.replace("@property", pLanguageSetting.structure.property + nextPropertySign);
                var property = properties[z];

                for (var propKey in property) {
                    if (property.hasOwnProperty(propKey)) {
                        if (validField[propKey]) {
                            var validPropKey = "p" + capitalizeFirstLetter(propKey);
                            var value = property[propKey];
                            switch (propKey){
                                case validField.name:
                                    value = getValidName("property",value);
                                    stringPropertyName += value + ",";
                                    break;
                                case validField.dataType:
                                    value = getValidName("object",value);
                                    if (property.isArray) {
                                        value = new Function('property', pLanguageSetting.dataType["array"])(cloneObject(property));
                                    }
                                    break;
                            }
                            output = output.replace(new RegExp(validPropKey,'g'),value);
                        }
                    }
                }
            }
            object.propertyNames = stringPropertyName.substr(0,stringPropertyName.length -1);

            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    if (validField[key]) {
                        var validObKey = "o" + capitalizeFirstLetter(key);
                        var objectValue = object[key];
                        switch (key){
                            case validField.name:
                                objectValue = getValidName("object",objectValue);
                                break;
                        }
                        output = output.replace(validObKey,objectValue );
                    }
                }
            }
            outputs += output + "\n";
        }
        if(pLanguageSetting.structure.startWrapper){
            outputs = pLanguageSetting.structure.startWrapper + outputs;
        }
        if(pLanguageSetting.structure.endWrapper){
            outputs +=  pLanguageSetting.structure.endWrapper;
        }
        return outputs;
    }
};

/**
 * Transform name as base on  setting
 * @param type
 * @param name
 * @returns {*}
 */
function getValidName(type,name){
    switch (type)
    {
        case "object":
            return  textTransform[pLanguageSetting.oNameConvention.key].execute(name);
            break;
        case "property":
            return textTransform[pLanguageSetting.pNameConvention.key].execute(name);
            break;
    }
}

/**
 * Recursive function to loop through all objects
 * @param obj
 * @param object
 */
function parse(obj, object) {
    obj = obj || {};
    window.index++;
    var isLoop = false;

    //loop through property of current object
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            var value = obj[property],
                isArray = objectType.isArray(value),
                isObject = objectType.isObject(value),
                baseObject = null;

            isLoop = isArray ? isArray : isObject;

            if ((isObject || isArray) && !object.isArray) {
                baseObject = {
                    'id': objectCollectionHelper.generateObjectId(),
                    "isHide": false,
                    "isArrayObject": true,
                    "accessModifier": "public",
                    "name": object.isArray ? object.name : property,
                    "isArray": isArray,
                    "properties": [],
                    "objectId": object ? object.id : "",
                    "isTemp": true
                };
                objectCollectionHelper.pushObject(baseObject);
            }
            else {
                var baseProperty = {
                    "accessModifier": "public",
                    "name": property,
                    "data": value,
                    "dataType": dataType.get(value),
                    "objectId": object.id
                };
                if (object.isArray) {
                    baseObject = {'id': object.id, "name": property, "isArray": isArray};
                    if (!isObject) {
                        object.isArrayObject = false;
                        object.isHide = true;
                    }
                }

                if (!objectCollectionHelper.isPropertyExist(baseProperty) && !isObject) {
                    objectCollectionHelper.pushProperty(baseProperty)
                }
            }
            // loop through next property
            if (isLoop) {
                parse(value, baseObject);
            }
        } else {
            console.log(property + "   " + obj[property]);
        }
    }
    window.index--;

    if (window.index == -1) {
        //remove duplicate object
        var hasCodes = [];
        for (var index = 0; index < objectCollection.length; index++) {
            object = objectCollection[index];
            if (hasCodes.indexOf(object.hashCode) > -1) {
                object.isHide = true;
                continue;
            }
            if (!object.isHide) {
                hasCodes.push(object.hashCode);
            }
        }
    }
}

// type of object
var objectType = {
    /**
     * Check object is array or not
     * @param {Object} obj :  Object need to check
     * @return {bool}
     */
    isArray: function (obj) {
        return obj.constructor === Array;
    },

    /**
     * Check object is object or not
     * @param {Object} obj :  Object need to check
     * @return {bool}
     */
    isObject: function (obj) {
        return obj.constructor === Object;
    }
};

// use to insert , get, remove object and property in objectCollection array
var objectCollectionHelper = {
    /**
     * Push an object into objectCollection
     * @param {Object} newObject :  Object need to push into objectCollection
     */
    pushObject: function (newObject) {
        newObject.key = newObject.name;
        newObject.name =  objectCollectionHelper.getUniqueObjectName(newObject.name);
        objectCollection.push(newObject);
        if (newObject.objectId) {
            if(pLanguageSetting.isRef)
                newObject.dataType = newObject.name;
            else
                newObject.dataType = new Function(pLanguageSetting.dataType["default"])();

            this.pushProperty(newObject);
        }
    },

    /**
     * Push a property into an object in objectCollection
     * @param {Object} property :  property need to push into an object in objectCollection
     */
    pushProperty: function (property) {
        var selectedObject = this.getObjectById(property.objectId);
        if (selectedObject) {
            property.name = objectCollectionHelper.getUniquePropertyName(property.name,selectedObject);
            if (!property.isArray) {
                if (pLanguageSetting.dataType[property.dataType])
                    property.dataType = new Function('property', pLanguageSetting.dataType[property.dataType])(property);
            }
            selectedObject.properties.push(property);
            if (selectedObject.isArray && !selectedObject.isArrayObject) {
                if((selectedObject.properties.length > 1) && (selectedObject.dataType != property.dataType)){
                    selectedObject.dataType = new Function(pLanguageSetting.dataType["default"])();
                }
                else
                    selectedObject.dataType = property.dataType;
            }
            selectedObject.hashCode = selectedObject.key;
            for (var index = 0; index < selectedObject.properties.length; index++) {
                var prop = selectedObject.properties[index];
                selectedObject.hashCode += prop.name;
            }
        }
    },

    /**
     * Check property exist in a specific object
     * @param property
     * @returns {boolean}
     */
    isPropertyExist: function (property) {
        var object = this.getObjectById(property.objectId);
        if (object && object.properties) {
            for (var index = 0; index < object.properties.length; index++) {
                var prop = object.properties[index];
                if (prop.name == property.name) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Get all of objects in objectCollection
     * @return {Array} array of object in objectCollection
     */
    getObjectCollection: function () {
        return objectCollection;
    },

    /**
     * Get a object form object collection by id
     * @param objectId
     * @returns {*}
     */
    getObjectById: function (objectId) {
        for (var key in objectCollection) {
            if (objectCollection.hasOwnProperty(key)) {
                var object = objectCollection[key];
                if (object.id == objectId) {
                    return object;
                }

            }
        }
        return null;
    },

    /**
     * Generate a object unique name
     * @param name
     * @returns {*}
     */
    getUniqueObjectName : function (name) {
        var index = 0;
        var objectLength = objectCollection.length;
        while(index < objectLength){
            var object = objectCollection[index];
            if(name == object.name){
                name = object.name + objectLength;
                index = 0;
                continue;
            }
            index++;
        }
        return name;
    },

    /**
     * Generate a property unique name
     * @param name
     * @param object
     * @returns {*}
     */
    getUniquePropertyName : function (name,object) {
        var index = 0;
        var propLength = object.properties.length;
        while(index < propLength){
            var property = object.properties[index];
            if(name == property.name){
                name = property.name + propLength;
                index = 0;
                continue;
            }
            index++;
        }
        return name;
    }
};

// Javascript build-in data types
var dataType = {
    string: {
        name: "String",
        isField: true
    },
    number: {
        name: "Number",
        isField: true
    },
    boolean: {
        name: "Boolean",
        isField: true
    },
    object: {
        name: "Object",
        isField: true
    },
    array: {
        name: "Array",
        isField: true
    },
    null: {
        name: "Null"
    },
    undefined: {
        name: "Undefined"
    },
    date: {
        name: "Date"
    },

    /**
     * Get type of input value
     * @param {Object} value :  value need to get type
     * @return {string} valueType : type of input value
     */
    get: function (value) {
        var valueType = typeof value;
        if (valueType == this.object.name.toLowerCase()) {
            valueType = objectType.isArray(value) ? this.array.name : this.object.name;
        }
        return valueType;
    }
};

var textTransform = {
    upperCase: {
        key: "upperCase",
        name: "uppercase",
        execute: function (txt) {
            return txt.toUpperCase();
        }

    },
    lowerCase: {
        key: "lowerCase",
        name: "lowercase",
        execute: function (txt) {
            return txt.toLowerCase();
        }
    },
    camelCase: {
        key: "camelCase",
        name: "capitalize",
        execute: function (txt) {
            return txt.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
                if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
                return index == 0 ? match.toUpperCase() : match.toLowerCase();
            });
        }
    },
    keepOriginal: {
        key: "keepOriginal",
        name: "original",
        execute: function(txt){
            return txt;
        }
    }
};


var outputLanguageSetting = {
    csharp: {
        dataType: {
            string: "return 'String';",
            number: "return 'Int';",
            boolean: "return 'Bool';",
            array: "return 'List<' + property.dataType + '>';",
            default: "return 'Object';"
        },
        oNameConvention: textTransform.keepOriginal,
        pNameConvention: textTransform.upperCase,
        isRef: true,
        structure:{
            "body": "oAccessModifier class oName\n{\n\t@property\n}",
            "property": "pAccessModifier pDataType pName;",
            "propertySign": "\n\t@property"
        }
    },
    java :{
        dataType:{
            string: "return 'string';",
            number: "return 'int';",
            boolean: "return 'bool';",
            array: "return 'List<' + property.dataType + '>';",
            default: "return 'object';"
        },
        oNameConvention: textTransform.keepOriginal,
        pNameConvention: textTransform.keepOriginal,
        isRef: true,
        structure:{
            "body": "oAccessModifier class oName\n{\n\t@property\n}",
            "property": "pAccessModifier pDataType pName;",
            "propertySign": "\n\t@property"
        }
    },
    vb : {
        dataType: {
            string: "return 'String';",
            number: "return 'Integer';",
            boolean: "return 'Boolean';",
            array: "return 'List(Of '+ property.dataType +')';",
            default: "return 'Object';"
        },
        isRef: true,
        structure:{
            "propertySign": "\n\t@property",
            "body": "oAccessModifier oName\n\t@property\nEnd Class\n",
            "property": "pAccessModifier pName as pDataType;"
        },
        oNameConvention: textTransform.keepOriginal,
        pNameConvention: textTransform.keepOriginal
    },
    php: {
        dataType: {
            string: "return '$';",
            number: "return '$';",
            boolean: "return '$';",
            array: "return '$';",
            default: "return '$';"
        },
        isRef: false,
        structure:{
            "startWrapper": "<?php \n",
            "endWrapper": "?>",
            "propertySign": "\n\t@property",
            "body": "class oName\n{\n\t@property\n}\n",
            "property": "pAccessModifier pDataTypepName;"
        },
        oNameConvention: textTransform.keepOriginal,
        pNameConvention: textTransform.keepOriginal
    },
    javascript: {
        dataType: {
            string: "return 'var';",
            number: "return 'var';",
            boolean: "return 'var';",
            array: "return 'var';",
            default: "return 'var';"
        },
        isRef: false,
        structure:{
            "propertySign": "\n\t@property",
            "body": "function oName(oPropertyNames)\n{\n\t@property\n}\n",
            "property": "this.pName = pName;"
        },
        oNameConvention: textTransform.keepOriginal,
        pNameConvention: textTransform.keepOriginal
    },
	cplus:{
		dataType:{

		},
		structure :{

		}
	}
};

/**
 * recursive function to clone an object. If a non object parameter
 * is passed in, that parameter is returned and no recursion occurs.
 * @param obj
 * @returns {*}
 */
function cloneObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    var temp = obj.constructor(); // give temp the original obj's constructor
    for (var key in obj) {
        if(obj.hasOwnProperty(key))
            temp[key] = cloneObject(obj[key]);
    }

    return temp;
}


// object includes all of data structure function
var dataStructure = {
    json: {
        name: "json",
        /**
         * Check string is valid json or not
         * @param {string} str :  string
         * @return {boolean}
         */
        isValid: function (str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        },

        /**
         * Convert json to object
         * @param str
         */
        toObject: function (str) {
            return JSON.parse(str);
        }
    }
};
