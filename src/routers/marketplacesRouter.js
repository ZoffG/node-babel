import { Router } from 'express';
import Marketplaces from '../models/marketplaceModel';
const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const marketplaces = await Marketplaces.find({});
    console.log(marketplaces); // should be an Array of objects

    return res.json(marketplaces);
  } catch (e) {
    next(e);
    // return res.status(500).send(e);
  }
});

router.post('/', async (req, res, next) => {
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
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
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
  } catch (e) {
    if (e.kind == 'ObjectId' && e.path == '_id') {
      return res.status(400).json({ error: 'Invalid id parameter' });
    }

    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await Marketplaces.findByIdAndDelete(id);

    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
