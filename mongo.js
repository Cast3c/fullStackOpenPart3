const mongoose = require('mongoose')

const password = process.argv[2]

const url = 
`mongodb+srv://cast3c:${password}@cast3ctrymongodb.8br0oup.mongodb.net/phoneBook?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
},{collection: 'persons'}) 

const Person = mongoose.model('Person', personSchema)

const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
})

if(process.argv.length<3){
    console.log('give password, name and number as argument')
    process.exit(1)
}else if(process.argv.length === 3){ 
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person);
            mongoose.connection.close()
        });
    })
}else if(process.argv.length === 5){
    person.save().then(result => {
        console.log(process.argv[3], 'number', process.argv[4], 'added to phonebook')
        mongoose.connection.close()
    })
}




