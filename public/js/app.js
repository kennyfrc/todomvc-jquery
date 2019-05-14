/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';

	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	};

	var App = {
    // initialize local storage, todotemplate, footer template, and 
    // initialize event handlers
    // pass the handlebars templates that will be dynamically rendered. grab it
    // via jquery, turn it into html, then pass it to the Handlebars compiler
		init: function () {
			this.todos = util.store('todos-jquery');
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.bindEvents();
      // the colon turns the path into a variable
      new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');      
		},
    // callbacks or event handlers
		bindEvents: function () {
      // here, you're passing the jquery object $('#new-todo') on the this.create method
			$('#new-todo').on('keyup', this.create.bind(this));
			$('#toggle-all').on('change', this.toggleAll.bind(this));
			$('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this));
			$('#todo-list')
				.on('change', '.toggle', this.toggle.bind(this))
				.on('dblclick', 'label', this.edit.bind(this))
				.on('keyup', '.edit', this.editKeyup.bind(this))
				.on('focusout', '.edit', this.update.bind(this))
				.on('click', '.destroy', this.destroy.bind(this));
		},
    // get array filter status via router
    // renders todolist
    // hides or shows the main
    // toggle all is checked or not based on activeTodos
    // render footer
    // focus
    // store at local storage
		render: function () {
			var todos = this.getFilteredTodos();
			$('#todo-list').html(this.todoTemplate(todos));
			$('#main').toggle(todos.length > 0);
      // you can use a function to set properties
      // if there are no non-complete todos, add the checked property to toggle-all
			$('#toggle-all').prop('checked', this.getActiveTodos().length === 0);
			this.renderFooter();
      // focus on the input area
			$('#new-todo').focus();
      // local storage
			util.store('todos-jquery', this.todos);
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.getActiveTodos().length;
			var template = this.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			$('#footer').toggle(todoCount > 0).html(template);
		},
    // returns true or false on whether or not the checkbox is checked (after click)
		toggleAll: function (e) {
      // value of a property for the first element in the set of matched elements or set one or more properties for every matched element.
      // could be true or false
			var isChecked = $(e.target).prop('checked');
      // assign the result to each one
			this.todos.forEach(function (todo) {
				todo.completed = isChecked;
			});
      // render the result to the page
			this.render();
		},
    // returns non-complete todos
		getActiveTodos: function () {
			return this.todos.filter(function (todo) {
				return !todo.completed;
			});
		},
    // returns completed todos
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) {
				return todo.completed;
			});
		},
    // get status of filter in the router
    // then return the correct filtered array
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				return this.getActiveTodos();
			}

			if (this.filter === 'completed') {
				return this.getCompletedTodos();
			}

			return this.todos;
		},
    // get all non-complete, set filter all, render it (you're not really deleting stuff here)
		destroyCompleted: function () {
			this.todos = this.getActiveTodos();
			this.filter = 'all';
			this.render();
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
		indexFromEl: function (el) {
			var id = $(el).closest('li').data('id');
			var todos = this.todos;
			var i = todos.length;
    // work backwards in an array until you bump into the value u want to find
			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
    // this takes a jQuery object
		create: function (e) {
      // .target just gets the DOM element that initiatied the event
      // $() turns it into a jQuery object you can run methods on. 
      // this is preferrable to just passing it because it keeps your code 'safe'
			var $input = $(e.target);
      // gets value of the input them trims it
			var val = $input.val().trim();
      
      // this ensures that the succeeding code only triggers
      // if enter is pushed via .which or .key
			if (e.which !== ENTER_KEY || !val) {
				return;
			}
      // pushes the value into the todos data structure
			this.todos.push({
				id: util.uuid(),
				title: val,
				completed: false
			});
      // resets val back
			$input.val('');
      // renders it
			this.render();
		},
		toggle: function (e) {
			var i = this.indexFromEl(e.target);
			this.todos[i].completed = !this.todos[i].completed;
			this.render();
		},
		edit: function (e) {
			var $input = $(e.target).closest('li').addClass('editing').find('.edit');
			$input.val($input.val()).focus();
		},
		editKeyup: function (e) {
			if (e.which === ENTER_KEY) {
				e.target.blur();
			}

			if (e.which === ESCAPE_KEY) {
				$(e.target).data('abort', true).blur();
			}
		},
		update: function (e) {
			var el = e.target;
			var $el = $(el);
			var val = $el.val().trim();

			if (!val) {
				this.destroy(e);
				return;
			}

			if ($el.data('abort')) {
				$el.data('abort', false);
			} else {
				this.todos[this.indexFromEl(el)].title = val;
			}

			this.render();
		},
    // e is a jQuery object 
    /* jQuery is mainly used to make it easier to do HTML document traversal and manipulation, 
    / event handling, animation, and Ajax much simpler with an easy-to-use API.
    / grabs the index from the element
    / removes it from the array via splice
    / renders
    */
		destroy: function (e) {
			this.todos.splice(this.indexFromEl(e.target), 1);
			this.render();
		}
	};
  
  // invoke before the end of the jQuery ready "capsule"
	App.init();
});