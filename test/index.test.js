
import flystore from '../src/index';


const { set, get, clear, getAll, wait, watch, dispense, remove } = flystore();

test( 'flystore.set & flystore.get', () => {
  const value = 'value';
  set( 'key', value );
  const storedValue = get( 'key' );
  expect( storedValue ).toEqual( value );
  clear();
});

test( 'flystore.getAll', () => {
  const keys = [ 'key-1', 'key-2', 'key-3' ];
  const values = [ 'value-1', 'value-2', 'value-3' ];
  keys.forEach(( key, index ) => {
    set( key, values[index]);
  });
  const all = getAll();
  expect( all.length ).toEqual( keys.length );
  expect( all[0][0]).toEqual( keys[0]);
  expect( all[1][0]).toEqual( keys[1]);
  expect( all[2][0]).toEqual( keys[2]);
  expect( all[0][1]).toEqual( values[0]);
  expect( all[1][1]).toEqual( values[1]);
  expect( all[2][1]).toEqual( values[2]);
  clear();
});

test( 'flystore.clear', () => {
  const keys = [ 'key-1', 'key-2', 'key-3' ];
  const values = [ 'value-1', 'value-2', 'value-3' ];
  keys.forEach(( key, index ) => {
    set( key, values[index]);
  });
  clear();
  expect( getAll().length ).toBe( 0 );
});

test( 'flystore.wait', () => {
  const order = [];
  wait( 'w', ( value ) => {
    expect( value ).toBe( 'w-value' );
    order.push( 'b' );
  });
  order.push( 'a' );
  dispense( 'w', 'w-value' );
  wait( 'w', ( value ) => {
    expect( value ).toBe( 'w-value' );
    order.push( 'c' );
  });
  order.push( 'd' );
  expect( order.join( '' )).toBe( 'abcd' );
  clear();
});

test( 'flystore.watch', () => {
  const order = [];
  watch( 'w', ( value ) => {
    expect( value ).toBe( 'w-value' );
    order.push( 'b' );
  });
  order.push( 'a' );
  dispense( 'w', 'w-value' );
  watch( 'w', () => {
    order.push( 'c' );
  });
  dispense( 'w', 'w-value' );
  order.push( 'd' );
  dispense( 'w', 'w-value' );
  expect( order.join( '' )).toBe( 'abbcdbc' );
  clear();
});

test( 'flystore.dispense', () => {
  dispense( 'w', 'w-value' );
  expect( get( 'w' )).toBe( 'w-value' );
  clear();
});

test( 'flystore.remove', () => {
  set( 'w', 'w-value' );
  expect( get( 'w' )).toBe( 'w-value' );
  remove( 'w' );
  expect( get( 'w' )).toBe( undefined );
  clear();
});

test( 'flystore.clear', () => {
  set( 'w', 'w-value' );
  set( 'w1', 'w1-value' );
  set( 'w2', 'w2-value' );
  expect( getAll().length ).toBe( 3 );
  clear();
  expect( getAll().length ).toBe( 0 );
});
