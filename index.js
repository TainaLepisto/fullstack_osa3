const express=require('express')
const bodyParser=require('body-parser')
const morgan=require('morgan')
const cors=require('cors')

const Person=require('./models/person')

const app=express()

app.use(express.static('build'))

app.use(cors())
app.use(bodyParser.json())

//app.use(morgan('tiny'))
morgan.token('reqdata',function(req,res){return JSON.stringify(req.body)})
app.use(morgan(':method :url :reqdata :status :res[content-length] - :response-time ms'))


app.get('/api',(req,res)=>{
  console.log("testi")
  res.send('<h1>HelloWorld!</h1>')
})

app.get('/info',(req,res)=>{
  let paiva=new Date()
  Person 
    .find({})
    .then(people => {
      res.send(`<p>Puhelinluettelossa tällä hetkellä ${people.length} henkilön tiedot.</p><p>${paiva}</p>`)
    })
    .catch(error => {
      console.log(error)
      res.status(404).end()
    })
})

app.get('/api/people',(req,res)=>{
  Person 
    .find({})
    .then(people => {
      res.json(people.map(Person.format))
    })
    .catch(error => {
      console.log(error)
      res.status(404).end()
    })
})

app.get('/api/people/:id',(req,res)=>{
  Person
    .findById(req.params.id)
    .then(person => {
      if(person){
        res.json(Person.format(person))
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformatted id' })
    })
})

app.post('/api/people',(req,res)=>{
  const personToBeAdded=req.body

  if(personToBeAdded.name === undefined || personToBeAdded.name === ''){
    return res.status(400).json({error:'name missing'})
  }
  if(personToBeAdded.number === undefined || personToBeAdded.number === ''){
    return res.status(400).json({error:'number missing'})
  }

  Person 
    .find({name: {'$regex': personToBeAdded.name,$options:'i'}})
    .then(personFound => {
      console.log(personFound)
      if(personFound.length > 0){
        res.status(400).json({error:'name already exists'})
      } else {
        const personNew=new Person({
          name:personToBeAdded.name,
          number:personToBeAdded.number,
        })
        personNew
          .save()
          .then(savedPerson => {
            res.json(Person.format(savedPerson))
          })
      }
    })
    .catch(error => {
      console.log(error)
      res.status(404).end()
    })
})


app.put('/api/people/:id', (req, res) => {
  const person = req.body

  const updatePerson = {
    number: person.number  
  }

  Person
    .findByIdAndUpdate(req.params.id, updatePerson, { new: true } )
    .then(updatedPerson => {
      res.json(Person.format(updatedPerson))
    })
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformatted id' })
    })
})

app.delete('/api/people/:id',(req,res)=>{
  Person
    .findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => {
      res.status(400).send({ error: 'malformatted id' })
    })
})


const PORT=process.env.PORT || 3001
  app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})


