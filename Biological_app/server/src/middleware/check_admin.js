module.exports = function (req, res, next) {
    const { is_admin } = res.locals;
    if (is_admin) {
        next();
        return true;
    } else {
        res.json({
            "status": "error",
            "code": "403",
            "message": "You are not admin"
        })
    }
    return false;
}