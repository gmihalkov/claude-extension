const products = [
  { name: 'Desk lamp', price: 30 },
  { name: 'Floor lamp', price: 80 },
  { name: 'Office chair', price: 150 },
  { name: 'Bookshelf', price: 120 },
];

const list = document.getElementById('products');

for (const product of products) {
  const item = document.createElement('li');
  item.textContent = `${product.name} — $${product.price}`;
  list.append(item);
}
