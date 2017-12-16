// ESTRUCTURA BASICA

$(function() {
	var plugin = new CodeDrag.Plugin('Hipervinculo');

	plugin.addProperty('String', 'MiTexto');
	plugin.addProperty('String', 'MiVinculo');

	plugin.onCompile = function(data) {
		return '<a href="' + data['MiVinculo'] + '">' +
				data['MiTexto'] + '</a>';	
	};

	plugin.initialize();
});