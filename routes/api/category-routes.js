const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

router.get("/", async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  // Above, we add async while defining the function

  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
    });
    // Above we retrieve all the data from the Category model and include its associated producs.
    if (!categoryData) {
      res.status(404).json({ message: "No data found!" });
      return;
    }
    // Above is a errorhandler if no category data is found
    res.status(200).json(categoryData);
    //Above, is our response if data is found. The client will recieve a array full of objects containing the data in the category and product table combined.
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    // Above, we find a single category and its associated products with findByPk and include.
    if (!categoryData) {
      res.status(404).json({ message: "No driver found with that id!" });
      return;
    }
    // Above, is our error function if no data is found.
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  // create a new category

  try {
    if (!req.body.category_name) {
      return res
        .status(400)
        .json({ message: "No category_name in the body of request." });
    }
    // Above, we check if the body of the request contains category_name
    const newCategoryData = await Category.create(req.body);
    res.status(200).json(newCategoryData);
    // Above, we call the create method and pass the req.body in it to create a new category.
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/:id", async (req, res) => {
  // update a category by its `id` value
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ message: "No data to update for request." });
    }
    // Above, we check if the request body is empty or not
    const updatedCategories = await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // Above, we use the update method and pass in the req.body.
    // The where tells where we want this update to take place.

    if (updatedCategories[0] === 0) {
      return res
        .status(404)
        .json({ message: " No changes made due to category not being found." });
    }
    // Above, is our handler to check if anything was updated .

    res.status(200).json({ message: "Category updated successfully." });
    // the update method returns a array with the first index being how many items were updated
    //because of this we send back a message to the client that a updated was successfull.
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  // delete a category by its `id` value

  try {
    const deleteCategories = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    // Above, we call the destroy method and us the id for the where statment.
    if (deleteCategories === 0) {
      return res
        .status(404)
        .json({ message: " No changes made due to category not being found." });
    }
    // Above we check if anything was deleted at all.

    res.status(200).json({ message: "Category deleted successfully." });
    // Above, we send a messege again letting the user know that the delete was successfull.
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
