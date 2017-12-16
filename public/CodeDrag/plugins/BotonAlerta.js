// ESTRUCTURA BASICA

$(function() {
	var plugin = new CodeDrag.Plugin('BotonAlerta');

	plugin.addProperty('String', 'Texto_Boton');
	plugin.addProperty('String', 'Texto_Alerta');

	plugin.onCompile = function(data) {
		return '<a href="javascript:alert(\'' + data['Texto_Alerta'] + '\')">' +
				data['Texto_Boton'] + '</a>';
	};

	plugin.initialize();
});