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



                if (type === `Object`) {
                    str += ` * @property {${type}} ${propertyName}\n`;
                    str += recursiveTyping(variable, propertyName)
                }
                else if (type === `Array` && variable.length > 0) {
                    const elem = variable[0];
                    const elemType = getConstructorName(elem);

                    str += ` * @property {${elemType}[]} ${propertyName}\n`;
                    if( elemType === 'Object')
                        str += recursiveTyping(elem, `${propertyName}[]`)
                }
                // else if(variable) {
                //     str += ` * @property {${type}} ${propertyName} - ${variable}\n`;
                // }
                else {
                    str += ` * @property {${type}} ${propertyName}\n`;
                }
            }
        }

        return str;
    }

    $("#convert").click(function () {
        const jsDoc = $('#jsdoc');

        let val = $('#json').val().replace(/\r?\n|\r/gm, ``);//.replace(/\s*[^"](\w+)\s*[^"]\s*:/, `"$1":`);
        try {
            //
            let obj = JSON.parse(val);

            let str = `/**\n`
                +` * @typedef {Object} newType\n`
                + recursiveTyping(obj)
                + ` */`;

            jsDoc.val(str);

        } catch (err) {
            const regex = /Unexpected token (.|\r?\n|\r) in JSON at position (\d+)/gm;
            const match = regex.exec(err.message);

            if( match && match.length > 0 ) {
                const character = match[1];
                const location = parseInt(match[2]);
                const start = Math.max(0,location-5);
                const end = Math.min(11, val.length);

                console.log(location)
                console.log(start);
                console.log(end);

                err.message += `\r\nNear: ${val.substr(start,end)}`;
            }

            jsDoc.val(err.message);
        }
    });
});
