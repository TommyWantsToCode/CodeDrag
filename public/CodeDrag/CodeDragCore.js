var CodeDrag = {
	properties: {
		String: {
			editorHTML: '<input type=\"text\" />',
			default: 'Text'
		},
		ElementList: {
			editorHTML: null,
			default: []
		}
	},
	webSite: {
		title: 'Default title',
		elements: {
			value: []
		}
	},
	loadingPlugins: [],
	loadedPlugins: {},
	jquerySelector: null,
	listReferences: {
		list_count: 0,
		lists: {}
	},
	objectReferences: {
		object_count: 0,
		objects: {}
	},
	callback: null,
	render: function(webSite) {
		CodeDrag.webSite = webSite;
		CodeDrag.jquerySelector = 'body';
	},
	load: function(webSiteObject, jquerySelector, callback) {
		if (webSiteObject)
			CodeDrag.webSite = webSiteObject;
		CodeDrag.callback = callback?callback:null;
		CodeDrag.jquerySelector = jquerySelector!=null?jquerySelector:'body';
		// TITLE AND STYLE AUTO-INSERT/CLEAR
		if ($('title').length<=0)
			$('head').first().append('<title></title>');

		if ($('style').length<=0)
			$('head').first().append('<style type=\"text/css\"></style>');
		else
			$('style').first().html('');

		var fillPluginList = function(list, elementList) {
			for (var i = elementList.length-1; i >= 0; i--) {
				const element = elementList[i];
				if (list.indexOf(element.plugin)<0)
					if (CodeDrag.loadedPlugins[element.plugin]==undefined)
						list.push(element.plugin);
				// GET ALL PROPERTIES OF ELEMENT, AND CHECK IF ITS A LIST
				const propertiesNames = Object.keys(element.properties);
				for (var j = propertiesNames.length-1; j >= 0; j--) {
					const property = element.properties[propertiesNames[j]];
					if (property.type == 'ElementList')
						fillPluginList(list, property.value);
				}
			}
		};

		var list = [];
		fillPluginList(list, CodeDrag.webSite.elements.value);
		console.log(list);
		CodeDrag.loadingPlugins = [];
		for (var i = list.length-1; i >= 0; i--)
			CodeDrag.loadingPlugins.push(list[i]);
		
		if (list.length<=0)
			CodeDrag.onPluginsLoad();
		else
			for (var i = list.length-1; i >= 0; i--)
				$.getScript('./CodeDrag/plugins/' + list[i] + '.js').fail(function(){
					console.log(list[i] + ' failed to load');
				});

	},
	importPlugin: function(pluginName, callback) {
		if (CodeDrag.loadedPlugins[pluginName]==undefined) {
			CodeDrag.loadingPlugins.push(pluginName);
			$.getScript('./CodeDrag/plugins/' + pluginName + '.js', function() {
				setTimeout(function() {
					if (callback)
						callback(null);
				}, 1000);
			}).fail(function(){
				if (callback)
					callback(pluginName + ' failed to load');
			});
		} else {
			if (callback)
				callback('Plugin already imported');
		}
	},
	onPluginsLoad: function() {
		if (CodeDrag.webSite==null) return;
		var getCSSFromPlugin = function(pluginName, styleClassObject) {
			var text = '';
			var styleClassArray = Object.keys(styleClassObject);
			for (var i = styleClassArray.length-1; i >= 0; i--) {
				const styleClassName = styleClassArray[i];
				const styleClass = styleClassObject[styleClassName];
				text+='.CodeDrag_' + pluginName + '_' + styleClassName + '{';
				const propertiesNames = Object.keys(styleClass);
				for (var j = propertiesNames.length-1; j >= 0; j--) {
					const propertyName = propertiesNames[j]
					const propertyValue = styleClass[propertyName];
					text+= propertyName + ':' + propertyValue + ';';
				}
				text+='}';
			}
			return text;
		};
		var CSS = '';
		if (CodeDrag.jquerySelector != '#CodeDragEditor_Render')
			CSS += '.CodeDrag_ElementList {all: inherit;}';
		var pluginNames = Object.keys(CodeDrag.loadedPlugins);
		for (var i = pluginNames.length-1; i >= 0; i--) 
			CSS += getCSSFromPlugin(pluginNames[i], CodeDrag.loadedPlugins[pluginNames[i]].computerStyle);
		CSS += '@media only screen and (max-width:768px) {';
		for (var i = pluginNames.length-1; i >= 0; i--) 
			CSS += getCSSFromPlugin(pluginNames[i], CodeDrag.loadedPlugins[pluginNames[i]].phoneStyle);
		CSS += '}';
		CodeDrag.listReferences.lists = {};
		CodeDrag.listReferences.list_count = 0;
		CodeDrag.objectReferences.objects = {};
		CodeDrag.objectReferences.object_count = 0;
		var HTML = CodeDrag.getHTML(CodeDrag.webSite.elements);
		$('title').first().html(CodeDrag.webSite.title);
		$('style').first().html(CSS);
		$(CodeDrag.jquerySelector).first().html(HTML);
		for (var i = pluginNames.length-1; i >= 0; i--) 
			CodeDrag.loadedPlugins[pluginNames[i]].onStart();
		if (CodeDrag.callback)
			CodeDrag.callback();
	},
	getHTML: function(elementobject) {
		var elementList = elementobject.value;
		const currentID = CodeDrag.listReferences.list_count;
		var html = '<div class=\"CodeDrag_ElementList CodeDrag_ElementList_' + currentID + '\">';
		CodeDrag.listReferences.lists[currentID] = elementobject;
		CodeDrag.listReferences.list_count++;
		for (var n = elementList.length, i = 0 ; i < n; i++) {
			const element = elementList[i];
			const currentObjectID = CodeDrag.objectReferences.object_count;
			html += '<div class=\"CodeDrag_Object CodeDrag_Object_' + currentObjectID + '\">';
			CodeDrag.objectReferences.objects[currentObjectID] = elementList[i];
			CodeDrag.objectReferences.object_count++;
			var property_array = Object.keys(element.properties);
			var properties = {};
			for (var e = property_array.length-1; e >= 0; e--) {
				var to_add = element.properties[property_array[e]];
				if (to_add.type!='ElementList') to_add = to_add.value;
				properties[property_array[e]] = to_add;
			}
			html += CodeDrag.loadedPlugins[element.plugin].onCompile(properties);
			html += '</div>';
		}
		html += '</div>';
		return html;
	},
	Plugin: function(name) {
		this.name = name;
		this.computerStyle = {};
		this.phoneStyle = {};
		this.properties = [];
		this.possibleParents = null;
		this.S = function(shortname) {return $('.CodeDrag_' + this.name + '_' + shortname);};
		this.N = function(shortname) {return 'CodeDrag_' + this.name + '_' + shortname;};
		this.onStart = function() {};
		this.onCompile = function(data) {
			console.log(this.name + ' compiles, Override Plugin.onCompile(data) function');
			return '<h1>' + this.name + '</h1>'
		};
		this.addProperty = function(type, name) {
			if (CodeDrag.properties[type]!=null && type != 'ElementList')
				this.properties.push({type: type, name: name});
			else
				console.log('Unknown property type: ' + type);
		};
		this.addElementList = function(listname, possibleChildren) {
			this.properties.push({type: 'ElementList', parent: this.name, name: listname, possibleChildren: (possibleChildren!=null?possibleChildren:null)});
		};
		this.limitParents = function(parentList) {
			this.possibleParents = parentList;
		};
		this.initialize = function() {
			CodeDrag.loadedPlugins[this.name] = this;
			var index = CodeDrag.loadingPlugins.indexOf(this.name);
			if (index != -1) 
				CodeDrag.loadingPlugins.splice(index, 1);
			if (CodeDrag.loadingPlugins.length<=0) 
				CodeDrag.onPluginsLoad();
		};
		this.getHTML = function(elementList) {
			return CodeDrag.getHTML(elementList);
		};
	}
};