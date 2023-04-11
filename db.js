const { mongoose } = require("mongoose");
mongoose.set('strictQuery', true);

const mongoURI=process.env.MONGO_URI;

async function connectToMongo(){
    
    try{
        let x= await mongoose.connect(mongoURI);
        console.log("Connected to Database: "+x.connections[0].name);
        return true;
    }
    catch(e){

        // console.log(e);
        return false;
    }   
}

module.exports=connectToMongo;