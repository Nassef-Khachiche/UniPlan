exports.get_dashboard = async (req, res) => {
    if (!req.session.isAuthenticated) {
        res.render('auth/login');
    }
    else {
        res.render('dashboard', {req: req});
    }
}