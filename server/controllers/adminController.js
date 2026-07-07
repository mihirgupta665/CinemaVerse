
// Controller function to check if user is Admin
export const isAdmin = async (req, res) => {
    res.json({success:true, isAdmin: true})
}
