var CodeDragEditor = {
	selectedItem: null,
	addListPadding: function() {
		$('.CodeDrag_ElementList').addClass('CodeDragEditor_listSplit');
		$('.CodeDrag_Object').addClass('CodeDragEditor_objectSplit');
	},
	removeListPadding: function() {
		$('.CodeDragEditor_listSplit').removeClass('CodeDragEditor_listSplit');
		$('.CodeDragEditor_objectSplit').removeClass('CodeDragEditor_objectSplit');
		$('.CodeDragEditor_dropTarget').removeClass('CodeDragEditor_dropTarget');
	},
	saveProperties: function() {
		if (CodeDragEditor.selectedItem) {
			$('.CodeDragProperty').each(function() {
				CodeDragEditor.selectedItem.properties[$(this).attr('name')].value = $(this).val();
			});
			CodeDrag.load(null, '#CodeDragEditor_Render', function() {
				CodeDragEditor.setRenderedPageFunctions();
			});
		}
	},
	createEditorEvents: function() {
		// IMPORT BUTTON
		$('#import_button').on('click', function() {
			const to_import = $('#import_text').val();
			CodeDrag.importPlugin(to_import, function(error) {
				if (error) alert(error);
				var html = '';
				const plugins = Object.keys(CodeDrag.loadedPlugins);
				if (plugins.length==0)
					html = '<h3 class="EditorNote">No imports</h3>';
				for (var i = 0; i < plugins.length; i++) 
					html += '<div class=\"ImportedTool\" draggable=\"true\" ondragstart=\"CodeDragEditor.dragEvents.drawNewElement(event)\">' + plugins[i] + '</div>';
				$('#Imports').html(html);
				$('#import_text').val('');
			});
			return true;
		});
		$('#CodeDragEditor_Button_Code').on('click', function() {
			const code = JSON.stringify(CodeDrag.webSite, null, '  ');
			$('#CodeDragEditor_Render').html('<pre style="padding: 20px;"></pre>');
			$('#CodeDragEditor_Render pre').text('CodeDrag.load(' + code + ');');
		});
		$('#CodeDragEditor_Button_Compile').on('click', function() {
			CodeDrag.load(null, '#CodeDragEditor_Render', function() {
				CodeDragEditor.addListPadding();
				CodeDragEditor.setRenderedPageFunctions();
				setTimeout(function() {
					CodeDragEditor.removeListPadding();
				}, 100);
				return true;
			});
		});
	},
	setRenderedPageFunctions: function() {
		$('.CodeDrag_ElementList').each(function() {
			$(this).attr('draggable', 'true');
			$(this).attr('ondrop', 'CodeDragEditor.dragEvents.drop(event)');
			$(this).attr('ondragenter', 'CodeDragEditor.dragEvents.dragEnterElementList(event)');
			$(this).attr('ondragover', 'CodeDragEditor.dragEvents.allowDrop(event)');
			$(this).attr('ondragleave', 'CodeDragEditor.dragEvents.dragExitElementList(event)');
		});
		$('.CodeDrag_Object').on('click', function() {
			$('.CodeDrag_Object').removeClass('CodeDragEditor_SelectedObject');
			$(this).addClass('CodeDragEditor_SelectedObject');
			var classes = $(this).attr('class').split(/\s+/);
			for (var i = classes.length-1; i >= 0; i--) {
				if (classes[i].startsWith('CodeDrag_Object_')) {
					CodeDragEditor.selectedItem = CodeDrag.objectReferences.objects[(classes[i].split('_')[2])];
					if (CodeDragEditor.selectedItem != null) {
						var html = '<h2 class="EditorTitle">' + CodeDragEditor.selectedItem.plugin + '</h2>';
						const propertyList = Object.keys(CodeDragEditor.selectedItem.properties);
						for (var j = propertyList.length-1; j >= 0; j--) {
							const name = propertyList[j];
							const property = CodeDragEditor.selectedItem.properties[name];
							const editorHTML = CodeDrag.properties[property.type].editorHTML;
							if (editorHTML)  {
								var to_add = $(editorHTML);
								to_add.attr('name', name);
								to_add.attr('value', property.value);
								to_add.attr('placeholder', name);
								to_add.addClass('CodeDragProperty');
								html += '<hr />';
								html += '<h4 class="EditorNote" style="width:100%;text-align:left;padding:0;margin:0">' + name.toUpperCase() + '</h4>';
								html += to_add.get(0).outerHTML;
							}
						}
						html += '<input type=\"button\" onclick=\"CodeDragEditor.saveProperties()\" style=\"width: 100%;font-size:150%;padding:5px 20px;margin:10px 0px;\" value=\"Save\" />'
						$('#CodeDragEditor_Selected_Properties').html(html);
					}
				}
			}
			return false;
		});
		$('.CodeDrag_ElementList').on('click', function() {
			$('.CodeDrag_Object').removeClass('CodeDragEditor_SelectedObject');
			CodeDragEditor.selectedItem = null;
			$('#CodeDragEditor_Properties').html('<h1 class="EditorTitle"> Properties </h3>'
				+ '<hr class="EditorSeparator" />'
				+ '<div id="CodeDragEditor_Selected_Properties">'
				+ '<h3 class="EditorNote"> No selection </h3>'
				+ '</div>');
			return false;
		});
		$(document).on('mouseup', function() {
			CodeDragEditor.removeListPadding();
		});
	},
	dragEvents: {
		drawNewElement: function(e) {
			CodeDragEditor.addListPadding();
			var plugin = CodeDrag.loadedPlugins[e.srcElement.innerText];
			if (plugin != null) {
				e.dataTransfer.setData('plugin', e.srcElement.innerText);
				var object = {
					plugin: e.srcElement.innerText,
					properties: {}
				};
				for (var i = plugin.properties.length-1; i >= 0; i--) {
					const property = plugin.properties[i];
					object.properties[property.name] = property;
					object.properties[property.name].value = CodeDrag.properties[property.type].default;
					if (property.possibleChildren!=null)
						object.properties[property.name].possibleChildren = property.possibleChildren;
					if (plugin.possibleParents != null)
						object.possibleParents = plugin.possibleParents;
				}
			 	e.dataTransfer.setData('elementjson', JSON.stringify(object));
			}
		},
		allowDrop: function(e) {
			e.preventDefault();
		},
		drop: function(e) {
			var data;
			try {data = JSON.parse(e.dataTransfer.getData('elementjson'));
			} catch (e) {return false;}
			if (data!=null) {
				var classes = e.target.className.split(/\s+/);
				for (var i = classes.length-1; i >= 0; i--) {
					if (classes[i].startsWith('CodeDrag_ElementList_')) {
						var number = classes[i].split('_')[2];
						e.stopPropagation();
						e.preventDefault();
						const possibleChildren = CodeDrag.listReferences.lists[number].possibleChildren;
						const possibleParents = data.possibleParents;
						if (possibleChildren && possibleChildren.indexOf(data.plugin)<0) {
							CodeDragEditor.removeListPadding();
							return true;
						}
						if (possibleParents && possibleParents.indexOf(CodeDrag.listReferences.lists[number].parent)<0) {
							CodeDragEditor.removeListPadding();
							return true;
						}
						CodeDrag.listReferences.lists[number].value.push(data);
						CodeDrag.load(null, '#CodeDragEditor_Render', function() {
							CodeDragEditor.addListPadding();
							CodeDragEditor.setRenderedPageFunctions();
							setTimeout(function() {
								CodeDragEditor.removeListPadding();
							}, 100);
							return true;
						});
					}
				}
			}
		},
		dragEnterElementList: function(e) {
			$(e.target).addClass('CodeDragEditor_dropTarget');
		},
		dragExitElementList: function(e) {
			$(e.target).removeClass('CodeDragEditor_dropTarget');
		}
	}
};





$(function() {
	CodeDragEditor.createEditorEvents();
	CodeDrag.load(null, '#CodeDragEditor_Render', function() {
		CodeDragEditor.setRenderedPageFunctions();
	});
});