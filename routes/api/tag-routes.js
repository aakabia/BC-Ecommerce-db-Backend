const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

router.get("/", async (req, res) => {
  // find all tags
  // be sure to include its associated Product data

  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product }],
    });
    // Above we retrieve all the data from the tag model and include its associated producs.
    if (!tagData) {
      res.status(404).json({ message: "No data found!" });
      return;
    }
    // Above is a errorhandler if no tag data is found
    res.status(200).json(tagData);
    //Above, is our response if data is found. The client will recieve a array full of objects containing the data in the tag and product table combined.
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data

  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    // Above, we find a single tag and its associated products with findByPk and include.
    if (!tagData) {
      res.status(404).json({ message: "No tag found with that id!" });
      return;
    }
    // Above, is our error function if no data is found.
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  // create a new tag

  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("No data in the body of request.");
      return res
        .status(400)
        .json({ message: "No data in the body of request." });
    }
    // Above, we check if anything is in the response body and give a message if there is nothing.
    const newtagData = await Tag.create(req.body);
    let newProductTags = [];

    // Above, we create a new tag and initialize a new product tags array.

    if (req.body.productIds) {
      const tagProductIdArr = req.body.productIds.map((product_id) => {
        return {
          tag_id: newtagData.id,
          product_id,
        };
      });
      // Above, if productTagIds exists we wnt to iterate ofver that array and use the map method to return a array of objects containing the tag id and product id
      newProductTags = await ProductTag.bulkCreate(tagProductIdArr);

      // Above, we create the insertions needed by calling the bulk create method on the new product tags.
    }

    res.status(200).json({
      tag: newtagData,
      productTags: newProductTags,
    });

    // Above, is our the repsonse that consists of the new tag created and all the new entries into the product tag table for that tag.
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/:id", async (req, res) => {
  // update a tag's name by its `id` value

  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("No data in the body of request.");
      return res
        .status(400)
        .json({ message: "No data in the body of request." });
    }
    // Above, we check if anything is in the response body and give a message if there is nothing.
    const updatedTag = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    // Above, call update on the req.param.id and pas in the req.body. This gives us a updated tag
    let newProductIds = [];
    let productIdsToRemove = [];

    // ABove I set two empty arrays one for new added product ids and the other for ids I need to delete.

    if (req.body.productIds) {
      const tagIDs = await ProductTag.findAll({
        where: { tag_id: req.params.id },
      });

      // Above, we set a condtion if the request has new product id's
      // First we find all items in the product tag table that have the same tag_id as in the request params 



      let productIds = tagIDs.map(({ product_id }) => product_id);

      // Above, we map through each item in that array and extract the product_id from each row.
      // Here, we used object deconstructuring. 

      newProductIds = req.body.productIds
        .filter((product_id) => !productIds.includes(product_id))
        .map((product_id) => {
          return {
            tag_id: parseInt(req.params.id),
            product_id: product_id,
          };
        });
        // Above, we have to find the new ids to create 
        // We do this by filtering the req body against items from productIds
        // For every item that is not present in both arrays, we filter it out then use map to create a new opject consisting of inputs for the ProductTag table.



      productIdsToRemove = tagIDs
        .filter((data) => !req.body.productIds.includes(data.product_id))
        .map((data) => data.id);

        // Above,, we figure out which current product Ids should we move.
        // We do this by filtering the tagids array this time 
        // As you noticed we didnt use object deconstructuring this time. NOTE: you can fetch the data either way!
        // Last, we use map to return us a array of only the associated Id of each row/ object.

      await Promise.all([
        ProductTag.destroy({ where: { id: productIdsToRemove } }),
        ProductTag.bulkCreate(newProductIds),
      ]);

      // Above, we use await.Promise.all to run mutliple async fucntions at the same time like updates and deletes.
    }

    res.status(200).json({
      updatedTag: updatedTag,
      newProductIds: newProductIds,
      productIdsToRemove: productIdsToRemove,
    });

    // Above, is our response which contains the updatedTag, newproduct tags created and producttags removed.
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  // delete on tag by its `id` value

  try {
    const deletetags = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    // Above, we call the destroy method and us the id for the where statment.
    if (deletetags === 0) {
      return res
        .status(404)
        .json({ message: " No changes made due to Tag not being found." });
    }
    // Above we check if anything was deleted at all.

    res.status(200).json({ message: "Tag deleted successfully." });
    // Above, we send a messege again letting the user know that the delete was successfull.
  } catch (err) {
    res.status(400).json(err);
  }













});

module.exports = router;
