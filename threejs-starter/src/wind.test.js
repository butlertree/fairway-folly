import test from 'node:test';
import assert from 'node:assert/strict';
import {courseWind,scenicWindAt,windAcceleration,windAt} from './wind.js';

test('Calm has a changing scenic breeze and zero shot drift',()=>{
  for(let hole=1;hole<=9;hole++){
    const calm=courseWind(hole,'calm');
    assert.ok(scenicWindAt(calm,0).mph>0);
    assert.notDeepEqual(scenicWindAt(calm,0),scenicWindAt(calm,2));
    assert.deepEqual(windAcceleration(calm,2),{x:0,z:0});
    for(const condition of ['windy','stormy']){
      const wind=courseWind(hole,condition);
      assert.deepEqual(scenicWindAt(wind,2),windAt(wind,2));
    }
  }
});
