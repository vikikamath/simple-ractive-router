define( function( require ) {

	var router = require( './../index' )( );

	var Ractive = require( 'ractive' );

	var expect = require( 'chai' ).expect;

	describe ( 'Ractive router', function ( ) {


		it ( 'should be an object', function ( ) {

			expect( router ).to.be.a( 'object' );

		} );


		describe( 'Destroy', function ( ) {

			var routerState;

			var registeredComponents;

			var deletedComponentCount;

			var componentIDPattern = new RegExp( /^([a-fA-F0-9]){8}\-(([a-fA-F0-9]){4}\-){3}([a-fA-F0-9]){12}$/ );

			var getRegisteredComponentIDs = function () {

					return Object.keys( Ractive.components ).filter( function ( id ) {

						return componentIDPattern.test( id );

					} );

			};


			before( function () {

				registeredComponents = getRegisteredComponentIDs( );

				routerState = router.internalState( );

				deletedComponentCount = router.destroy( );

			} );


			it(	'should clear all routes', function ( ) {

				expect( Object.keys( router.internalState ).length === 0 ).to.be.true;

			} );


			it(	'should destroy all components registered by itself', function ( ) {


				expect( deletedComponentCount === registeredComponents.length ).to.be.true;

				registeredComponents.forEach( function ( compID ) {

					expect( Ractive.components[ compID ] ).to.be.undefined;

				} );


			} );


		} );


		describe( 'Navigation', function ( ) {

			var message = 'blah Here...';

			var route = '#/blah';

			before( function( ) {

				router.defineRoute( {

					pattern: route,

					components: [ Ractive.extend( {

						el: '#main',

						template: '<div id="blah">{{message}}</div>',

						append: true,

						data: {

							'message' 	: message

						}

					} ) ]

				} );

				router.navigate( route );

			} );

			it ( 'should load single component when navigated to a define route', function ( ) {

				expect ( document.querySelector( "div#blah" ).textContent ).to.equal( message );

			} );

			describe( 'Updating URL hash in address bar', function ( ) {

				it(	'should NOT update URL hash in addressbar if not asked', function ( ) {

					expect( location.hash.indexOf( route ) ).to.equal( -1 );

				} );

				xit( 'should update URL hash in addressbar if asked', function ( ) {

					router.navigate( route, true );

					expect( location.hash.indexOf( route ) ).to.not.equal( -1 );


				} );

			} );


		} );


		describe( 'Define Route', function ( ) {

			var message = 'alternate here';

			var route = 'alternate';



			before( function( ) {

				router.defineRoute( {

					pattern: route,

					components: [ Ractive.extend( {

						el: '#main',

						template: '<div id="alternate">{{message}}</div>',

						append: true,

						data: {

							'message' 	: message

						}

					} ) ]

				} );

				location.hash = '';

			} );


			it( 'should navigate on location.hash change for a registered route', function (done ) {

				location.hash = route;

				setTimeout( function( ) {

					expect( location.hash.indexOf( route ) ).to.not.equal( -1 );

					expect( document.querySelector( "div#alternate" ).textContent ).to.equal( message );

					done( );

				}, 0);

			} );

			describe( 'Single File Components', function ( ) {

				var SingleFile = require( 'rvc!components/singlefile' );

				before( function( ) {

					router.defineRoute( {

						pattern: '#/singlefile',

						components: [ SingleFile ]

					} );

				} );

				it( 'should apply to Single File Components', function ( ) {

					router.navigate( '#/singlefile' );

					expect( document.querySelector( "div#singlefile" ).textContent ).to.equal( "Single File Component Here..." );

				} );

			} );


			describe( 'Multiple Components', function ( ) {

				describe( 'Nested Components', function ( ) {

					var Parent = require( 'rvc!components/parent' );


					before( function( ) {

						router.defineRoute( {

							pattern: '#/nested',

							components: [ Parent ]

						} );

					} );

					it( 'should render all nested components', function ( ) {

						router.navigate( '#/nested' );

						expect( document.querySelector( "div#parent" ).textContent ).to.equal( "Parent Here Child Here" );

						expect( document.querySelector( "div#child" ).textContent ).to.equal( "Child Here" );

					} );

				} );

				describe( 'Peer Components', function ( ) {

					var Footer = require( 'rvc!components/footer' );

					var Header = require( 'rvc!components/header' );

					before( function( ) {

						router.defineRoute( {

							pattern: '#/peers',

							components: [

								Header,

								Footer

							]

						} );

					} );

					it( 'should render all peer components', function ( ) {

						router.navigate( '#/peers' );

						expect( document.querySelector( "footer" ) ).to.be.defined;

					} );

				} );

				describe( 'Uninitialized Components', function ( ) {


				} );

			} );



		} );

	} );

} );
