import express from 'express';
import { connect } from './database';
import Marketplaces from './models/marketplaceModel';

connect();

const PORT = 5001;
const server = express();

server.use(express.json());

server.get('/api/marketplaces', async (req, res) => {
  try {
    const marketplaces = await Marketplaces.find({});
    console.log(marketplaces); // should be an Array of objects

    return res.json(marketplaces);
  } catch (e) {
    console.error(e);
    return res.status(500).send(e);
  }
});

server.post('/api/marketplaces', async (req, res) => {
  try {
    // check the request body exists before
    // another way to write this - const body = req.body;
    const { body } = req;

    // check the body properties - 'name', 'description' AND 'owner' fields need to be there.
    console.log(!body.hasOwnProperty('name'));
    if (
      !body.hasOwnProperty('name') ||
      !body.hasOwnProperty('description') ||
      !body.hasOwnProperty('owner')
    ) {
      return res
        .status(400)
        .json({ error: 'Marketplace name, description, owner required' });
    }

    // check if the marketplace already exists
    const marketplaceExists = await Marketplaces.findOne({
      name: body.name,
    });

    if (marketplaceExists != null) {
      return res.status(400).json({ error: 'Marketplace name already in use' });
    }

    // if it does have those properties, use the model to create the marketplace.
    const marketplace = new Marketplaces(body);
    console.log(marketplace);
    // save the marketplace model
    await marketplace.save();
    // return 200 status and success message
    return res.status(201).json({
      success: true,
      data: marketplace,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).send(e);
  }
});

server.put('api/marketplaces/:id', async (req, res) => {
  try {
    const { body } = req;
    const { id } = req.params;

    // check if id field is not undefined
    if (!id) {
      return res
        .status(400)
        .json({ error: 'Marketplace is parameter required' });
    }

    // check the body properties - 'name', 'description' AND 'owner' fields need to be there.
    if (
      !body.hasOwnProperty('name') ||
      !body.hasOwnProperty('description') ||
      !body.hasOwnProperty('owner')
    ) {
      return res
        .status(400)
        .json({ error: 'Marketplace name, description, owner required' });
    }

    const marketplace = await Marketplaces.findByIdAndUpdate(id, body, {
      new: true,
    }).lean();
    delete marketplace.__v;
    console.log(marketplace);

    return res.status(200).json({ success: true, data: marketplace });

    return res.end();
  } catch (e) {
    console.error(e);

    if (e.kind == 'ObjectId' && e.path == '_id') {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }

    return res.status(500).send(e);
  }
});

server.use('*', (req, res) => {
  return res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
