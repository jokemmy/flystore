
import EventEmitter from 'events';
import invariant from 'invariant';
import is from 'whatitis';


/**
 * cache some values those use globally or will appear in future
 */

function FlyStore() {

  const uniqueID = Symbol( 'FlyStore' );

  // create event handler
  const emitter = new EventEmitter();
  emitter.setMaxListeners( 1024 );

  const flystore = {
    [uniqueID]: new Map()
  };

  function getCollection() {
    return flystore[uniqueID];
  }

  function setCollection( newCollection = new Map()) {
    flystore[uniqueID] = newCollection;
  }

  function set( key, value ) {
    getCollection().set( key, value );
  }

  function get( key ) {
    return getCollection().get( key );
  }

  function getAll() {
    return [...getCollection()];
  }

  function wait( key, callback, always ) {

    invariant(
      is.Defined( key ),
      'FlyStore: Expecting key is a non-empty string'
    );

    invariant(
      is.Function( callback ),
      'FlyStore: Expecting callback is a function'
    );

    const value = get( key );

    function clear() {
      emitter.removeListener( key, handle ); // eslint-disable-line
    }

    function handle() {
      callback( get( key ), clear );
    }

    if ( always ) {
      emitter.on( key, handle );
    } else if ( value !== undefined ) {
      callback( value, clear );
    } else {
      emitter.once( key, handle );
    }

    return { key, clear };
  }

  function watch( key, callback ) {
    return wait( key, callback, true );
  }

  function dispense( key, value ) {
    if ( key ) {
      if ( value !== undefined ) {
        set( key, value );
      }
      emitter.emit( key );
    }
  }

  function clear() {
    setCollection();
  }

  function remove( key ) {
    return getCollection().delete( key );
  }

  // const subscribe = watch;
  // const publish = watch;

  return Object.assign( flystore, {
    set,
    get,
    getAll,
    wait,
    watch,
    dispense,
    remove,
    clear
    // subscribe,
    // publish,
  });
}

export default FlyStore;
