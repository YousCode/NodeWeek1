const express = require('express');

const app = express();

module.exports = app;

app.use((req, res, next) =>
{
    console.log('Request received!');
    next();
});

app.use((req, res, next) =>
{
    res.json({ message: 'Your request was successful!' });
    next();
});

app.use((req, res, next) =>
{
    res.status(201);
});

module.exports = app;