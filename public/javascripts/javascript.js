$(document).ready(function () {
    function getConstructorName(test) {
        const str = (test.prototype ? test.prototype.constructor : test.constructor).toString();
        const cname = str.match(/function\s(\w*)/)[1];
        const aliases = ["", "anonymous", "Anonymous"];
        return aliases.indexOf(cname) > -1 ? "Function" : cname;
    }

    function recursiveTyping(json, parent) {
        let str = ``;
        for (const property in json) {
            if (json.hasOwnProperty(property)) {
                const variable = json[property];

                let type;
                if (!variable)
                    type = "String";
                else
                    type = getConstructorName(variable);

                let propertyName = '';
                if (parent) {
                    propertyName = `${parent}.`;
                }
                propertyName += `${property}`;

                str += ` * @property {${type}} ${propertyName} - ${variable}\n`;

                if (type === `Object`) {
                    recursiveTyping(variable, propertyName)
                }
            }
        }

        return str;
    }

    $("#convert").click(function () {
        const jsDoc = $('#jsdoc');

        try {
            let val = $('#json').val().replace(/(\w+)\s*:/, `"$1":`);
            let obj = JSON.parse(val);

            let str = `/**\n`
                +` * @typedef {Object} newType\n`
                + recursiveTyping(obj)
                + ` */`;

            jsDoc.val(str);

        } catch (err) {
            jsDoc.val(err.message);
        }
    });
});
