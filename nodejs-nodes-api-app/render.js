const fs = require("fs");

class Render {
  static mergeValues(values, content) {
    for (var key in values) {
      const regex = new RegExp("{{" + key + "}}", "g");
      content = content.replace(regex, values[key])
    }
    return content;
  }

  static view(templateName, values, res) {
    var fileContent = fs.readFileSync('./views/' + templateName + '.html', 'utf8');
    fileContent = Render.mergeValues(values, fileContent);
    res.write(fileContent);
  }
}

module.exports = Render;