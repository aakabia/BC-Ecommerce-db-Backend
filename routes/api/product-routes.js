const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
router.get("/", async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    // Above we retrieve all the data from the Product model and include its associated categories and tags.
    if (!productData) {
      res.status(404).json({ message: "No data found!" });
      return;
    }
    // Above is a errorhandler if no product data is found
    res.status(200).json(productData);
    //Above, is our response if data is found. The client will recieve a array full of objects.
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get("/:id", async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data

  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });
    // Above, we find a single product and its associated products with findByPk and include.
    if (!productData) {
      res.status(404).json({ message: "No data found with that id!" });
      return;
    }
    // Above, is our error function if no data is found.
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post("/", (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put("/:id", (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        ProductTag.findAll({
          where: { product_id: req.params.id },
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }
      // filtering through product tags and tag id!!!!

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete("/:id", async (req, res) => {
  // delete one product by its `id` value

  try {
    const deleteProducts = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    // Above, we call the destroy method and us the id for the where statment.
    if (deleteProducts === 0) {
      return res
        .status(404)
        .json({ message: " No changes made due to product not being found." });
    }
    // Above we check if anything was deleted at all.

    res.status(200).json({ message: "Product deleted successfully." });
    // Above, we send a messege again letting the user know that the delete was successfull.
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
