const product = document.querySelector('#product');
const thesis = document.querySelector('.thesis');
const nav = document.querySelector('nav');
const primaryCta = document.querySelector('.hero-actions .primary');

if (product && thesis) thesis.before(product);

if (nav && !nav.querySelector('a[href="#product"]')) {
  const link = document.createElement('a');
  link.href = '#product';
  link.textContent = 'Product';
  nav.prepend(link);
}

if (primaryCta) {
  primaryCta.href = '#product';
  primaryCta.textContent = 'See the product vision';
}
