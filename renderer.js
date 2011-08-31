window.Renderer = (function($) {

// transform a tiddler to HTML, based on type
var parse = function(tiddler, cntxt) {
};

// parse a tiddler and render it into the DOM
var render = function(tiddler, context) {
	var renderer, cntxt, html;

	renderer = types[tiddler.type] || types['default'];
	context = context || renderer.context || {};

	html = renderer.render.call(context, tiddler);

	return html;
};

var types = {
	'text/html': {
		render: function(tiddler) {
			return tiddler.text;
		}
	},
	'text/javascript': {
		render: function(tiddler) {
			// simply call the javascript as an immediately executing function with context
			// TODO: Add Google Caja (or similar)
			return new Function(tiddler.text).call(this);
		}
	},
	'default': {
		render: function(tiddler) {
			return '<div>' + tiddler.text + '</div>';
		}
	}
};

var register = function(type, render, context) {
	types[type] = {
		render: render,
		context: context || {}
	};
};

return {
	render: render,
	types: types,
	register: register
};

}(jQuery));
