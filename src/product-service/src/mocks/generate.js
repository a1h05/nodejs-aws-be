// const json = require('./productList.json')

/*json.forEach(entry => {
  // console.log(
  //   `('${entry.id}', '${entry.title}', '${entry.description}', ${entry.price}),`
  // )
  console.log(`('${entry.id}', ${entry.count}),`)
})*/

JSON.stringify({
  count: 10,
  description: 'Some description',
  price: 5,
  title: 'New book',
})

JSON.stringify({
  count: -5,
  description: '',
  price: -5,
})
