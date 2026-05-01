export const getCurrUser = async(req,res) => {
    try {
        if(!req.user){
            return res.status(400).json({message: 'user not logged in!'});
        }
        return res.json(req.user);

    } catch (error) {   
        res.status(500).json({message: `get current user error ${error.message}`})
    }
}
