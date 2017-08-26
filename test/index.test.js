
import flystore from '../src/index';


const { set, get, clear, getAll } = flystore();

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
});
