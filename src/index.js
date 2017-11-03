
import EventEmitter from 'events';
import invariant from 'invariant';
import is from 'whatitis';


function composeHash( func1, func2 ) {
  return function( hash, ...args ) {
    return func1( func2( hash ), ...args );
  };
}

function compose( func1, func2 ) {
  return function( ...args ) {
    return func1( func2( ...args ));
  };
}

const cache = {};

// create event handler
const emitter = new EventEmitter();
emitter.setMaxListeners( 2048 );

const uniqueID = Symbol( 'FlyStore' );

function getOptions( options ) {
  if ( is.String( options )) {
    return {
      namespace: options
    };
  }
  return options;
}

function FlyStore({ namespace, initialState }) {

  const flystore = {};

  if ( is.String( namespace ) && namespace ) {
    cache[namespace] = flystore;
  }

  function keyCheck( key ) {
    invariant(
      is.String( key ) && key,
      'FlyStore: Expecting key is a non-empty string'
    );
    return key;
  }

  function getNameSpace( hash ) {
    const [ ns, key ] = keyCheck( hash ).split( '.' );
    return key ? ns : '';
  }

  function getKey( hash ) {
    const [ ns, key ] = hash.split( '.' );
    return key || ns;
  }

  function getHash( key ) {
    const ns = getNameSpace( key );
    return ns ? key : namespace ? `${namespace}.${key}` : key;
  }

  function getStore( hash ) {
    const ns = getNameSpace( hash );
    return ns ? cache[ns] : flystore;
  }

  function getCollection( hash ) {
    return hash ? getStore( hash )[uniqueID] : flystore[uniqueID];
  }

  function newCollection( initialState ) {
    if ( is.PlainObject( initialState )) {
      flystore[uniqueID] = new Map( Object.entries( initialState ));
    } else {
      flystore[uniqueID] = new Map();
    }
  }

  function set( hash, value ) {
    getCollection( hash ).set( getKey( hash ), value );
  }

  function get( hash ) {
    return getCollection( hash ).get( getKey( hash ));
  }

  function getAll() {
    return [...getCollection()];
  }

  function wait( hash, callback, always ) {

    keyCheck( hash );

    invariant(
      is.Function( callback ),
      'FlyStore: Expecting callback is a function'
    );

    const value = get( hash );

    function clear() {
      emitter.removeListener( hash, handle ); // eslint-disable-line
    }

    function handle( arg ) {
      if ( arg ) {
        callback( arg );
      } else {
        callback( get( hash ), clear );
      }
    }

    if ( always ) {
      emitter.on( hash, handle );
    } else if ( value !== undefined ) {
      callback( value, clear );
    } else {
      emitter.once( hash, handle );
    }

    return { hash, clear };
  }

  function watch( hash, callback ) {
    return wait( hash, callback, true );
  }

  function dispense( hash, value ) {
    if ( keyCheck( hash )) {
      if ( value !== undefined ) {
        set( hash, value );
      }
      emitter.emit( hash );
    }
  }

  function dispatch( action ) {
    if ( keyCheck( action.type )) {
      emitter.emit( getHash( action.type ), action );
    }
  }

  function clear() {
    newCollection();
    emitter.removeAllListeners();
  }

  function remove( hash ) {
    return getCollection( keyCheck( hash )).delete( getKey( hash ));
  }

  // init
  newCollection( initialState );

  return Object.assign( flystore, {
    set,
    get,
    getAll,
    wait: composeHash( wait, getHash ),
    watch: composeHash( watch, getHash ),
    dispense: composeHash( dispense, getHash ),
    dispatch,
    remove: composeHash( remove, getHash ),
    clear
  });
}

export default compose( FlyStore, getOptions );
