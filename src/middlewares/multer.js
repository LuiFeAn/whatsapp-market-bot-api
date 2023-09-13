const multer = require('multer');
const path = require("path");

function Multer(tory){
    
    const storage = multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,path.resolve(__dirname,`../images/${tory}`));
        },
        filename:(req,file,cb)=>{
            console.log(file)
            cb(null,file.originalname)
        }
    });

    const upload = multer({
        storage:storage
    });

    return upload
    
}
module.exports = Multer;