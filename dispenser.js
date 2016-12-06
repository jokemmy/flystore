

import EventEmitter from 'events';


/**
 * 公共变量而已，不是很深奥，但是很实用
 */

const

  store = new Map(),

  // 分发器
  emitter = new EventEmitter(),

  // 存
  set = ( key, val ) => store.set( key, val ),

  // 取
  get = key => store.get( key ),

  // 全部
  getAll = () => [ ...store ],


  /**
   * 等待一个现在没有将来可能会有的值
   * 如果store中已经存在这个值则直接返回
   * @param  {String}   key
   * @param  {Function} func   取到值后回调
   * @param  {Boolean}  always 默认false, 默认只响应一次，true的话每次别处分发都会响应
   * @return {{String, Function}} { key, clear }
   * key同上 clear是停止接受分发，主要用于always=true的情况
   */
  wait = ( key, func, always = false ) => {

    const value = get( key );

    function clear () {
      if ( value === undefined ) {
        emitter.removeListener( key, handle );
      }
    }

    function handle () {
      func( get( key ), clear );
    }

    if ( value !== undefined ) {
      func( value, clear );
    }
    else {
      emitter[ always ? 'on' : 'once' ]( key, handle );
    }

    return { key, clear };

  },

  /**
   * 分发
   * @param  {String} key
   * @param  {any} value 指定要分发的值，不填则取store中的值
   */
  dispense = ( ...args ) => {
    const [ key, value ] = args;
    if ( args.length === 0 ) {}
    else if ( args.length === 1 || get( key ) === value ) {
      emitter.emit( key );
    }
    else if ( get( key ) !== value ) {
      set( key, value );
      emitter.emit( key );
    }
  };

  // 设置最大等待的个数
  emitter.setMaxListeners( 1000 );

export default {
  set,
  get,
  getAll,
  wait,
  dispense
};

