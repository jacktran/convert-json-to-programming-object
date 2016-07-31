/**
 * Created by PhucTran on 12/19/2015.
 */

"use strict";

var objectCollection = [];
var index = -1;
var validField = {
    accessModifier : "accessModifier",
    name: "name",
    dataType: "dataType",
    propertyNames: "propertyNames",
    refTable : "refTable"
};
var pLanguageSetting = null;


var exampleJson =  {
	"J01" : '{"id":690752021,"age":"23","name":"srinivas","blog":"http://blog.sodhanalibrary.com","messages":[{"msgid":"1","msg":"message 1"},{"msgid":"2","msg":"message 2"}]}'
};

function createObject(jsonSting,language,customSetting) {
    objectCollection = [];
    index = -1;
	var status = true;

	// check if have custom setting
	// if have custom setting we will use it
	// if don't have custom setting we will use default setting
	customSetting ? pLanguageSetting = customSetting 
	              : pLanguageSetting = outputLanguageSetting[language];
	
	// check valid json and setting 	
	var message =  !dataStructure.json.isValid(jsonSting) ? "Invalid json string"	
					: !pLanguageSetting ? "Invalid programming language" : "";
	
    if(!message){
		// parse json to javascript object
        var object = dataStructure.json.toObject(jsonSting);
		
		// SQL don't need rootObject (outer most class)
		object =  !pLanguageSetting['isSQL'] ?  {rootObject: object} : object;
		
		// by default, SQL table doesn't need rootObject
		// but we still need rootObject if json string doesn't have parent 
		// ex: exampleJson['J01'] - id , age , name , blog properties don't have parent.
		// if parse(object) return false , it will need an outer most class named rootObject.
        if(parse(object) == false){
			parse({rootObject: object});
		}
        message = pattern.execute();
    }
    return {
        status : !!message,
        message : message
    }
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getMatchIndices(regex, str) {
    var result = [];
    var match;
    regex = new RegExp(regex);
    while (match = regex.exec(str))
        result.push(match.index);
    return result;
}

var pattern = {
    "execute": function () {
        var objects = objectCollectionHelper.getObjectCollection();
        var outputs = "";
        var codeRegex = /\${([\S\s]*)}/g;
        var codeMatches = [] ;
        var codeFound;
		if(pLanguageSetting.isSQL)
			objectCollectionHelper.sqlReorder();
		
        for (var j = 0; j < objects.length; j++) {
            var object = objects[j];
            if (object.isHide)continue;
            var output = pLanguageSetting.structure.body;
            var properties = object.properties;
			var totalForeign = 0;
			var totalPrimary = 0;
			var totalKey = 0;
			var oTotalKey  = object.totalForeign + object.totalPrimary;
            var stringPropertyName = "";
			var hasForeign = false;
            for (var z = 0; z < properties.length; z++) {
                var nextPropertySign = "";
				var isLastProp = (z == (properties.length - 1)) ? true : false;
                if (z < (properties.length - 1)) {
                    nextPropertySign = pLanguageSetting.structure.propertySign;
                }
                output = output.replace("@property", pLanguageSetting.structure.property + nextPropertySign);
                var property = properties[z];
				
                if(pLanguageSetting.structure.primary){
                    if(property.isPrimary){
						totalKey++;
						var primaryPart = pLanguageSetting.structure.primary;
						if(totalKey == oTotalKey && !hasForeign){
							primaryPart = primaryPart.substring(0, primaryPart.length - 1);
						}
                        output = output.replace("@primary",primaryPart);
                    }
                }
                if(pLanguageSetting.structure.foreigns){
                    if(property.isForeign){
						totalKey++;
						var foreignPart = pLanguageSetting.structure.foreigns;
						if(totalKey == oTotalKey)
						{
							foreignPart = foreignPart.substring(0, foreignPart.length - 1);
						}
							
                        output = output.replace("@foreigns",foreignPart  + "@foreigns");
                    }
                }

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
			
            output = output.replace("@foreigns","");
            output = output.replace("@primary","");
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
                        output = output.replace(new RegExp(validObKey,'g'),objectValue );
                    }
                }
            }

         //var  indices = getMatchIndices(/\${/g,pLanguageSetting.structure.body);
        //console.log(outputs);
        //console.log("========================");
        /*for(var p =0; p < indices.length; p++){

            var startIndex = indices[p];
            var codeFound =  getCodeBlock(pLanguageSetting.structure.body,startIndex + 1);            
            outputs += output.replace("$" +codeFound,eval(codeFound)) + "\n";
        }*/
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

function  getCodeBlock(block,startIndex ) {
    var  currPos = startIndex,
        openBrackets = 0,
        stillSearching = true,
        waitForChar = false;

    while (stillSearching && currPos <= block.length) {
        var currChar = block.charAt(currPos);

        if (!waitForChar) {
            switch (currChar) {
                case '{':
                    openBrackets++;
                    break;
                case '}':
                    openBrackets--;
                    break;
                case '"':
                case "'":
                    waitForChar = currChar;
                    break;
                case '/':
                    var nextChar = block.charAt(currPos + 1);
                    if (nextChar === '/') {
                        waitForChar = '\n';
                    } else if (nextChar === '*') {
                        waitForChar = '*/';
                    }
            }
        } else {
            if (currChar === waitForChar) {
                if (waitForChar === '"' || waitForChar === "'") {
                    block.charAt(currPos - 1) !== '\\' && (waitForChar = false);
                } else {
                    waitForChar = false;
                }
            } else if (currChar === '*') {
                block.charAt(currPos + 1) === '/' && (waitForChar = false);
            }
        }

        currPos++;
        if (openBrackets === 0) { stillSearching = false; }
    }

    return block.substring(startIndex , currPos); // contents of the outermost brackets incl. everything inside

}


function parse(newObject, previousObject) {
    if (!previousObject)
        previousObject = {};
    window.index++;
    var isLoop = false;
    for (var property in newObject) {
        if (newObject.hasOwnProperty(property)) 
		{
            var value = newObject[property];			
            var isArray = objectType.isArray(value);
            var isObject = objectType.isObject(value);
            var baseObject = null;
            isLoop = isArray ? isArray : isObject;
			
			// if current value is array or object 
			// we will create an Object and push into object collection
			// if parent object (previousObject) is an array 
            if ((isObject || isArray) && !previousObject.isArray)
			{	
				// id: each object always have an unique object
				// isHide: use to hide or show element
				// isArrayObject : detect object is an array 
				// totalForeign : in a SQL table, maybe we'll have multiple foreign key
				// primaryForeign : in a SQL table, maybe we'll have multiple primary key
				// name : name of object
				// objectId : if previousObject != null => previousObject is parent object of current object
				// properties : array of property
                baseObject = {
                    'id': objectCollectionHelper.generateObjectId(),
                    "isHide": false,
                    "isArrayObject": true,
                    "accessModifier": "public",
					"totalForeign" : 0,
					"totalPrimary" : 0,
                    "name":  property,
                    "isArray": isArray,
                    "properties": [],
                    "objectId": previousObject ? previousObject.id : ""
                };
                objectCollectionHelper.pushObject(baseObject);
            }
            else {
				// in case SQL table, if we don't have any object in object collection
				// we need to return false to add most outer root object like this => {rootObject: object}
				if(objectCollectionHelper.getObjectCollection().length == 0) 
					return false;
				
				// accessModifier : always public
				// name : name of property
				// data : value of property
				// isPrimary : primary key of sql table , default is false
				// isForeign : foreign key of sql table , default is false
				// dataType : javascript build in data type of property. 
				//            data type is determined base on value of property 
				//            we will use this js build data to convert to another language's data type
				// objectId :  parent object id
				//             parent object of property is previousObject variable
                var baseProperty = {
                    "accessModifier": "public",
                    "name": property,
                    "data": value,
                    "isPrimary" : false,
                    "isForeign" : false,
                    "dataType": dataType.get(value),
                    "objectId": previousObject.id
                };
				
				// if parent object is an array 
                if (previousObject.isArray) {
                    baseObject = {'id': previousObject.id, "name": property, "isArray": isArray};
                    if (!isObject) {
                        previousObject.isArrayObject = false;
                        previousObject.isHide = true;
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
            console.log(property + "   " + newObject[property]);
        }
    }
    window.index--;

    if (window.index == -1) {
        ////remove duplicate object
        var hasCodes = [];
        for (var index = 0; index < objectCollection.length; index++) {
            previousObject = objectCollection[index];
            if (hasCodes.indexOf(previousObject.hashCode) > -1) {
                previousObject.isHide = true;
                continue;
            }
            if (!previousObject.isHide) {
                hasCodes.push(previousObject.hashCode);
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
        if (newObject.objectId) 
		{	
			// check if the programming language has reference type
			// ex: C# , java ....
            if(pLanguageSetting.isRef)
                newObject.dataType = newObject.name;
            else if(pLanguageSetting.isSQL){
				// if it's SQL , we'll set first property is primary key
                var selectedObject = this.getObjectById(newObject.objectId);
                var firstProperty = cloneObject(selectedObject.properties[0]);
				newObject.totalForeign++;
                firstProperty.objectId = newObject.id;
                firstProperty.isForeign = true;
                firstProperty.isPrimary = false;
				firstProperty.refTable = selectedObject.name;
                this.pushProperty(firstProperty);
                return;
            }
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
			
			// after push a property into an object 
			// we will update hashcode for that object
			// hashcode is generated by combine object key and all property name in that object 
			// hashcode will be use to remove duplicated object
            selectedObject.hashCode = selectedObject.key;
            var isPrimary = false;
            for (var index = 0; index < selectedObject.properties.length; index++) {
                var prop = selectedObject.properties[index];
                selectedObject.hashCode += prop.name;
				
				// for sql table , we need determine primary and foreign key
				// by default, we'll set first property is primary key
                if(prop.isPrimary)
                    isPrimary = prop.isPrimary;
                if(isPrimary == false){
                    if(!prop.isForeign){
                        isPrimary = true;
						selectedObject.totalPrimary++;
                        prop.isPrimary = isPrimary;
                    }
                }
            }
        }
    },
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
    },
	
	// generate an unique string 
    generateObjectId: function () {
        var u = '', m = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx', i = 0, rb = Math.random() * 0xffffffff | 0;
        while (i++ < 36) {
            var c = m[i - 1], r = rb & 0xf, v = c == 'x' ? r : (r & 0x3 | 0x8);
            u += (c == '-' || c == '4') ? c : v.toString(16);
            rb = i % 8 == 0 ? Math.random() * 0xffffffff | 0 : rb >> 4
        }
        return u
    },
	
	sqlReorder : function(){
		for(var i =0; i < objectCollection.length; i++){
			var object = objectCollection[i];
			var primaryIndexs = [];
			for(var z = 0; z < object.properties.length;z++){
				var property =  object.properties[z];
				if(property.isPrimary){
					primaryIndexs.push(z);
				}
			}
			var primaryLength = primaryIndexs.length;
			while(primaryLength--){
				move(object.properties,primaryIndexs[primaryLength],0);
			}
		}
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
	cplusplus:{
		dataType:{
			string : "return 'string';",
			boolean : "return 'bool';",
			number : "return 'interger';",
			auto : "return 'default';",
			array : "return 'vector<'+ property.dataType +'>';"
		},
		isRef: true,
		structure :{
			"propertySign": "\n\t\t@property",
            "body": "class oName \n{\n\tPublic\n\t\t@property\n}\n",
            "property": "pDataType pName;"
		},
		oNameConvention: textTransform.keepOriginal,
        pNameConvention: textTransform.keepOriginal
	},
	ruby :{
		dataType:{
			string : "return '@';",
			boolean : "return '@';",
			number : "return '@';",
			auto : "return '@';",
			array : "return '@';"
		},
		isRef: false,
		structure : {
			"propertySign": "\n\t\t@property",
			"body": "class oName\n\tdef initialize(oPropertyNames)\n\t\t@property\n\tend\nend\n",
			"property": "@pName = pName"
		},
		oNameConvention: textTransform.keepOriginal,
        pNameConvention: textTransform.keepOriginal
	},
	python : {
		dataType: {
			string : "return '';",
			boolean : "return '';",
			number : "return '';",
			auto : "return '';",
			array : "return '';"
		},
		isRef: false,
		structure : {
			"propertySign": "\n\t\t@property",
			"body": "class oName\n\tdef __init__(oPropertyNames)\n\t\t@property\n",
			"property": "self.pName = pName"
		},
		oNameConvention: textTransform.keepOriginal,
        pNameConvention: textTransform.keepOriginal
	},
	sql :{
		dataType:{
			string : "var length = property.data.length; \n"
                      + "var ranges = ['50','100','250', '1000' , '3000' , '8000']; \n"
                       + "for(var index = 0; index < ranges.length; index++){ \n"
                             + "var range = ranges[index];\n\t"
                             +"if(length < range){\n\t"
                           +    "\t  return 'varchar(' + range + ')';\n\t"
                        +   "}\n"
                       + "};",
			boolean : "return 'boolean';",
			number : "return 'int';"
		},
		isRef: false,
        noNeedRoot: true,
        isSQL: true,
		structure : {
			"propertySign": "\n\t@property",
			"body": "create table oName\n(\n\t@property \n\t@primary\n\t@foreigns\n );",
			"property": "[pName] pDataType NOT NULL,",
			"primary" : "PRIMARY KEY (pName),",
			"foreigns" : "FOREIGN KEY (pName) REFERENCES pRefTable(pName),"
		},
		oNameConvention: textTransform.keepOriginal,
        pNameConvention: textTransform.keepOriginal
	},
	mysql: {
		dataType :{ 
			string : "var length = property.data.length; \n"
                      + "var ranges = ['50','100','250', '1000' , '3000' , '8000']; \n"
                       + "for(var index = 0; index < ranges.length; index++){ \n"
                             + "var range = ranges[index];\n\t"
                             +"if(length < range){\n\t"
                           +    "\t  return 'varchar(' + range + ')';\n\t"
                        +   "}\n"
                       + "}",
			boolean : "return 'tinyint';",
			number : "return 'int';"
		},
		isRef: false,
        noNeedRoot: true,
        isSQL: true,
		structure : {
			"propertySign": "\n\t@property",
			"body": "create table oName\n(\n\t@property \n\t@primary\n\t@foreigns\n );",
			"property": "`pName` pDataType NOT NULL,",
			"primary" : "PRIMARY KEY (pName),",
			"foreigns" : "FOREIGN KEY (pName) REFERENCES pRefTable(pName),"
		},
		oNameConvention: textTransform.keepOriginal,
        pNameConvention: textTransform.keepOriginal
	}
	
};

/***
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
        toObject: function (str) {
            return JSON.parse(str);
        }
    }
};

 function move (array,old_index, new_index) {
    if (new_index >= array.length) {
        var k = new_index - array.length;
        while ((k--) + 1) {
            array.push(undefined);
        }
    }
    array.splice(new_index, 0, array.splice(old_index, 1)[0]);
    return array; // for testing purposes
};
