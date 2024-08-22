
import express from 'express';
import { json } from 'body-parser';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import fs from 'fs/promises';
import path from 'path';
import licenseServer from './license-server.js';

const app = express();
const port = process.env.PORT || 5000;
const stripeSecretKey = process.env.STRIPE_KEY;
const stripe = new Stripe(stripeSecretKey);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  tier: String,
  stripeCustomerId: String
});

const User = mongoose.model('User', UserSchema);

app.use(json());
app.use('/license', licenseServer);

app.get('/', async (req, res) => {
  const landingPage = await fs.readFile(path.join(process.cwd(), 'landing.html'), 'utf-8');
  res.send(landingPage);
});

app.post('/register', async (req, res) => {
  const { username, email, tier } = req.body;

  const user = new User({ username, email, tier });
  await user.save();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tier} Tier Subscription`,
          },
          unit_amount: tier === 'Premium' ? 1000 : 0,
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${req.protocol}://${req.get('host')}/success`,
    cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
    client_reference_id: user.id,
  });

  res.json({ sessionId: session.id });
});

app.get('/success', (req, res) => {
  res.send('Payment successful! You are now registered.');
});

app.get('/cancel', (req, res) => {
  res.send('Payment cancelled. Please try again.');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
