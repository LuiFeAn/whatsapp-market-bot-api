const multer = require('multer');
const path = require("path");

function Multer(tory){
    
    const storage = multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,path.join("./src/"+tory));
        },
        filename:(req,file,cb)=>{
            cb(null,file.originalname)
        }
    });

    const upload = multer({
        storage:storage
    });

    return upload
    
}
module.exports = Multer;