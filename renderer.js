window.Renderer = (function($) {

var defaultContext = {};

var lookupType = function(tiddler) {
	var found = null;
	$.each(types, function(name, obj) {
		if (obj.type === tiddler.type) {
			found = obj;
			return false;
		}
	});
	return found;
};

// parse a tiddler and render it into the DOM
// template is optional and specifies the name of the render function you want to
// use (e.g. html) if you want to force a specific type.
var render = function(template, tiddler, cntxt) {
	var renderer, html;

	var templateIsTid = (template instanceof tiddlyweb.Tiddler) ? true : false;
	tid = (templateIsTid) ? template : tiddler;

	renderer = (templateIsTid) ? (lookupType(tid) || types['default']) :
		types[template];
	context = (renderer.context) ? $.extend({}, renderer.context) :
		$.extend({}, defaultContext);
	context = (templateIsTid) ? $.extend(context, tiddler) :
		$.extend(context, cntxt);

	html = renderer.render.call(context, tid);

	return html;
};

var types = {
	'html': {
		type: 'text/html',
		render: function(tiddler) {
			return tiddler.text;
		}
	},
	'widget': {
		type: 'text/javascript',
		render: function(tiddler) {
			var callback = widgets[tiddler.title],
				widget = {},
				args = this;;
			if (!callback) {
				$.globalEval(tiddler.text);
				callback = widgets[tiddler.title];
				if (!callback) {
					throw {
						name: 'BadWidgetError',
						message: 'Widget ' + tiddler.title + ' not found.'
					};
				}
			}

			callback.call(widget);
			var html = widget.handler.call({ args: args });
			if (widget.receiveMessage) {
				$(html).bind('message', function(e, message) {
					widget.receiveMessage.call({ args: args }, message);
				});
			}

			return html;
		}
	},
	'default': {
		type: 'text/plain',
		render: function(tiddler) {
			return '<div>' + tiddler.text + '</div>';
		}
	}
};

var widgets = {};

var register = function(name, type, render, context) {
	types[name] = {
		type: type || '',
		render: render,
		context: context || {}
	};
};

var addWidget = function(title, callback) {
	widgets[title] = callback;
};

var postMessage = function($el, message) {
	$el.trigger('message', message);
};

var attachStore = function(store) {
	defaultContext.store = store;
};

return {
	render: render,
	register: register,
	addWidget: addWidget,
	postMessage: postMessage,
	attachStore: attachStore
};

}(jQuery));
