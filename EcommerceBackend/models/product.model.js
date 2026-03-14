const mng = require("mongoose");
const slugify = require("slugify");
const Cart = require("./cart.model");

// Schema
const productSchema = new mng.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true, index: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, index: true },
    stock: { type: Number, default: 0 },
    image: { type: String, required: true },
    category: {
      type: mng.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subCategory: {
      type: mng.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Text index for searching
productSchema.index({ title: "text", description: "text" });
// Index for createdAt (default sort by newest)
productSchema.index({ createdAt: -1 });

// Make the slug name when creating or updating product
productSchema.pre("save", async function (next) {
  if (!this.isModified("title")) {
    return next();
  }
  const slug = slugify(this.title, {
    lower: true,
    strict: true,
    trim: true,
  });
  const isExists = await this.constructor.findOne({ slug });
  if (isExists) {
    this.slug = `${slug}-${this._id.toString().slice(-6)}`;
  } else {
    this.slug = slug;
  }
  next();
});
productSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const productId = this.getQuery()._id;
  if (update.title || (update.$set && update.$set.title)) {
    const title = update.title || update.$set.title;
    let slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });
    const isExists = await this.model.findOne({ slug });
    if (isExists) {
      const id = productId?.toString() || Date.now().toString();
      slug = `${slug}-${id.slice(-6)}`;
    }
    if (update.title) {
      update.slug = slug;
    } else {
      update.$set.slug = slug;
    }
  }
  next();
});

// change the isChanged in the cart if price changed
let oldPrice = null;

productSchema.pre("findOneAndUpdate", async function (next) {
  const productId = this.getQuery()._id;
  const product = await this.model.findById(productId).select("price");
  if (product) {
    oldPrice = product.price;
  }
  next();
});

productSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc || oldPrice === null) return;
  if (oldPrice !== doc.price) {
    await Cart.updateMany(
      { "items.product": doc._id },
      {
        $set: { "items.$[elem].isChanged": true },
      },
      {
        arrayFilters: [{ "elem.product": doc._id }],
      }
    );
  }
});

module.exports = mng.model("Product", productSchema);
