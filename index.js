require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let bodyParser = require('body-parser')
const urlParser = require('url');
const dns = require('dns');
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urls = {}; 
let counter = 1;

app.post('/api/shorturl', (req, res) => {
  const inputUrl = req.body.url;
  console.log(inputUrl)

  
  let hostname;
  try {
    // Use WHATWG URL API
    const urlObj = new URL(inputUrl);

    // Only allow http or https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    hostname = urlObj.hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err, address) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const shortUrl = counter++;
    urls[shortUrl] = inputUrl;

    res.json({
      original_url: inputUrl,
      short_url: shortUrl
    });
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = req.params.short_url;
  const original_url = urls[short_url];

  if (original_url) {
    res.redirect(original_url);
  } else {
    res.status(404).json({ error: 'No short URL found for the given input' });
  }
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
