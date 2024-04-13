function myRoute(ctx, req, res) {
    res.json({"message" : `Value from protected route with context: ${ctx.value}`})
}

module.exports = {
  myRoute
}