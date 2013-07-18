var me = module.exports

me.extend = function(o1, o2) {
  for (var k in o2)
    if (o2.hasOwnProperty(k))
      if (typeof o1[k] == 'undefined')
        o1[k] = o2[k]
  return o2
}