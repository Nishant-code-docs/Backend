const asyncHandler= (requestHandler)=>{

       return (req,res,next)=>{
            Promise.resolve(requestHandler(req,res,next)).catch((err)=>{
                next(err)
                console.log("Error in async handler:",err);
            })
         };
};


export default asyncHandler;