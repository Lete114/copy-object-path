const { readFileSync } = require('fs')
const { join } = require('path')
const assert = require('assert')
const getObjectPath = require('../src/utils/getObjectPath')

const path = join(__dirname, 'template.txt')
const code = readFileSync(path, { encoding: 'utf-8' })

suite('getObjectPath', () => {
  test('not selected object test', () => {
    assert.strictEqual('', getObjectPath(code, 1))
    assert.strictEqual('', getObjectPath(code, 16))
  })
  test('simple test', () => {
    {
      const res = 'test_obj.a.b.e'
      assert.strictEqual(res, getObjectPath(code, 4))
    }
    {
      const res = 'test_obj.a.bb.cc'
      assert.strictEqual(res, getObjectPath(code, 6, 16))
    }
    {
      const res = 'test_obj.a.bb'
      assert.strictEqual(res, getObjectPath(code, 8,20))
    }
    {
      const res = 'test_obj.a.bb.fun'
      assert.strictEqual(res, getObjectPath(code, 9,10))
    }
  })
  test('function test', () => {
    {
      const res = 'test_fun.age'
      assert.strictEqual(res, getObjectPath(code, 14))
    }
    {
      const res = 'test_fun.name'
      assert.strictEqual(res, getObjectPath(code, 14, 40))
    }
  })
  test('new operator test', () => {
    {
      const res = 'test_proxy.name'
      assert.strictEqual(res, getObjectPath(code, 17))
    }
    {
      const res = 'test_proxy.get'
      assert.strictEqual(res, getObjectPath(code, 21, 7))
    }
  })
})
