const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Utility to read JSON file
function readData(collectionName) {
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading mock db file for ${collectionName}:`, err);
    return [];
  }
}

// Utility to write JSON file
function writeData(collectionName, data) {
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing mock db file for ${collectionName}:`, err);
  }
}

// Helper to resolve nested object path values (including inside arrays)
function getValuesAtPath(obj, pathStr) {
  const parts = pathStr.split('.');
  let current = [obj];
  
  for (let part of parts) {
    let next = [];
    for (let item of current) {
      if (item && Array.isArray(item)) {
        for (let sub of item) {
          if (sub && sub[part] !== undefined) {
            next.push(sub[part]);
          }
        }
      } else if (item && item[part] !== undefined) {
        next.push(item[part]);
      }
    }
    current = next;
  }
  return current;
}

// Query matching logic
function matchQuery(item, query) {
  if (!query || Object.keys(query).length === 0) return true;

  for (let key in query) {
    const val = query[key];

    if (key === '$or') {
      if (!Array.isArray(val) || !val.some(subQuery => matchQuery(item, subQuery))) {
        return false;
      }
      continue;
    }

    // Resolve nested paths (e.g. 'products.product')
    const itemValues = getValuesAtPath(item, key);
    
    // If the path didn't return any values
    if (itemValues.length === 0) {
      if (val === undefined || val === null) continue;
      return false;
    }

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // Check query operators ($gte, $lte, $in, $regex)
      let matchedOp = false;
      for (let op in val) {
        const opVal = val[op];
        
        if (op === '$gte') {
          if (!itemValues.some(v => Number(v) >= Number(opVal))) return false;
          matchedOp = true;
        } else if (op === '$lte') {
          if (!itemValues.some(v => Number(v) <= Number(opVal))) return false;
          matchedOp = true;
        } else if (op === '$in') {
          const checkArr = Array.isArray(opVal) ? opVal : [opVal];
          if (!itemValues.some(v => checkArr.some(cv => String(cv) === String(v)))) return false;
          matchedOp = true;
        } else if (op === '$regex') {
          const regex = new RegExp(opVal, val.$options || 'i');
          if (!itemValues.some(v => regex.test(String(v)))) return false;
          matchedOp = true;
        }
      }
      if (matchedOp) continue;
    }

    // Direct comparison
    if (!itemValues.some(v => String(v) === String(val))) {
      return false;
    }
  }

  return true;
}

// Mock Query Class to support mongoose-like chaining (.populate, .sort, .limit, await)
class MockQuery {
  constructor(collectionName, data) {
    this.collectionName = collectionName;
    this.data = Array.isArray(data) ? data : [data];
  }

  populate(options) {
    let populatePath = '';
    let selectFields = [];

    if (typeof options === 'string') {
      populatePath = options;
    } else if (options && typeof options === 'object') {
      populatePath = options.path;
      if (options.select) {
        selectFields = options.select.split(' ');
      }
    }

    if (!populatePath) return this;

    // Convert Mongoose documents to plain objects first to bypass strict schema checks during mock population!
    this.data = this.data.map(item => {
      return typeof item.toObject === 'function' ? item.toObject({ getters: true, virtuals: false }) : { ...item };
    });

    // Determine target collection for population
    let targetCollection = '';
    if (populatePath === 'user' || populatePath === 'customer') {
      targetCollection = 'users';
    } else if (populatePath === 'artisan') {
      targetCollection = 'users'; // artisan points to User model
    } else if (populatePath === 'product') {
      targetCollection = 'products';
    } else if (populatePath === 'products.product') {
      targetCollection = 'products';
    }

    if (!targetCollection) return this;
    const refData = readData(targetCollection);

    this.data = this.data.map(item => {
      const newItem = { ...item };
      
      // Case 1: Simple reference (e.g. item.user = 'id_123')
      if (populatePath.indexOf('.') === -1) {
        const refId = newItem[populatePath];
        if (refId) {
          const match = refData.find(r => String(r._id) === String(refId));
          if (match) {
            // Clone and scrub password
            const populatedObj = { ...match };
            delete populatedObj.password;
            
            if (selectFields.length > 0) {
              const scrubbed = {};
              selectFields.forEach(f => {
                if (f) scrubbed[f] = populatedObj[f];
              });
              scrubbed._id = populatedObj._id; // always keep ID
              newItem[populatePath] = scrubbed;
            } else {
              newItem[populatePath] = populatedObj;
            }
          }
        }
      } 
      // Case 2: Nested reference inside array (e.g. item.products = [ { product: 'id_123', quantity: 2 } ])
      else {
        const parts = populatePath.split('.');
        const parentKey = parts[0];
        const childKey = parts[1];

        if (Array.isArray(newItem[parentKey])) {
          newItem[parentKey] = newItem[parentKey].map(subItem => {
            const newSub = { ...subItem };
            const refId = newSub[childKey];
            if (refId) {
              const match = refData.find(r => String(r._id) === String(refId));
              if (match) {
                newSub[childKey] = { ...match };
                delete newSub[childKey].password;
              }
            }
            return newSub;
          });
        }
      }
      return newItem;
    });

    return this;
  }

