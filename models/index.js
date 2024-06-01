// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category



Product.belongsTo(Category, {
  foreignKey: 'category_id',
});


// Categories have many Products

Category.hasMany(Product, {
  foreignKey: 'category_id',
  onDelete: 'CASCADE',
});

// Above, is a one to many realationship between category and product.


// Products belongToMany Tags (through ProductTag)




Product.belongsToMany(Tag, {
  through: ProductTag,
  foreignKey: 'product_id',
  onDelete: 'CASCADE'
});




// Above is a many to many realationship for product .







// Tags belongToMany Products (through ProductTag)




Tag.belongsToMany(Product, {
  through: ProductTag,
  foreignKey: 'tag_id',
  onDelete: 'CASCADE'
});




// Above is a many to many realationship for tags .

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
