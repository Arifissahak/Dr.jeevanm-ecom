const {default: mongoose} = require("mongoose")

const dbConnect = () => {
    try{
        const conn = mongoose.connect(process.env.MONGODB_URL);
        console.log("DataBase connected succesfully");
    }
    catch(error){
        console.log("Data base error");
        console.log(error);
    }
};

module.exports = dbConnect;