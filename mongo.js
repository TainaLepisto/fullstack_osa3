const mongoose = require('mongoose')

if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config()
}

const url = process.env.MONGODB

mongoose.connect(url)

const Person = mongoose.model('Person', {
  name: String,
  number: String
})

//console.log('eka parametri ', process.argv[2])
//console.log('ja toka ', process.argv[3])

if(process.argv[2] && process.argv[3]){
  const person = new Person({
    name: process.argv[2],
    number: process.argv[3]
  })

  person
    .save()
    .then(response => {
      console.log('person saved!', response)
      mongoose.connection.close()
    })
} else {
  Person
    .find({})
    .then(result => {
      console.log('puhelinluettelo: ')
      result.forEach(person => {
        console.log(person.name, ' ', person.number)
      })
      mongoose.connection.close()
    })
}


