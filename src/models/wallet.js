const mongoose = require ('mongoose');
 
const WalletSchema = new mongoose.Schema({
    balance : {
        type : String,
        required : true,
        default : 0
    },
    currency : {
        type : String,
        required : true,
        default : 'NGN'
    },
    totalWithdawal : {
        type : Number,
        required : true,
        default : 0
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // unique : true
    },
},
{ timestamps : true}
)

module.exports = mongoose.model ( 'Wallet', WalletSchema)