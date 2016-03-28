/**
 * nlform.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
;( function( window ) {

	'use strict';

	var document = window.document;

	if (!String.prototype.trim) {
		String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
	}

	function NLForm( el, elClass ) {
		this.el = el;
		this.overlay = this.el.querySelector( '.nl-overlay' );
		this.elClass = (elClass !== undefined) ? '.' + elClass : '';
		this.fields = [];
		this.fldOpen = -1;
		this._init();
	}

	NLForm.prototype = {
		_init : function() {
			var self = this;
			Array.prototype.slice.call( this.el.querySelectorAll( 'select' + self.elClass ) ).forEach( function( el, i ) {
				self.fldOpen++;
				self.fields.push( new NLField( self, el, 'dropdown', self.fldOpen ) );
			} );
			Array.prototype.slice.call( this.el.querySelectorAll( 'input' + self.elClass + ':not([type="hidden"]):not([type="submit"])' ) ).forEach( function( el, i ) {
				self.fldOpen++;
				self.fields.push( new NLField( self, el, 'input', self.fldOpen ) );
			} );
			this.overlay.addEventListener( 'click', function(ev) { self._closeFlds(); } );
			this.overlay.addEventListener( 'touchstart', function(ev) { self._closeFlds(); } );
		},
		_closeFlds : function() {
			if( this.fldOpen !== -1 ) {
				this.fields[ this.fldOpen ].close();
			}
		}
	};

	function NLField( form, el, type, idx ) {
		var parsed = el.getAttribute('data-parsed');
		if (parsed != 1) {
			el.setAttribute('data-parsed', 1);
			this.form = form;
			this.elOriginal = el;
			this.pos = idx;
			this.type = type;
			this._create();
			this._initEvents();
		}
	}

	NLField.prototype = {
		_create : function() {
			if( this.type === 'dropdown' ) {
				this._createDropDown();
			}
			else if( this.type === 'input' ) {
				this._createInput();
			}
		},
		_createDropDown : function() {
			var self = this;
			this.fld = document.createElement( 'div' );
			this.fld.className = 'nl-field nl-dd';
			this.toggle = document.createElement( 'a' );
			this.toggle.innerHTML = this.elOriginal.options[ this.elOriginal.selectedIndex ].innerHTML;
			this.toggle.className = 'nl-field-toggle';
			this.optionsList = document.createElement( 'ul' );
			this.optionsList.innerHTML = this._getListOptions();
			this.fld.appendChild( this.toggle );
			this.fld.appendChild( this.optionsList );
			this.elOriginal.parentNode.insertBefore( this.fld, this.elOriginal );
			this.elOriginal.style.display = 'none';
		},
		_createInput : function() {
			var self = this;
			this.fld = document.createElement( 'div' );
			this.fld.className = 'nl-field nl-ti-text';
			this.toggle = document.createElement( 'a' );
			this.toggle.innerHTML = this.elOriginal.getAttribute('value')? this.elOriginal.getAttribute('value'): this.elOriginal.getAttribute('placeholder');
			this.toggle.className = 'nl-field-toggle';
			this.optionsList = document.createElement( 'ul' );
			this.getinput = document.createElement( 'input' );
			this.getinput.setAttribute( 'type', this.elOriginal.getAttribute('type')? this.elOriginal.getAttribute('type'): '');
			this.getinput.setAttribute( 'placeholder', this.elOriginal.getAttribute( 'placeholder' ) );
			this.getinput.setAttribute( 'value', this.elOriginal.getAttribute('value')? this.elOriginal.getAttribute('value'): '');
			this.getinputWrapper = document.createElement( 'li' );
			this.getinputWrapper.className = 'nl-ti-input';
			this.inputsubmit = document.createElement( 'button' );
			this.inputsubmit.className = 'nl-field-go';
			this.inputsubmit.innerHTML = 'Go';
			this.getinputWrapper.appendChild( this.getinput );
			this.getinputWrapper.appendChild( this.inputsubmit );
			this.optionsList.appendChild( this.getinputWrapper );
			this.fld.appendChild( this.toggle );
			this.fld.appendChild( this.optionsList );
			this.elOriginal.parentNode.insertBefore( this.fld, this.elOriginal );
			this.elOriginal.style.display = 'none';
		},
		_initEvents : function() {
			var self = this;
			this.toggle.addEventListener( 'click', function( ev ) { ev.preventDefault(); ev.stopPropagation(); self._open(); } );
			this.toggle.addEventListener( 'touchstart', function( ev ) { ev.preventDefault(); ev.stopPropagation(); self._open(); } );

			if( this.type === 'dropdown' ) {
				var opts = Array.prototype.slice.call( this.optionsList.querySelectorAll( 'li' ) );
				opts.forEach( function( el, i ) {
					el.addEventListener( 'click', function( ev ) { ev.preventDefault(); self.close( el, opts.indexOf( el ) ); } );
					el.addEventListener( 'hover', function( ev ) { ev.preventDefault(); self.close( el, opts.indexOf( el ), true ); } );
					el.addEventListener( 'touchstart', function( ev ) { ev.preventDefault(); self.close( el, opts.indexOf( el ) ); } );
				} );
			}
			else if( this.type === 'input' ) {
				this.getinput.addEventListener( 'keydown', function( ev ) {
					if ( ev.keyCode == 13 ) {
						self.close();
					}
				} );
				this.inputsubmit.addEventListener( 'click', function( ev ) { ev.preventDefault(); self.close(); } );
				this.inputsubmit.addEventListener( 'touchstart', function( ev ) { ev.preventDefault(); self.close(); } );
			}

		},
		_open : function() {
			if( this.open ) {
				return false;
			}
			this.open = true;
			this.form.fldOpen = this.pos;
			var self = this;
			this.fld.className += ' nl-field-open';
			this._setFontSize();
			this._checkPosition();
			this._setPosition();
		},
		_checkPosition: function() {
			var ul = this.fld.querySelector('ul');
			var left = this._getOffset(ul).left;

			var windowWidth = document.documentElement.clientWidth
				|| document.body.clientWidth;

			if (windowWidth < left + ul.scrollWidth) {
				var diff = windowWidth - (left + ul.scrollWidth);
				ul.style.left = diff+'px';
			}
		},
		_setPosition: function() {
			var ul = this.fld.querySelector('ul');

			var offset = 0;
			var reachedSelected = false;
			if (ul.childElementCount > 0) {
				Array.prototype.slice.call(ul.children).forEach(function(li) {
					if (!reachedSelected) {
						var compStyle = window.getComputedStyle(li);
						var liHeight = compStyle.height.replace('px', '');
						offset += liHeight * 1;
					}

					reachedSelected = (li.className === 'nl-dd-checked') ? true : reachedSelected;
				});
			}

			var difference = (this.type === 'input') ? 12 : 9;
			ul.style.marginTop = '-' + (offset - difference) + 'px';
		},
		_setFontSize: function() {
			var computedStyle = window.getComputedStyle(this.toggle);
			var ul = this.fld.querySelector('ul');
			Array.prototype.slice.call(ul.children).forEach(function(el, i) {
				el.style.fontSize = computedStyle.fontSize;
			});
		},
		_getOffset: function(el) {
			var _x = 0;
			var _y = 0;
			while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
				_x += el.offsetLeft - el.scrollLeft;
				_y += el.offsetTop - el.scrollTop;
				el = el.offsetParent;
			}
			return { top: _y, left: _x };
		},

		_getListOptions: function() {
			var selectedOption = null;
			var ihtml = '';
			var self = this;

			Array.prototype.slice.call(this.elOriginal.querySelectorAll('option')).forEach(function(el, i) {
				var cls = '';

				if (el.selected) {
					cls = 'nl-dd-checked';
					self.selectedIdx = el.index;
				}

				ihtml += '<li class="' + cls + '" data-original-index="' + el.index + '">' + el.innerHTML + '</li>';

			});

			return ihtml;
		},

		close : function( opt, idx, flag ) {
			if( !this.open ) {
				return false;
			}
			if (!flag) {
				this.open = false;
				this.form.fldOpen = -1;
				this.fld.className = this.fld.className.replace(/\b nl-field-open\b/,'');
			}

			if( this.type === 'dropdown' ) {
				if( opt ) {
					// remove class nl-dd-checked from previous option
					var selectedopt = this.optionsList.children[ this.optionsList.children.length - 1 ];
					selectedopt.className = '';
					opt.className = 'nl-dd-checked';
					this.toggle.innerHTML = opt.innerHTML;
					// update selected index value
					this.selectedIdx = opt.dataset.originalIndex;
					// update original select element´s value
					this.elOriginal.value = this.elOriginal.children[ this.selectedIdx ].value;
					this.optionsList.innerHTML = this._getListOptions();
					this._initEvents();
					if ("createEvent" in document) {
					    var evt = document.createEvent("HTMLEvents");
					    evt.initEvent("change", false, true);
					    this.elOriginal.dispatchEvent(evt);
					}
					else
					    this.elOriginal.fireEvent("change");
				}
			}
			else if( this.type === 'input' ) {
				this.getinput.blur();
				this.toggle.innerHTML = this.getinput.value.trim() !== '' ? this.getinput.value : this.getinput.getAttribute( 'placeholder' );
				this.elOriginal.value = this.getinput.value;
			}
		}
	};

	// add to global namespace
	window.NLForm = NLForm;
} )( window );