  sort(options) {
    if (!options) return this;
    
    let key = '';
    let direction = -1; // default descending

    if (typeof options === 'string') {
      if (options.startsWith('-')) {
        key = options.substring(1);
        direction = -1;
      } else {
        key = options;
        direction = 1;
      }
    } else if (typeof options === 'object') {
      key = Object.keys(options)[0];
      direction = options[key];
    }

    if (key) {
      // Ensure plain objects
      this.data = this.data.map(item => {
        return typeof item.toObject === 'function' ? item.toObject({ getters: true, virtuals: false }) : { ...item };
      });

      this.data.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (key === 'createdAt') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (valA < valB) return -direction;
        if (valA > valB) return direction;
        return 0;
      });
    }
    return this;
  }

  limit(count) {
    this.data = this.data.slice(0, count);
    return this;
  }

  select(fields) {
    return this;
  }

  then(resolve, reject) {
    resolve(this.data);
  }
}

// Mock single result query helper
class MockSingleQuery {
  constructor(data) {
    this.data = data; // Already a Mongoose document or null
  }

  populate(options) {
    if (!this.data) return this;
    const plain = typeof this.data.toObject === 'function' ? this.data.toObject({ getters: true, virtuals: false }) : { ...this.data };
    const mq = new MockQuery('', [plain]);
    mq.populate(options);
    this.data = mq.data[0];
    return this;
  }

  select(fields) {
    return this;
  }

  then(resolve, reject) {
    resolve(this.data);
  }
}

// Master Function to wrap a Mongoose Model
function wrapModel(mongooseModel, collectionName) {
  // Override instance prototype .save() method
  mongooseModel.prototype.save = async function() {
    const allItems = readData(collectionName);
    
    // Hash password if this is a User and has a password
    if (mongooseModel.modelName === 'User' && this.password && !this.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const docId = String(this._id);
    const existingIdx = allItems.findIndex(item => String(item._id) === docId);
    
    const serialized = this.toObject({ getters: true, virtuals: false });
    serialized._id = docId; // preserve id string
    
    if (existingIdx !== -1) {
      allItems[existingIdx] = serialized;
    } else {
      allItems.push(serialized);
    }
    
    writeData(collectionName, allItems);
    return this;
  };

  // Override static query methods (returning instantiated mongoose documents)
  mongooseModel.find = function(query) {
    const all = readData(collectionName);
    const filtered = all.filter(item => matchQuery(item, query));
    
    const docs = filtered.map(item => {
      const doc = new mongooseModel(item);
      doc._isNew = false;
      return doc;
    });
    
    return new MockQuery(collectionName, docs);
  };

  mongooseModel.findOne = function(query) {
    const all = readData(collectionName);
    const found = all.find(item => matchQuery(item, query));
    
    if (found) {
      const doc = new mongooseModel(found);
      doc._isNew = false;
      return new MockSingleQuery(doc);
    }
    return new MockSingleQuery(null);
  };

  mongooseModel.findById = function(id) {
    const all = readData(collectionName);
    const found = all.find(item => String(item._id) === String(id));
    
    if (found) {
      const doc = new mongooseModel(found);
      doc._isNew = false;
      return new MockSingleQuery(doc);
    }
    return new MockSingleQuery(null);
  };

  mongooseModel.findOneAndUpdate = function(query, update, options = {}) {
    const all = readData(collectionName);
    const idx = all.findIndex(item => matchQuery(item, query));
    
    if (idx !== -1) {
      const updatedItem = { ...all[idx], ...update };
      if (update.$inc) {
        for (let key in update.$inc) {
          updatedItem[key] = (updatedItem[key] || 0) + update.$inc[key];
        }
        delete updatedItem.$inc;
      }
      all[idx] = updatedItem;
      writeData(collectionName, all);
      
      const doc = new mongooseModel(updatedItem);
      doc._isNew = false;
      return new MockSingleQuery(doc);
    }
    return new MockSingleQuery(null);
  };

  mongooseModel.findByIdAndUpdate = function(id, update, options = {}) {
    const query = { _id: id };
    return mongooseModel.findOneAndUpdate(query, update, options);
  };

  mongooseModel.countDocuments = function(query) {
    const all = readData(collectionName);
    const count = all.filter(item => matchQuery(item, query)).length;
    return Promise.resolve(count);
  };

  mongooseModel.deleteMany = function(query) {
    if (!query || Object.keys(query).length === 0) {
      writeData(collectionName, []);
    } else {
      const all = readData(collectionName);
      const remaining = all.filter(item => !matchQuery(item, query));
      writeData(collectionName, remaining);
    }
    return Promise.resolve({ deletedCount: 1 });
  };

  mongooseModel.findByIdAndDelete = function(id) {
    const all = readData(collectionName);
    const remaining = all.filter(item => String(item._id) !== String(id));
    writeData(collectionName, remaining);
    return Promise.resolve({ success: true });
  };

  mongooseModel.updateMany = function(query, update) {
    const all = readData(collectionName);
    let count = 0;
    const updated = all.map(item => {
      if (matchQuery(item, query)) {
        count++;
        return { ...item, ...update };
      }
      return item;
    });
    writeData(collectionName, updated);
    return Promise.resolve({ matchedCount: count, modifiedCount: count });
  };
}

// Main helper to swap mongoose models
function initializeJsonDbFallback() {
  console.log('Swapping Mongoose models with Local JSON Database driver...');
  
  const User = require('../models/user');
  const ArtisanProfile = require('../models/artisanProfile');
  const Product = require('../models/product');
  const Order = require('../models/order');
  const Review = require('../models/review');

  wrapModel(User, 'users');
  wrapModel(ArtisanProfile, 'artisanprofiles');
  wrapModel(Product, 'products');
  wrapModel(Order, 'orders');
  wrapModel(Review, 'reviews');

  console.log('JSON DB Mock wrapper initialized successfully.');
}

module.exports = { initializeJsonDbFallback };
