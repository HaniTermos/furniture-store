const pool = require('./db/pool');

async function checkProduct() {
  try {
    // Get product ID
    const { rows: [product] } = await pool.query(
      "SELECT id, name, slug FROM products WHERE slug = 'cloud-armchair'"
    );
    
    if (!product) {
      console.log('Product not found');
      return;
    }
    
    console.log('Product:', product);
    
    // Check configuration_options (old system)
    const { rows: configOptions } = await pool.query(`
      SELECT co.id, co.name, co.type, cv.id as value_id, cv.value, cv.price_adjustment, cv.stock_quantity
      FROM configuration_options co
      LEFT JOIN configuration_values cv ON cv.option_id = co.id
      WHERE co.product_id = $1
    `, [product.id]);
    
    console.log('\n=== Configuration Options (Old System) ===');
    console.log(configOptions);
    
    // Check product_attributes (new system)
    const { rows: prodAttrs } = await pool.query(`
      SELECT pa.*, a.name, a.type
      FROM product_attributes pa
      JOIN attributes a ON a.id = pa.attribute_id
      WHERE pa.product_id = $1
    `, [product.id]);
    
    console.log('\n=== Product Attributes (New System) ===');
    console.log(prodAttrs);
    
    // Check variants (new system)
    const { rows: variants } = await pool.query(`
      SELECT pv.*, va.attribute_id, va.option_id, ao.value as option_value
      FROM product_variants pv
      LEFT JOIN variant_attributes va ON va.variant_id = pv.id
      LEFT JOIN attribute_options ao ON ao.id = va.option_id
      WHERE pv.product_id = $1
    `, [product.id]);
    
    console.log('\n=== Product Variants (New System) ===');
    console.log(variants);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkProduct();
