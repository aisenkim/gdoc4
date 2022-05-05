const isAuthenticated = (req, res, next) => {
   if(req.session.isAuth)
   {
       
       next()
   }
    else
   {
        console.log("USESR NOT LOGGEDIN")
       // IF ERROR USE url path and next() to tttController and let controller check if user is authenticated or not
       return res.json({error: true, message: "User not logged in"})
   }
}

module.exports = {isAuthenticated}
