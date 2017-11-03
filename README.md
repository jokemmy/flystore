# FlyStore

### options

* namespace 命令空间

```js
  import fs from 'flystore';

  const storeUp = fs( 'up' );
  const storeDown = fs( 'down' );


  storeUp.watch( 'down.goup', ( value ) => {
    console.log( value ); // no
  });

  storeDown.dispense( 'goup', 'no' );
```
