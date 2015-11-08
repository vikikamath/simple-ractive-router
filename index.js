/*
AMD Singleton Pattern adopted from:
http://unscriptable.com/2011/09/22/amd-module-patterns-singleton/
*/
define( [ 'require', 'ractive' ], function ( require, Ractive ) {

	'use strict';

	var instance;

	//http://stackoverflow.com/a/2117523- rfc4122 version 4 compliant solution
	var nextUUID = function nextUUID ( ) {

		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {

	        var r = Math.random( )*16|0, v = c == 'x' ? r : ( r&0x3|0x8 );

	        return v.toString( 16 );

	    } );
	};

	var getHash = function ( e ) {

		return e.newURL.split( '#' )[ 1 ];
	}

	var simpleHashChangeEventHandler = function ( e ) {

		this.navigate( getHash( e ), true, e, false );
	}

	var Router = function ( eventName ) {

		// this.eventName = eventName;

	    this._routes = { };

	};

	Router.prototype.defineRoutes = function ( routes ) {

		var self = this;

	    routes.forEach( function( routeObj ) {

	       self.defineRoute( routeObj );

	    } );

	};

	Router.prototype.defineRoute = function ( route ) {

	    var self = this;

	    route.components.forEach( function( Component ) {

	       	var uuid = nextUUID( );

	        var origOnInit = Component.prototype.oninit;

	        Component.prototype.oninit = function( ) {

	            this.on( 'navigate', function( e, preventDefault ){

	                self.navigate(	e.node.hash, preventDefault, e );

	            } );

	            if ( typeof origOnInit === 'function' ) {

	                origOnInit( );

	            }
	        };


	       	// register top level components globally
	       	Ractive.components[ uuid ] = Component;


	       	if ( !self._routes[ route.pattern ] ) {

	          self._routes[ route.pattern ] = new Array( );

	       	}

	        self._routes[ route.pattern ].push( uuid );
	    });
	};

	Router.prototype.navigate = function ( hash, updateAddressbar, e, preventDefault ) {

		if ( hash && this._routes[ hash ] ){

			this._routes[ hash ].forEach( function( uuid ) {

		        new Ractive.components[ uuid ]( );

		    } );

			if ( e && preventDefault ) {

				e.original.preventDefault( );

			}

		}
	};

	Router.prototype.destroy = function ( ) {

		var componentIDPattern = new RegExp( /^([a-fA-F0-9]){8}\-(([a-fA-F0-9]){4}\-){3}([a-fA-F0-9]){12}$/ );

		var count = 0;

		for ( var id in Ractive.components ) {

			if ( Ractive.components.hasOwnProperty( id ) &&  componentIDPattern.test( id ) ) {

				++ count;

				delete Ractive.components[ id ];

			}
		}

		return count;

	};

	Router.prototype.internalState = function ( ) {

		return this._routes;

	};



	return function( ) {

		instance = instance || new Router( );

		window.addEventListener( 'hashchange', simpleHashChangeEventHandler.bind( instance ) );

		return instance;

	};
});
