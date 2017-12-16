$(function() {
	var plugin = new CodeDrag.Plugin('Barra');

	plugin.addElementList('Hipervinculos', ['Hipervinculo']);

	plugin.computerStyle['barra'] = {
		'display': 'flex',
		'flex-direction': 'row',
		'justify-content': 'space-around',
		'align-items': 'center',
		'background': '#006666',
		'width': '100%'
	};

	plugin.computerStyle['barra a'] = {
		'margin': '0',
		'display': 'block',
		'padding': '10px 20px',
		'background': '#00FF00',
		'text-decoration': 'none',
		'border-radius': '20px',
		'font-size': '120%'
	};

	plugin.computerStyle['barra a:hover'] = {
		'background': '#00FFFF'
	};
	

	plugin.onCompile = function(properties) {
		var html = '';
		html += '<div class=\"' + plugin.N('barra') + '\">';
		html += plugin.getHTML(properties.Hipervinculos);
		html += '</div>';
		return html;
	};

	plugin.initialize();
});